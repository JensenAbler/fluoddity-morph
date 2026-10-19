/**
 * Auto-evolve: let the simulation wander through the space between the
 * creatures you have liked.
 *
 * A port of the idea behind `multi-phase-field.html`, re-cut for Fluoddity:
 *
 *   - THE ATTRACTOR POOL is your liked states, each weighted by its likes
 *     (the `slowWaveAttractor`-pushed-three-times trick, made explicit).
 *   - EVERY GENE HAS ITS OWN CLOCK. A gene is one of the rule's 10 Fourier
 *     centers (8 floats that move together) or one continuous setting. There
 *     are no fixed glacial/slow/fast layers: each gene has a SPEED RANK in
 *     [0,1] that maps onto a duration between `minSeconds` and `maxSeconds`.
 *   - THE SPEED DISTRIBUTION CAN BE STATIC (who is slow and who is fast is
 *     fixed) or FLUID (every rank random-walks on its own, much slower clock,
 *     so the sensor that was glacial can wake up and become the fast thing).
 *   - THE RULE IS ON A LEASH. Rule genes never random-walk freely -- that finds
 *     dead creatures. Each new rule target is some attractor's gene plus a
 *     small perturbation, so the creature only ever wanders between and just
 *     beyond things you liked. When `coherence` is high, genes tend to aim at
 *     the same attractor (whole-creature moves); when low, genes from
 *     different favorites recombine.
 *
 * Attractors are expected BAKED: mutation scale 0, the rule being the one the
 * particles actually obeyed (see `bake` in the Orchestrator). That keeps the
 * GPU's mutation -- seeded by hashing the rule itself, and so chaotic under
 * blending -- out of the picture entirely.
 *
 * Pure: no GPU, no DOM. `rng` is injectable for tests.
 */

import type { SimulationConfig, WorldSettings } from '../particleSystem/config.ts';
import { type Project, makeProject } from '../project/project.ts';

export const RULE_GENES = 10;
const FLOATS_PER_CENTER = 8;

/** A continuous setting that evolves, with its slider range (`settingsSpec.ts`). */
interface ScalarSpec {
  readonly field: string;
  readonly source: 'config' | 'world';
  readonly lo: number;
  readonly hi: number;
  readonly label: string;
  /** Rough family, for the "layers" speed preset and the gene chart's colors. */
  readonly family: 'sensor' | 'force' | 'color' | 'trail';
}

export const SCALARS: readonly ScalarSpec[] = [
  { field: 'sensorGain', source: 'config', lo: 0, hi: 8, label: 'gain', family: 'sensor' },
  { field: 'sensorAngle', source: 'config', lo: -1, hi: 1, label: 'angle', family: 'sensor' },
  { field: 'sensorDistance', source: 'config', lo: 0, hi: 5, label: 'distance', family: 'sensor' },
  { field: 'globalForceMult', source: 'config', lo: 0, hi: 1, label: 'force', family: 'force' },
  { field: 'drag', source: 'config', lo: 0, hi: 1, label: 'drag', family: 'force' },
  { field: 'strafePower', source: 'config', lo: 0, hi: 0.5, label: 'strafe', family: 'force' },
  { field: 'axialForce', source: 'config', lo: -2, hi: 2, label: 'axial', family: 'force' },
  { field: 'lateralForce', source: 'config', lo: -2, hi: 2, label: 'lateral', family: 'force' },
  { field: 'colorSensitivity', source: 'config', lo: -1, hi: 1, label: 'hue amt', family: 'color' },
  { field: 'colorOffset', source: 'config', lo: 0, hi: 1, label: 'hue', family: 'color' },
  { field: 'trailPersistence', source: 'world', lo: 0.5, hi: 0.999, label: 'persist', family: 'trail' },
  { field: 'trailDiffusion', source: 'world', lo: 0, hi: 1, label: 'diffuse', family: 'trail' },
];

export const GENE_COUNT = RULE_GENES + SCALARS.length;

