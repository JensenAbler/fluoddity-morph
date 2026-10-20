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
 *   - IT COMMITS TO A DIRECTION, WITH MOMENTUM (after Tunnel Evolve's
 *     spring system). A single TARGET POINT glides along the line between two
 *     favorites -- the focus and another -- at a steady pace, running past
 *     both ends as `exploration` rises, turning back or onto a new line when
 *     it reaches an end. Every gene is a critically damped SPRING chasing that
 *     moving point: velocity carries through every change of target, so
 *     nothing ever snaps, stops and starts. Slow genes lag far behind the
 *     point, fast ones track it closely; the whole creature heads the same
 *     way. (Earlier versions eased each gene between independent waypoints --
 *     zero velocity at every one -- which read as hesitant.)
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

export type GeneFamily = 'rule' | 'physics' | 'color' | 'trail';

/**
 * One gene: something that moves on ONE clock. Either a rule Fourier center
 * (8 floats) or a group of settings.
 *
 * THE PHYSICS SETTINGS ARE ONE GENE. The log showed the freezes: gain and drag
 * raced toward Pebbles (which keeps little velocity and makes up for it with a
 * big force) while force -- on a slower clock -- was still near Indigo's small
 * value. Sensor, force and drag only work in the combinations real creatures
 * use them, so they now travel together, staying on the line between two
 * working presets instead of mixing one preset's drag with another's force.
 */
interface GeneDef {
  readonly label: string;
  readonly family: GeneFamily;
  /** Index of the first rule float, for a rule gene. */
  readonly ruleStart: number | null;
  /** The settings this gene carries, for a settings gene. */
  readonly fields: readonly ScalarSpec[];
}

const field = (name: string): ScalarSpec => SCALARS.find((x) => x.field === name)!;

export const GENES: readonly GeneDef[] = [
  ...Array.from({ length: RULE_GENES }, (_, i) => ({
    label: `rule ${i + 1}`,
    family: 'rule' as const,
    ruleStart: i * FLOATS_PER_CENTER,
    fields: [],
  })),
  {
    label: 'physics',
    family: 'physics',
    ruleStart: null,
    fields: SCALARS.filter((x) => x.family === 'sensor' || x.family === 'force'),
  },
  { label: 'hue amt', family: 'color', ruleStart: null, fields: [field('colorSensitivity')] },
  { label: 'hue', family: 'color', ruleStart: null, fields: [field('colorOffset')] },
  { label: 'persist', family: 'trail', ruleStart: null, fields: [field('trailPersistence')] },
  { label: 'diffuse', family: 'trail', ruleStart: null, fields: [field('trailDiffusion')] },
];

export const GENE_COUNT = GENES.length;

export function geneFamily(i: number): GeneFamily {
  return GENES[i]!.family;
}
export function geneLabel(i: number): string {
  return GENES[i]!.label;
}

/** Read a setting from the config or the world. */
function readField(project: Project, spec: ScalarSpec): number {
  const record = (spec.source === 'config' ? project.configs[0]! : project.world) as unknown as Record<
    string,
    number
  >;
  return record[spec.field] ?? 0;
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
  /**
   * 0..1: how far targets range from the favorites. 0 = exactly a favorite;
   * 0.5 = anywhere between two favorites; 1 = up to half as far again past
   * either one.
   */
  exploration: number;
  /** Seconds the focus favorite holds before the drift turns toward another. */
  focusSeconds: number;
  /** Seconds for the target point to glide from one favorite to the other. */
  strideSeconds: number;
  /**
   * Seconds for colors to settle on a new favorite's palette. Color follows
   * the FOCUS favorite on this slow clock, not the moving line -- the log had
   * "worn out from how fast and often the color changes".
   */
  colorSeconds: number;
}

export const DEFAULT_SETTINGS: EvolveSettings = {
  // Quick enough to SEE on first press: the rule genes (glacial in the layered
  // arrangement) take ~25s to reach a favorite rather than over a minute.
  minSeconds: 3,
  maxSeconds: 30,
  skew: 0,
  mode: 'fluid',
  fluidSeconds: 120,
  // 1: every gene follows the shared line. The log read lower values as
  // mosaics that never commit; recombination is still a slider away.
  coherence: 1,
  ruleWander: 0.1,
  settingWander: 0.03,
  exploration: 0.6,
  focusSeconds: 45,
  strideSeconds: 25,
  colorSeconds: 240,
};

/** While cold, the target point moves this many times faster -- out of the freeze. */
const COLD_SPEEDUP = 3;
/** Cold this long and the drift turns around, back toward where it was alive. */
const COLD_TURN_SECONDS = 8;

/** The phase-field arrangement: rule glacial, sensors slow, forces medium, color fast. */
export function layeredRanks(): number[] {
  const byFamily: Record<GeneFamily, number> = {
    rule: 0.7,
    physics: 0.55,
    trail: 0.6,
    color: 0.9,
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

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** A gene's value as a flat vector (8 floats for a rule center, one per setting otherwise). */
export function geneOf(project: Project, i: number): number[] {
  const gene = GENES[i]!;
  if (gene.ruleStart !== null) {
    const start = gene.ruleStart;
    return project.configs[0]!.rule.slice(start, start + FLOATS_PER_CENTER).map((v) => v ?? 0);
  }
  return gene.fields.map((spec) => readField(project, spec));
}

/** Clamp each component of a settings gene to its slider range. */
function clampGene(i: number, x: number[], v?: number[]): void {
  const gene = GENES[i]!;
  gene.fields.forEach((spec, k) => {
    if (x[k]! < spec.lo || x[k]! > spec.hi) {
      x[k] = clamp(x[k]!, spec.lo, spec.hi);
      if (v !== undefined) v[k] = 0;
    }
  });
}

/**
 * Weighted pick by likes. ♥0 MUTES an attractor: it stays in the list but is
 * never chosen (unless everything is muted, when the pick falls back to even).
 */
export function pickAttractor(pool: readonly Attractor[], rng: Rng): Attractor | null {
  if (pool.length === 0) return null;
  const weight = (a: Attractor): number => Math.max(0, a.likes);
  const total = pool.reduce((s, a) => s + weight(a), 0);
  if (total <= 0) return pool[Math.floor(rng() * pool.length)] ?? null;
  let r = rng() * total;
  for (const a of pool) {
    const w = weight(a);
    if (w <= 0) continue;
    r -= w;
    if (r <= 0) return a;
  }
  for (let i = pool.length - 1; i >= 0; i--) if (weight(pool[i]!) > 0) return pool[i]!;
  return null;
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
  /** Where the gene is. */
  x: number[];
  /** How fast it is moving (units per second) -- carried through every retarget. */
  v: number[];
  /**
   * The wander offset, eased toward `offsetGoal` (re-rolled per line) so a
   * new line never makes the target jump.
   */
  offset: number[];
  offsetGoal: number[];
  /** The pair this gene follows, when it is not following the shared one. */
  own: { a: Attractor; b: Attractor } | null;
}

/** Color genes never run faster than this rank: hue sweeps read as flicker. */
const COLOR_MIN_RANK = 0.85;
/** Critical damping: no overshoot of a still target, and no sloshing. */
const DAMPING_RATIO = 1;

/** Euclidean distance between two rules, each float scaled by the pool spread. */
export function ruleDistance(
  a: readonly number[],
  b: readonly number[],
  spread: readonly number[],
): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = ((a[i] ?? 0) - (b[i] ?? 0)) / (spread[i] ?? 1);
    sum += d * d;
  }
  return Math.sqrt(sum / Math.max(1, a.length));
}