export type GeneFamily = 'rule' | ScalarSpec['family'];
export function geneFamily(i: number): GeneFamily {
  return i < RULE_GENES ? 'rule' : SCALARS[i - RULE_GENES]!.family;
}
export function geneLabel(i: number): string {
  return i < RULE_GENES ? `rule ${i + 1}` : SCALARS[i - RULE_GENES]!.label;
}

export interface Attractor {
  readonly key: number;
  readonly name: string;
  /** Baked: one config at mutation scale 0. */
  readonly project: Project;
  readonly likes: number;
}

export type SpeedMode = 'static' | 'fluid';

export interface EvolveSettings {
  /** Seconds for the fastest gene to reach a new target. */
  minSeconds: number;
  /** Seconds for the slowest gene. */
  maxSeconds: number;
  /** -1..1: negative crowds genes toward fast, positive toward slow. */
  skew: number;
  mode: SpeedMode;
  /** Seconds-scale of the rank random walk in fluid mode. */
  fluidSeconds: number;
  /** 0..1: chance a gene aims at the shared focus attractor rather than its own pick. */
  coherence: number;
  /** Rule perturbation around attractors, in units of the pool's own spread. */
  ruleWander: number;
  /** Setting perturbation around attractors, as a fraction of slider range. */
  settingWander: number;
  /** Seconds between changes of the shared focus attractor. */
  focusSeconds: number;
}

export const DEFAULT_SETTINGS: EvolveSettings = {
  minSeconds: 6,
  maxSeconds: 75,
  skew: 0,
  mode: 'fluid',
  fluidSeconds: 120,
  coherence: 0.75,
  ruleWander: 0.15,
  settingWander: 0.04,
  focusSeconds: 40,
};

/** The phase-field arrangement: rule glacial, sensors slow, forces medium, color fast. */
export function layeredRanks(): number[] {
  const byFamily: Record<GeneFamily, number> = {
    rule: 0.92,
    sensor: 0.7,
    trail: 0.6,
    force: 0.45,
    color: 0.12,
  };
  return Array.from({ length: GENE_COUNT }, (_, i) => byFamily[geneFamily(i)]);
}

export type Rng = () => number;