export interface EvolveView {
  readonly running: boolean;
  /** Measured motion relative to this run's recent peak, and whether it is cold. */
  readonly temperature: number;
  readonly cold: boolean;
  readonly attractors: readonly { key: number; name: string; likes: number }[];
  /** The favorite the drift is currently centred on. */
  readonly focusKey: number;
  readonly focusName: string;
  /** Nearest attractor to the live rule, and how far (in pool-spread units). */
  readonly nearestName: string;
  readonly nearestDistance: number;
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
  /** The shared line the target point glides along, and where on it it is. */
  private pair: { a: Attractor; b: Attractor } | null = null;
  private w = 0;
  private direction = 1;
  private lastSpread: number[] = [];
  /** Measured motion, from the Orchestrator's temperature probe. */
  private temperature = { relative: 1, cold: false, coldFor: 0 };
  /** Whether this cold spell has already turned the drift around. */
  private turnedThisSpell = false;
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

  /** The range the target point may roam along a line, from `exploration`. */
  private span(): { lo: number; hi: number } {
    const e = clamp(this.settings.exploration, 0, 1);
    // e=0: pinned to the focus favorite. e=0.5: the whole line A..B.
    // e=1: half as far again past both ends.
    return { lo: -Math.max(0, e - 0.5), hi: Math.min(1, 2 * e) + Math.max(0, e - 0.5) };
  }

  private otherThan(a: Attractor): Attractor {
    let b = pickAttractor(this.pool, this.rng) ?? a;
    for (let tries = 0; tries < 8 && this.pool.length > 1 && b.key === a.key; tries++) {
      b = pickAttractor(this.pool, this.rng) ?? a;
    }
    return b;
  }

  /**
   * Start a new line and give genes fresh offsets. Without `from`, it runs
   * from the focus favorite to another. With `from` -- the favorite the point
   * just reached -- the journey CHAINS: it carries on from there toward the
   * focus (or, if it is already at the focus, toward someone new), so one trip
   * flows into the next instead of jumping back to a start.
   */
  private newLine(spread: readonly number[], from?: Attractor): void {
    let a: Attractor | null;
    let b: Attractor;
    if (from === undefined) {
      a = this.focus ?? pickAttractor(this.pool, this.rng);
      if (a === null) return;
      b = this.otherThan(a);
      this.w = this.span().lo;
    } else {
      a = from;
      b = this.focus !== null && this.focus.key !== from.key ? this.focus : this.otherThan(from);
      this.w = 0;
    }
    this.pair = { a, b };
    this.direction = 1;
    this.genes.forEach((g, i) => {
      // Low coherence: some genes follow a line of their own (recombination).
      g.own =
        this.rng() < this.settings.coherence
          ? null
          : (() => {
              const oa = pickAttractor(this.pool, this.rng) ?? a;
              return { a: oa, b: this.otherThan(oa) };
            })();
      g.offsetGoal = this.offsetFor(i, spread);
    });
  }

  private offsetFor(i: number, spread: readonly number[]): number[] {
    const gene = GENES[i]!;
    if (gene.ruleStart !== null) {
      const start = gene.ruleStart;
      return Array.from(
        { length: FLOATS_PER_CENTER },
        (_, k) => this.settings.ruleWander * spread[start + k]! * gaussian(this.rng),
      );
    }
    // One draw for the whole group, scaled per setting: the group shifts as a
    // piece rather than each setting jittering its own way.
    const n = gaussian(this.rng);
    return gene.fields.map((spec) => this.settings.settingWander * (spec.hi - spec.lo) * n);
  }

  /** Feed in the latest measured temperature (see `telemetry/temperature.ts`). */
  setTemperature(t: { relative: number; cold: boolean; coldFor: number }): void {
    this.temperature = { relative: t.relative, cold: t.cold, coldFor: t.coldFor };
    if (!t.cold) this.turnedThisSpell = false;
  }

  /** Where gene `i` is being pulled right now. */
  private targetOf(i: number, g: GeneState): number[] {
    // COLOR follows the focus favorite alone, not the line between two.
    if (GENES[i]!.family === 'color' && this.focus !== null) {
      const t = geneOf(this.focus.project, i).map((v, k) => v + (g.offset[k] ?? 0));
      clampGene(i, t);
      return t;
    }
    const pair = g.own ?? this.pair;
    if (pair === null) return g.x;
    const ga = geneOf(pair.a.project, i);
    const gb = geneOf(pair.b.project, i);
    // EXPLORATION PAST THE ENDS IS FOR THE RULE ONLY. Physics settings stay
    // within the range the two favorites actually use: extrapolating drag or
    // force past a preset's value is how the particles were driven into a dead
    // stop (drag toward 0 keeps no velocity; force toward 0 pushes nothing).
    const w = GENES[i]!.ruleStart !== null ? this.w : clamp(this.w, 0, 1);
    const t = ga.map((v, k) => v + w * (gb[k]! - v) + (g.offset[k] ?? 0));
    clampGene(i, t);
    return t;
  }

  /** Effective speed rank for gene `i` (color is held slow). */
  private rankOf(i: number): number {
    const r = this.ranks[i]!;
    return geneFamily(i) === 'color' ? Math.max(r, COLOR_MIN_RANK) : r;
  }

  /** Start from `project` (or a favorite) and begin drifting. */
  start(from: Project | null): boolean {
    if (this.pool.length === 0) return false;
    const origin = from ?? pickAttractor(this.pool, this.rng)!.project;
    this.base = origin;
    this.genes = Array.from({ length: GENE_COUNT }, (_, i) => {
      const x = geneOf(origin, i);
      return { x, v: x.map(() => 0), offset: x.map(() => 0), offsetGoal: x.map(() => 0), own: null };
    });
    this.focus = null;
    this.nextFocus();
    this.newLine(this.ruleSpread());
    this.running = true;
    return true;
  }

  /** Turn the drift toward another favorite (never the same one twice running). */
  private nextFocus(): void {
    const previous = this.focus;
    let next = pickAttractor(this.pool, this.rng);
    for (let tries = 0; tries < 6 && this.pool.length > 1 && next?.key === previous?.key; tries++) {
      next = pickAttractor(this.pool, this.rng);
    }
    this.focus = next;
    this.focusClock = 0;
  }

  stop(): void {
    this.running = false;
  }