function gaussian(rng: Rng): number {
  // Box-Muller; 1 - u keeps log away from 0.
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function smooth(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** A gene's value as a flat vector (8 floats for a rule center, 1 for a setting). */
export function geneOf(project: Project, i: number): number[] {
  const config = project.configs[0]!;
  if (i < RULE_GENES) {
    const start = i * FLOATS_PER_CENTER;
    return config.rule.slice(start, start + FLOATS_PER_CENTER).map((v) => v ?? 0);
  }
  const spec = SCALARS[i - RULE_GENES]!;
  const record = (spec.source === 'config' ? config : project.world) as unknown as Record<
    string,
    number
  >;
  return [record[spec.field] ?? 0];
}

/** Weighted pick by likes (minimum weight 1 so a fresh like still counts). */
export function pickAttractor(pool: readonly Attractor[], rng: Rng): Attractor | null {
  if (pool.length === 0) return null;
  const total = pool.reduce((s, a) => s + Math.max(1, a.likes), 0);
  let r = rng() * total;
  for (const a of pool) {
    r -= Math.max(1, a.likes);
    if (r <= 0) return a;
  }
  return pool[pool.length - 1]!;
}

/** Map a speed rank onto seconds, honoring min/max and skew. */
export function durationFor(rank: number, s: EvolveSettings): number {
  const lo = Math.max(0.5, Math.min(s.minSeconds, s.maxSeconds));
  const hi = Math.max(lo, Math.max(s.minSeconds, s.maxSeconds));
  // skew in [-1,1] -> exponent in [1/4, 4]; positive pushes ranks up (slower).
  const exponent = Math.pow(4, -clamp(s.skew, -1, 1));
  const r = Math.pow(clamp(rank, 0, 1), exponent);
  return lo * Math.pow(hi / lo, r);
}

interface GeneState {
  from: number[];
  to: number[];
  t: number;
  seconds: number;
}

export interface EvolveView {
  readonly running: boolean;
  readonly attractors: readonly { key: number; name: string; likes: number }[];
  /** The attractor most genes are currently aiming at. */
  readonly focusKey: number;
  /** Per gene: rank (0 fast .. 1 slow) and progress through its current move. */
  readonly ranks: readonly number[];
  readonly progress: readonly number[];
  readonly settings: Readonly<EvolveSettings>;
  readonly ready: boolean;
}

/**
 * The evolver. The Orchestrator owns one, feeds it the attractor pool, and
 * calls `step(dt)` each frame while running.
 */
export class Evolver {
  private pool: Attractor[] = [];
  private nextKey = 1;
  private genes: GeneState[] = [];
  private base: Project | null = null;
  private focus: Attractor | null = null;
  private focusClock = 0;
  readonly settings: EvolveSettings = { ...DEFAULT_SETTINGS };
  ranks: number[] = layeredRanks();
  running = false;
  /** False until the pool has been loaded and baked. */
  ready = false;
  private readonly rng: Rng;

  constructor(rng: Rng = Math.random) {
    this.rng = rng;
  }

  get attractors(): readonly Attractor[] {
    return this.pool;
  }

  setPool(entries: readonly { name: string; project: Project; likes: number }[]): void {
    this.pool = entries.map((e) => ({ ...e, key: this.nextKey++ }));
    if (this.focus !== null && !this.pool.some((a) => a.key === this.focus!.key)) this.focus = null;
  }

  add(name: string, project: Project, likes = 1): Attractor {
    const a: Attractor = { key: this.nextKey++, name, project, likes };
    this.pool.push(a);
    return a;
  }

  remove(key: number): void {
    this.pool = this.pool.filter((a) => a.key !== key);
    if (this.focus?.key === key) this.focus = null;
    if (this.pool.length === 0) this.running = false;
  }

  setLikes(key: number, likes: number): void {
    this.pool = this.pool.map((a) =>
      a.key === key ? { ...a, likes: Math.max(0, Math.round(likes)) } : a,
    );
  }

  rename(key: number, name: string): void {
    this.pool = this.pool.map((a) => (a.key === key ? { ...a, name } : a));
  }

  byKey(key: number): Attractor | null {
    return this.pool.find((a) => a.key === key) ?? null;
  }

  shuffleRanks(): void {
    this.ranks = this.ranks.map(() => this.rng());
  }

  resetRanks(): void {
    this.ranks = layeredRanks();
  }

  /** The per-float spread of the rule across the pool -- the leash's unit length. */
  private ruleSpread(): number[] {
    const rules = this.pool.map((a) => a.project.configs[0]!.rule);
    const n = rules.length;
    return Array.from({ length: RULE_GENES * FLOATS_PER_CENTER }, (_, j) => {
      if (n < 2) return 0.05;
      const mean = rules.reduce((s, r) => s + (r[j] ?? 0), 0) / n;
      const variance = rules.reduce((s, r) => s + ((r[j] ?? 0) - mean) ** 2, 0) / (n - 1);
      return Math.max(0.01, Math.sqrt(variance));
    });
  }

  private target(i: number, spread: readonly number[]): number[] {
    const aim =
      this.focus !== null && this.rng() < this.settings.coherence
        ? this.focus
        : pickAttractor(this.pool, this.rng);
    if (aim === null) return this.genes[i]!.to;
    const g = geneOf(aim.project, i);
    if (i < RULE_GENES) {
      return g.map(
        (v, k) => v + this.settings.ruleWander * spread[i * FLOATS_PER_CENTER + k]! * gaussian(this.rng),
      );
    }
    const spec = SCALARS[i - RULE_GENES]!;
    const range = spec.hi - spec.lo;
    return [clamp(g[0]! + this.settings.settingWander * range * gaussian(this.rng), spec.lo, spec.hi)];
  }

  /** Start from `project` (or the focus attractor) and begin wandering. */
  start(from: Project | null): boolean {
    if (this.pool.length === 0) return false;
    this.focus = pickAttractor(this.pool, this.rng);
    this.focusClock = 0;
    const origin = from ?? this.focus!.project;
    this.base = origin;
    const spread = this.ruleSpread();
    this.genes = Array.from({ length: GENE_COUNT }, (_, i) => {
      const now = geneOf(origin, i);
      return { from: now, to: now, t: 1, seconds: 1 };
    });
    // Every gene picks a first target now, at its own pace.
    this.genes.forEach((g, i) => {
      g.to = this.target(i, spread);
      g.seconds = durationFor(this.ranks[i]!, this.settings) * (0.75 + 0.5 * this.rng());
      g.t = 0;
    });
    this.running = true;
    return true;
  }

  stop(): void {
    this.running = false;
  }

  /** Advance every clock by `dt` seconds and return the project to show. */
  step(dt: number): Project | null {
    if (!this.running || this.base === null || this.pool.length === 0) return null;
    const s = this.settings;
    const spread = this.ruleSpread();

    // The shared focus drifts between favorites on its own clock.
    this.focusClock += dt;
    if (this.focusClock >= s.focusSeconds) {
      this.focusClock = 0;
      this.focus = pickAttractor(this.pool, this.rng);
    }

    // Fluid mode: every rank random-walks (mean-reverting, reflecting at 0/1).
    if (s.mode === 'fluid' && s.fluidSeconds > 0) {
      const k = dt / s.fluidSeconds;
      this.ranks = this.ranks.map((r) => {
        let next = r + 0.3 * (0.5 - r) * k + Math.sqrt(k) * 0.45 * gaussian(this.rng);
        if (next < 0) next = -next;
        if (next > 1) next = 2 - next;
        return clamp(next, 0, 1);
      });
    }

    this.genes.forEach((g, i) => {
      g.t += dt / Math.max(0.1, g.seconds);
      if (g.t >= 1) {
        g.from = g.to;
        g.to = this.target(i, spread);
        g.seconds = durationFor(this.ranks[i]!, s) * (0.75 + 0.5 * this.rng());
        g.t = 0;
      }
    });
    return this.current();
  }

  /** The blended project right now, built on the base's discrete settings. */
  current(): Project | null {
    if (this.base === null) return null;
    const baseConfig = this.base.configs[0]!;
    const rule = baseConfig.rule.slice();
    const config: Record<string, unknown> = { ...baseConfig };
    const world: Record<string, unknown> = { ...this.base.world };
    this.genes.forEach((g, i) => {
      const u = smooth(g.t);
      const value = g.from.map((v, k) => v + (g.to[k]! - v) * u);
      if (i < RULE_GENES) {
        value.forEach((v, k) => {
          rule[i * FLOATS_PER_CENTER + k] = v;
        });
      } else {
        const spec = SCALARS[i - RULE_GENES]!;
        (spec.source === 'config' ? config : world)[spec.field] = value[0]!;
      }
    });
    config['rule'] = rule;
    // Baked attractors: no mutation, one cohort, so what blends is what shows.
    config['mutationScale'] = 0;
    config['cohorts'] = 1;
    return makeProject({
      configs: [config as unknown as SimulationConfig],
      world: world as unknown as WorldSettings,
      name: 'Evolving',
    });
  }

  view(): EvolveView {
    return {
      running: this.running,
      ready: this.ready,
      attractors: this.pool.map(({ key, name, likes }) => ({ key, name, likes })),
      focusKey: this.focus?.key ?? -1,
      ranks: this.ranks,
      progress: this.genes.length === GENE_COUNT ? this.genes.map((g) => g.t) : [],
      settings: { ...this.settings },
    };
  }
}