  /** Advance the target point and every spring by `dt` seconds; return the project to show. */
  step(dt: number): Project | null {
    if (!this.running || this.base === null || this.pool.length === 0) return null;
    const s = this.settings;
    const spread = this.ruleSpread();
    this.lastSpread = spread;

    this.focusClock += dt;
    let focusChanged = false;
    if (this.focusClock >= s.focusSeconds) {
      this.nextFocus();
      focusChanged = true;
    }

    // Fluid mode: every rank random-walks (mean-reverting, reflecting at 0/1).
    if (s.mode === 'fluid' && s.fluidSeconds > 0) {
      const k = dt / s.fluidSeconds;
      this.ranks = this.ranks.map((r) => {
        let next = r + 0.3 * (0.5 - r) * k + Math.sqrt(k) * 0.35 * gaussian(this.rng);
        if (next < 0) next = -next;
        if (next > 1) next = 2 - next;
        return clamp(next, 0, 1);
      });
    }

    // THE TARGET POINT glides at a steady pace along its line. At an end it
    // either turns back (momentum kept, direction flipped) or -- if the focus
    // has moved on, or by chance -- sets off along a new line.
    const { lo, hi } = this.span();
    if (this.pair === null) this.newLine(spread);
    // COLD: the particles have gone still. Hurry through rather than linger,
    // and if it stays cold, turn back toward where it was alive.
    const cold = this.temperature.cold;
    if (cold && this.temperature.coldFor > COLD_TURN_SECONDS && !this.turnedThisSpell) {
      this.direction = -this.direction;
      this.turnedThisSpell = true;
    }
    const pace = cold ? COLD_SPEEDUP : 1;
    if (hi > lo) {
      this.w += (pace * this.direction * (hi - lo) * dt) / Math.max(1, s.strideSeconds);
      if (this.w > hi || this.w < lo) {
        if (focusChanged || this.rng() < 0.5) {
          const reached = this.pair === null ? undefined : this.direction > 0 ? this.pair.b : this.pair.a;
          this.newLine(spread, reached);
        } else {
          this.w = clamp(this.w, lo, hi);
          this.direction = -this.direction;
        }
      }
    } else {
      this.w = lo;
      if (focusChanged) this.newLine(spread);
    }

    // EVERY GENE IS A SPRING chasing the point. Critically damped, so a still
    // target is reached without overshoot; velocity carries through every move
    // of the target, so the creature never stops to think.
    // Offsets glide toward their goals over about half a stride.
    const ease = 1 - Math.exp(-dt / Math.max(0.5, s.strideSeconds * 0.5));
    this.genes.forEach((g, i) => {
      for (let k = 0; k < g.offset.length; k++) {
        g.offset[k] = g.offset[k]! + ((g.offsetGoal[k] ?? 0) - g.offset[k]!) * ease;
      }
      const target = this.targetOf(i, g);
      const omega =
        GENES[i]!.family === 'color'
          ? 3 / Math.max(5, s.colorSeconds)
          : (3 / durationFor(this.rankOf(i), s)) * (cold ? COLD_SPEEDUP : 1);
      const steps = Math.max(1, Math.ceil((omega * dt) / 0.2));
      const h = dt / steps;
      for (let n = 0; n < steps; n++) {
        for (let k = 0; k < g.x.length; k++) {
          const a = omega * omega * (target[k]! - g.x[k]!) - 2 * DAMPING_RATIO * omega * g.v[k]!;
          g.v[k] = g.v[k]! + a * h;
          g.x[k] = g.x[k]! + g.v[k]! * h;
        }
      }
      clampGene(i, g.x, g.v);
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
      const gene = GENES[i]!;
      if (gene.ruleStart !== null) {
        const start = gene.ruleStart;
        g.x.forEach((v, k) => {
          rule[start + k] = v;
        });
      } else {
        gene.fields.forEach((spec, k) => {
          (spec.source === 'config' ? config : world)[spec.field] = g.x[k]!;
        });
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

  /** The attractor whose rule is closest to the live one. */
  private nearest(): { nearestName: string; nearestDistance: number } {
    const live = this.current();
    if (live === null || this.pool.length === 0) return { nearestName: '', nearestDistance: 0 };
    const spread = this.lastSpread.length > 0 ? this.lastSpread : this.ruleSpread();
    const rule = live.configs[0]!.rule;
    let best = { nearestName: '', nearestDistance: Infinity };
    for (const a of this.pool) {
      const d = ruleDistance(rule, a.project.configs[0]!.rule, spread);
      if (d < best.nearestDistance) best = { nearestName: a.name, nearestDistance: d };
    }
    return best;
  }

  /** The drift's internal position, for the telemetry log. */
  debug(): { a: string; b: string; w: number; dir: number; focus: string } {
    return {
      a: this.pair?.a.name ?? '',
      b: this.pair?.b.name ?? '',
      w: this.w,
      dir: this.direction,
      focus: this.focus?.name ?? '',
    };
  }

  view(): EvolveView {
    return {
      running: this.running,
      temperature: this.temperature.relative,
      cold: this.temperature.cold,
      ready: this.ready,
      attractors: this.pool.map(({ key, name, likes }) => ({ key, name, likes })),
      focusKey: this.focus?.key ?? -1,
      focusName: this.focus?.name ?? '',
      ...this.nearest(),
      ranks: this.ranks,
      // Per gene: how hard it is moving right now, as a fraction of its pace.
      progress:
        this.genes.length === GENE_COUNT
          ? this.genes.map((g, i) => {
              const gene = GENES[i]!;
              const speed = Math.sqrt(
                g.v.reduce((acc, v, k) => {
                  const range = gene.ruleStart !== null ? 1 : gene.fields[k]!.hi - gene.fields[k]!.lo;
                  return acc + (v / range) ** 2;
                }, 0),
              );
              const scale = 1;
              return clamp((speed * durationFor(this.rankOf(i), this.settings)) / scale, 0, 1);
            })
          : [],
      settings: { ...this.settings },
    };
  }
}
