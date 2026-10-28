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
  readonly family: 'sensor' | 'force' | 'color' | 'trail' | 'mutation';
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
  // How big each cohort's twist on the rule is. Carried so multi-cohort saves
  // keep their spread of behaviours; the twists themselves are steady while
  // evolving (a negative seed -- see `current` and `rule.wgsl`).
  { field: 'mutationScale', source: 'config', lo: 0, hi: 1, label: 'mutation', family: 'mutation' },
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
  { label: 'mutation', family: 'rule', ruleStart: null, fields: [field('mutationScale')] },
];

export const GENE_COUNT = GENES.length;
const MUTATION_GENE = GENES.findIndex((g) => g.label === 'mutation');
/**
 * Path mode: how far either side of a leg's midpoint (as a fraction of the
 * leg's time) the cohort twists take to melt away and to come back when the
 * cohort count changes. 0.2 = 40% of the leg, 10 s at the default stride.
 */
const COHORT_MELT_HALF_WIDTH = 0.2;
/** Breathe mode: a big breath lasts this many ordinary breaths. */
const BIG_BREATH_STRETCH = 1.5;
/** Breathe mode: seconds of stillness on the way up that top a breath out. */
const BREATH_TOPOUT_COLD_SECONDS = 1;
/** Breathe mode: fraction of a breath cohort colour takes to fade out / in. */
const BREATH_COLOR_FADE = 0.15;
/**
 * [rule gene, float within it] of the six rule floats `mutate_rule` hashes a
 * save's twist seed from: centers[4].frequency.xy, centers[7].amplitude.yx,
 * centers[1].frequency.zw (each center is frequency(4) then amplitude(4)).
 */
const HASH_LANES: readonly (readonly [number, number])[] = [
  [4, 0], [4, 1], [7, 5], [7, 4], [1, 2], [1, 3],
];

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

/**
 * A creature's PHYSICS FAMILY: which way its sideways push and its sensors
 * point, and whether it has a forward engine at all.
 *
 * Presets cluster into a few such families, and blending in a straight line
 * between two families passes through ZERO for whatever flips sign: sensors
 * pointing dead ahead (can't steer), no sideways push, no engine. The telemetry
 * showed lines across families going cold 28% of the time against 9% within one
 * -- most freezes were the drift passing through those switched-off in-between
 * states. Within a family nothing changes sign, so a straight blend is safe.
 */
export function familyOf(project: Project): string {
  const c = project.configs[0]!;
  const sign = (v: number): string => (v > 0 ? '+' : v < 0 ? '-' : '0');
  const engine = Math.abs(c.axialForce) >= 0.06 ? 'E' : 'e';
  // TWO PHYSICS REGIMES OF THEIR OWN, past the slider ranges: negative drag
  // (Slower, Buttons, Torpedo) and gain far beyond the slider's 8 (Slower 17,
  // Dunes 144 -- the dozen saves just over 8 are not a different regime).
  const regime = `${c.drag < 0 ? 'D' : ''}${c.sensorGain > 12 ? 'G' : ''}`;
  return `${sign(c.lateralForce)}${sign(c.sensorAngle)}${engine}${regime}`;
}

/**
 * Path mode: half the width (as a fraction of the leg's time) of the jump
 * physics makes between two families. 0.05 = 10% of the leg, 2.5 s at the
 * default stride: the creature hops over the in-between physics rather than
 * lingering in it.
 */
const HOP_HALF_WIDTH = 0.05;

function hopEase(u: number): number {
  const t = clamp((u - 0.5 + HOP_HALF_WIDTH) / (2 * HOP_HALF_WIDTH), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Path mode's clamp: the slider range, WIDENED to take in both ends of the leg,
 * so a favorite whose physics lies past a slider (Slower's gain of 17) is
 * reached as it is, not squeezed into range.
 */
function clampPath(i: number, x: number[], a: readonly number[], b: readonly number[]): void {
  GENES[i]!.fields.forEach((spec, k) => {
    const lo = Math.min(spec.lo, a[k] ?? spec.lo, b[k] ?? spec.lo);
    const hi = Math.max(spec.hi, a[k] ?? spec.hi, b[k] ?? spec.hi);
    x[k] = clamp(x[k]!, lo, hi);
  });
}

export interface Attractor {
  readonly key: number;
  readonly name: string;
  /** Baked: one config at mutation scale 0. */
  readonly project: Project;
  readonly likes: number;
}

export type SpeedMode = 'static' | 'fluid';

/**
 * How the creature moves.
 *
 *   path   THE CREATURE WALKS THE PATH THE TARGET DRAWS. Like a finger drawing
 *          a line: every part of the creature travels together, straight from
 *          where it is to the next favorite, ARRIVES there exactly, and sets off
 *          for the next one in the same moment -- no waiting, no stopping. One
 *          leg takes `strideSeconds`.
 *   leash  The older design: each gene is a spring chasing a target point on
 *          its own clock. Momentum, but the target leaves each favorite before
 *          the slow genes catch up, so favorites are passed near, never reached.
 *   breathe  AN AUTOPILOT FOR VARIETY. Sit on one favorite and breathe its
 *          mutation slowly out (0 -> `breathPeak`) and back to 0; at 0 -- where
 *          every roll looks the same -- re-roll the mutations, and breathe out
 *          again into a fresh variation. Every `bigEvery` breaths, a big breath
 *          out to `bigPeak`: at its most staticky, glide to another favorite
 *          underneath, where the mutation hides the change, and breathe back
 *          down on the new one. Re-rolls and hops both happen unseen.
 */
export type MotionMode = 'path' | 'leash' | 'breathe';

export interface EvolveSettings {
  /** See `MotionMode`. */
  motion: MotionMode;
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
   * 0..1: chance that a change of focus jumps to a different physics family.
   * Within a family the drift blends freely; a jump is deliberate and quick.
   */
  familyHop: number;
  /**
   * 0..1, path mode: the S-curve of each leg. 0 = constant speed. Higher =
   * longer at each favorite, a quicker crossing between them (the middle is
   * the steep part), easing out of one favorite and into the next.
   */
  linger: number;
  /** Breathe mode: seconds for one ordinary breath out and back in. */
  breathSeconds: number;
  /** Breathe mode: how far an ordinary breath takes the mutation scale. */
  breathPeak: number;
  /** Breathe mode: how far a big breath -- the one that hops -- takes it. */
  bigPeak: number;
  /** Breathe mode: every how many breaths is a big one (0 = stay put). */
  bigEvery: number;
  /**
   * Seconds for colors to settle on a new favorite's palette. Color follows
   * the FOCUS favorite on this slow clock, not the moving line -- the log had
   * "worn out from how fast and often the color changes".
   */
  colorSeconds: number;
}

export const DEFAULT_SETTINGS: EvolveSettings = {
  motion: 'breathe',
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
  familyHop: 0.15,
  linger: 0.4,
  breathSeconds: 40,
  breathPeak: 0.5,
  bigPeak: 4,
  bigEvery: 4,
};

/**
 * Seconds for the physics to cross from one family to another on a hop. Short
 * on purpose: the switched-off states between families are passed THROUGH, a
 * scene change, never lingered in. The rule keeps blending at its own pace.
 */
const HOP_SECONDS = 2.5;

/** While cold, the target point moves this many times faster -- out of the freeze. */
const COLD_SPEEDUP = 3;
/** Cold this long and the drift turns around, back toward where it was alive. */
const COLD_TURN_SECONDS = 6;
/**
 * Still cold this long and the whole line is abandoned: a new one starts from
 * the favorite the drift was last WARM near. The third session had a line
 * (Pebbles > Rippler) frozen from end to end -- turning around only swept
 * back through more of the same.
 */
const COLD_ABANDON_SECONDS = 15;
/**
 * Seconds of attributed cold that halve a favorite's chance of being picked.
 * Learned per session: an endpoint the drift keeps freezing near gets visited
 * less, without anyone muting it by hand.
 */
const CHILL_HALF_SECONDS = 20;

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

/**
 * The S-curve a path-mode leg follows: how far along the leg the creature is
 * when `u` of the leg's TIME has passed. linger 0 is a straight line; higher
 * values flatten both ends (time spent near the favorites) and steepen the
 * middle. linger 0.4 spends about two-thirds of every leg within 10% of a
 * favorite.
 */
export function lingerEase(u: number, linger: number): number {
  const t = clamp(u, 0, 1);
  const p = 1 + 5 * clamp(linger, 0, 1);
  const a = Math.pow(t, p);
  const b = Math.pow(1 - t, p);
  return a + b === 0 ? t : a / (a + b);
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

/**
 * Weighted pick with an extra per-attractor factor (the evolver's learned
 * "chill" -- see `Evolver.weight`). Muted (♥0) attractors stay out.
 */
export function pickWeighted(
  pool: readonly Attractor[],
  rng: Rng,
  factor: (a: Attractor) => number,
): Attractor | null {
  if (pool.length === 0) return null;
  const weight = (a: Attractor): number => Math.max(0, a.likes) * factor(a);
  const total = pool.reduce((s, a) => s + weight(a), 0);
  if (total <= 0) return pickAttractor(pool, rng);
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

/**
 * The settings that cannot blend -- whole numbers and switches -- so they SWITCH
 * from one favorite's value to the next halfway along each leg (path mode) or
 * line (leash mode), in the quick middle of the crossing.
 */
interface Discrete {
  readonly cohorts: number;
  readonly initialConditions: number;
  readonly cohortFences: boolean;
  readonly colorByCohort: boolean;
}

function discreteOf(project: Project): Discrete {
  const c = project.configs[0]!;
  return {
    cohorts: c.cohorts,
    initialConditions: c.initialConditions,
    cohortFences: c.cohortFences,
    colorByCohort: c.colorByCohort,
  };
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
  /** `chill`: learned seconds of cold near this favorite this session. */
  readonly attractors: readonly { key: number; name: string; likes: number; chill: number }[];
  /** The favorite the drift is currently centred on. */
  readonly focusKey: number;
  readonly focusName: string;
  /** True while the current line is a deliberate hop between physics families. */
  readonly hopping: boolean;
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
  /** True when the current line crosses physics families (a deliberate hop). */
  private hopping = false;
  private w = 0;
  private direction = 1;
  /**
   * Path mode's current leg: from where the creature WAS when the leg began
   * (per gene) to the favorite `to`, `u` of the way along. `origin` is the
   * favorite it just arrived at, when the leg began at one.
   */
  private leg: {
    from: number[][];
    fromDiscrete: Discrete;
    /** How much cohort colour was showing when the leg began (see `cohortColor`). */
    fromCohortColor: number;
    to: Attractor;
    origin: Attractor | null;
    u: number;
  } | null = null;
  /** The cohort count, layout and cohort switches in force right now. */
  private discrete: Discrete = { cohorts: 1, initialConditions: 2, cohortFences: false, colorByCohort: false };
  /**
   * KEEP THE COHORTS YOU STARTED WITH. Steady twists (a negative seed) are
   * drawn differently from a save's own, so switching to them on the first
   * frame changed every cohort the moment Evolve began. Instead, while
   * `legacyTwists` is set the save's own seed stays in force, and the six rule
   * floats its twist seed is hashed from (`HASH_LANES`) are HELD at their
   * starting values (`hashHold`), so that seed -- and every cohort's twist --
   * holds steady while the rest of the rule moves. The first leg melts the
   * twists (as a cohort-count change does); at its midpoint, with every cohort
   * on the same rule, the switch to steady twists is invisible, and the held
   * floats are released over the leg's second half.
   */
  private legacyTwists = false;
  private hashHold: number[] | null = null;
  /** 0..1: how much of colour-by-cohort is showing (see `cohortColorMix`). */
  private cohortColor = 0;
  /** Breathe mode: the favorite being breathed on. */
  private home: Attractor | null = null;
  /**
   * Breathe mode's state. `t` runs 0..1 through one breath (mutation 0 at both
   * ends). `seed` is this breath's roll (steady twists, written negative);
   * `legacy` keeps the starting state's own seed until the first zero, so
   * pressing Evolve changes nothing. `next`/`from` are the glide of a hop;
   * `pending` the cohort count and layout that wait for the next zero, when
   * every cohort is identical and the re-deal is unseen; `colorIn` marks the
   * breath whose start fades cohort colour back in after such a change.
   */
  private breath = {
    t: 0,
    count: 0,
    big: false,
    seed: 0.5,
    legacy: false,
    next: null as Attractor | null,
    from: null as number[][] | null,
    pending: null as Discrete | null,
    colorIn: false,
    /** A big breath that topped out early descends from here, not the peak. */
    descentPeak: null as number | null,
  };

  /**
   * How much of colour-by-cohort the camera should show, 0..1: the evolver
   * fades it rather than switching it, so cohort colours never pop.
   */
  get cohortColorMix(): number {
    return this.cohortColor;
  }
  private lastSpread: number[] = [];
  /** Measured motion, from the Orchestrator's temperature probe. */
  private temperature = { relative: 1, cold: false, coldFor: 0 };
  /** Whether this cold spell has already turned the drift around / abandoned the line. */
  private turnedThisSpell = false;
  private abandonedThisSpell = false;
  /** Learned cold, in seconds, attributed to each favorite (by key). */
  private readonly chill = new Map<number, number>();
  /** The favorite the drift was last near while clearly warm. */
  private warmAnchor: Attractor | null = null;
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

  /** Another favorite -- in `a`'s physics family when there is one to be had. */
  private otherThan(a: Attractor, sameFamily = true): Attractor {
    const fam = familyOf(a.project);
    const kin = sameFamily
      ? this.pool.filter((x) => x.key !== a.key && familyOf(x.project) === fam)
      : [];
    if (kin.length > 0) {
      return pickWeighted(kin, this.rng, (x) => this.weight(x)) ?? kin[0]!;
    }
    let b = this.pick() ?? a;
    for (let tries = 0; tries < 8 && this.pool.length > 1 && b.key === a.key; tries++) {
      b = this.pick() ?? a;
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
      a = this.focus ?? this.pick();
      if (a === null) return;
      b = this.otherThan(a);
      this.w = this.span().lo;
    } else {
      a = from;
      b = this.focus !== null && this.focus.key !== from.key ? this.focus : this.otherThan(from);
      this.w = 0;
    }
    this.pair = { a, b };
    this.hopping = familyOf(a.project) !== familyOf(b.project);
    this.direction = 1;
    this.genes.forEach((g, i) => {
      // Low coherence: some genes follow a line of their own (recombination).
      g.own =
        this.rng() < this.settings.coherence
          ? null
          : (() => {
              const oa = this.pick() ?? a;
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
    // Mutation does not wander: a favorite with no twist should never grow one.
    return gene.fields.map((spec) =>
      spec.family === 'mutation' ? 0 : this.settings.settingWander * (spec.hi - spec.lo) * n,
    );
  }

  /** Feed in the latest measured temperature (see `telemetry/temperature.ts`). */
  setTemperature(t: { relative: number; cold: boolean; coldFor: number }): void {
    this.temperature = { relative: t.relative, cold: t.cold, coldFor: t.coldFor };
    if (!t.cold) {
      this.turnedThisSpell = false;
      this.abandonedThisSpell = false;
    }
  }

  /** Likes, discounted by learned chill. */
  private weight(a: Attractor): number {
    const chill = this.chill.get(a.key) ?? 0;
    return Math.pow(0.5, chill / CHILL_HALF_SECONDS);
  }

  private pick(): Attractor | null {
    return pickWeighted(this.pool, this.rng, (a) => this.weight(a));
  }

  /** The endpoint of the current line the target point is nearer to. */
  private nearerEnd(): Attractor | null {
    if (this.pair === null) return null;
    return this.w < 0.5 ? this.pair.a : this.pair.b;
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
    // ON A HOP, PHYSICS DOES NOT BLEND: it heads straight for the new family
    // (and gets there in HOP_SECONDS -- see the spring below).
    if (this.hopping && g.own === null && GENES[i]!.family === 'physics') {
      const t = geneOf(pair.b.project, i).map((v, k) => v + (g.offset[k] ?? 0));
      clampGene(i, t);
      return t;
    }
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
    const origin = from ?? this.pick()!.project;
    this.base = origin;
    this.discrete = discreteOf(origin);
    this.cohortColor = this.discrete.colorByCohort ? 1 : 0;
    {
      const c0 = origin.configs[0]!;
      const peak = Math.max(1e-6, this.settings.breathPeak);
      this.home = { key: -1, name: '(start)', project: origin, likes: 0 };
      this.breath = {
        // Start the breath where the starting state's mutation already is.
        t: Math.asin(Math.sqrt(clamp(c0.mutationScale / peak, 0, 1))) / Math.PI,
        count: 0,
        big: false,
        seed: Math.max(1e-3, Math.abs(c0.mutationSeed)),
        legacy: c0.mutationScale !== 0 && c0.mutationSeed >= 0,
        next: null,
        from: null,
        pending: null,
        colorIn: false,
        descentPeak: null,
      };
    }
    {
      const c = origin.configs[0]!;
      this.legacyTwists = this.settings.motion === 'path' && c.cohorts > 1 && c.mutationScale !== 0 && c.mutationSeed >= 0;
      this.hashHold = this.legacyTwists ? HASH_LANES.map(([gi, k]) => geneOf(origin, gi)[k]!) : null;
    }
    this.genes = Array.from({ length: GENE_COUNT }, (_, i) => {
      const x = geneOf(origin, i);
      return { x, v: x.map(() => 0), offset: x.map(() => 0), offsetGoal: x.map(() => 0), own: null };
    });
    this.focus = null;
    this.nextFocus();
    this.newLine(this.ruleSpread());
    this.leg = null;
    this.running = true;
    return true;
  }

  /**
   * Turn the drift toward another favorite (never the same one twice running).
   * Usually one in the CURRENT physics family; with chance `familyHop`, one in
   * another -- which makes the next line a deliberate hop.
   */
  private nextFocus(): void {
    const previous = this.focus;
    // Where the drift is now: the end of the line it is heading for, or -- at
    // the very start -- the family of whatever was on screen.
    const here =
      this.pair !== null
        ? familyOf((this.direction > 0 ? this.pair.b : this.pair.a).project)
        : this.base !== null
          ? familyOf(this.base)
          : null;
    const hop = here === null || this.rng() < this.settings.familyHop;
    const candidates = this.pool.filter(
      (x) => x.key !== previous?.key && (hop ? true : familyOf(x.project) === here),
    );
    const next =
      candidates.length > 0
        ? (pickWeighted(candidates, this.rng, (x) => this.weight(x)) ?? candidates[0]!)
        : this.pick();
    this.focus = next;
    this.focusClock = 0;
  }

  stop(): void {
    this.running = false;
  }

  /** Breathe mode's frame -- see `MotionMode`. */
  private stepBreathe(dt: number): Project | null {
    const s = this.settings;
    const b = this.breath;
    if (this.home === null) return null;
    const peak = b.big ? s.bigPeak : s.breathPeak;
    b.t += dt / (Math.max(5, s.breathSeconds) * (b.big ? BIG_BREATH_STRETCH : 1));

    // TOP OUT EARLY. If the particles go still on the way up, this breath has
    // gone as far as it should: turn around now and breathe down as if from
    // the top. An ordinary breath mirrors its phase (the same curve, back down
    // from exactly where it is); a big breath starts its descent -- the path to
    // the next favorite -- from the mutation it reached.
    if (b.t < 0.5 && this.temperature.cold && this.temperature.coldFor >= BREATH_TOPOUT_COLD_SECONDS) {
      if (b.big) {
        b.descentPeak = this.genes[MUTATION_GENE]!.x[0] ?? peak;
        b.t = 0.5;
      } else {
        b.t = 1 - b.t;
      }
    }

    // THE TOP OF A BIG BREATH: choose the next favorite. The way up stays on
    // this one; THE WAY DOWN IS A PATH -- every gene slides from where it is to
    // the next favorite along the same S-curve as a path leg, while the
    // mutation comes down along it from the peak to 0, so the new favorite
    // arrives as the noise clears instead of emerging from under it.
    if (b.big && b.next === null && b.from === null && b.t >= 0.5) {
      this.nextFocus();
      const next = this.focus !== null && this.focus !== this.home ? this.focus : this.otherThan(this.home);
      b.next = next;
      b.from = this.genes.map((g) => [...g.x]);
      this.hopping = familyOf(this.home.project) !== familyOf(next.project);
    }
    let descent: number | null = null;
    if (b.next !== null && b.from !== null && b.t < 1) {
      const u = clamp((b.t - 0.5) / 0.5, 0, 1);
      const e = lingerEase(u, s.linger);
      descent = e;
      const from = b.from;
      const next = b.next;
      this.genes.forEach((g, i) => {
        if (i === MUTATION_GENE) return;
        const to = geneOf(next.project, i);
        const ee = this.hopping && GENES[i]!.family === 'physics' ? hopEase(u) : e;
        g.x = from[i]!.map((a, j) => a + ee * ((to[j] ?? a) - a));
        clampPath(i, g.x, from[i]!, to);
      });
    }

    // ZERO: every cohort is identical, so re-roll and land any new favorite's
    // cohort count and layout -- both unseen.
    if (b.t >= 1) {
      b.t = Math.min(0.5, b.t - 1);
      b.count += 1;
      // The Nth breath is the big one: after N-1 zeros.
      b.big = s.bigEvery > 0 && (b.count + 1) % Math.round(s.bigEvery) === 0;
      b.seed = 1e-3 + this.rng() * 0.998;
      b.legacy = false;
      b.descentPeak = null;
      if (b.next !== null) {
        const next = b.next;
        this.genes.forEach((g, i) => {
          if (i !== MUTATION_GENE) g.x = geneOf(next.project, i);
        });
        this.home = next;
        const d = discreteOf(next.project);
        b.colorIn = d.cohorts !== this.discrete.cohorts || d.colorByCohort !== this.discrete.colorByCohort;
        this.discrete = d;
        b.next = null;
        b.from = null;
        this.hopping = false;
      }
    }

    const m = this.genes[MUTATION_GENE]!;
    m.x = [Math.max(0, descent !== null ? (b.descentPeak ?? peak) * (1 - descent) : peak * Math.sin(Math.PI * b.t) ** 2)];

    // Cohort colour fades out before a change of count or colour mode lands
    // at the zero, and back in after it.
    const target = this.discrete.colorByCohort ? 1 : 0;
    let cc = target;
    const p = b.next !== null ? discreteOf(b.next.project) : null;
    if (p !== null && (p.cohorts !== this.discrete.cohorts || p.colorByCohort !== this.discrete.colorByCohort)) {
      cc *= clamp((1 - b.t) / BREATH_COLOR_FADE, 0, 1);
    }
    if (b.colorIn) {
      cc = target * clamp(b.t / BREATH_COLOR_FADE, 0, 1);
      if (b.t >= BREATH_COLOR_FADE) b.colorIn = false;
    }
    this.cohortColor = cc;

    this.pair = { a: this.home, b: b.next ?? this.home };
    this.w = b.t;
    return this.current();
  }

  /**
   * Begin a path-mode leg toward `to`, starting EXACTLY where every gene is
   * now -- so a new leg, however it begins, never makes anything jump.
   */
  private startLeg(to: Attractor, origin: Attractor | null): void {
    const spread = this.ruleSpread();
    // Once steady twists are in force, held hash floats are just where they
    // are; a new leg starts from there like everything else.
    if (!this.legacyTwists) this.hashHold = null;
    this.leg = {
      from: this.genes.map((g) => [...g.x]),
      fromDiscrete: this.discrete,
      fromCohortColor: this.cohortColor,
      to,
      origin,
      u: 0,
    };
    this.genes.forEach((g, i) => {
      g.own = null;
      g.offsetGoal = this.offsetFor(i, spread);
      g.offset = [...g.offsetGoal];
    });
    // For the telemetry log and the panel, which read the line as a pair.
    this.pair = { a: origin ?? to, b: to };
    const here = origin?.project ?? this.current();
    this.hopping = here !== null && familyOf(here) !== familyOf(to.project);
    this.direction = 1;
    this.w = 0;
  }

  /**
   * Path mode's frame. Every gene sits ON the drawn path: a straight line from
   * the leg's start to its favorite, plus a wander bump that is zero at both
   * ends (so each favorite is reached exactly). On arrival the next leg starts
   * that same frame, toward the next favorite.
   */
  private stepPath(dt: number): Project | null {
    const s = this.settings;
    if (this.leg === null) {
      const first = this.focus ?? this.pick();
      if (first === null) return null;
      this.startLeg(first, null);
    }
    let leg = this.leg!;
    const cold = this.temperature.cold;

    // LEARN, as the leash does: blame the favorite being approached for cold,
    // and remember the favorite last reached or left while clearly warm.
    if (cold) {
      this.chill.set(leg.to.key, (this.chill.get(leg.to.key) ?? 0) + dt);
    } else if (this.temperature.relative > 0.5) {
      if (leg.u > 0.8) this.warmAnchor = leg.to;
      else if (leg.u < 0.2 && leg.origin !== null) this.warmAnchor = leg.origin;
    }
    if (cold && this.temperature.coldFor > COLD_ABANDON_SECONDS && !this.abandonedThisSpell) {
      // ABANDON: head, from right here, for where it was last alive.
      const anchor =
        this.warmAnchor !== null && this.pool.includes(this.warmAnchor) && this.warmAnchor !== leg.to
          ? this.warmAnchor
          : this.otherThan(leg.to);
      this.focus = anchor;
      this.startLeg(anchor, null);
      this.abandonedThisSpell = true;
      this.turnedThisSpell = true;
    } else if (cold && this.temperature.coldFor > COLD_TURN_SECONDS && !this.turnedThisSpell) {
      // TURN BACK toward the favorite this leg came from.
      if (leg.origin !== null) {
        this.focus = leg.origin;
        this.startLeg(leg.origin, null);
      }
      this.turnedThisSpell = true;
    }
    leg = this.leg!;

    const prev = this.genes.map((g) => [...g.x]);
    const u = leg.u + ((cold ? COLD_SPEEDUP : 1) * dt) / Math.max(1, s.strideSeconds);
    if (u >= 1) {
      // ARRIVED: every gene exactly on the favorite, then straight on.
      const arrived = leg.to;
      this.legacyTwists = false;
      this.hashHold = null;
      this.genes.forEach((g, i) => {
        g.x = geneOf(arrived.project, i);
      });
      this.nextFocus();
      this.startLeg(this.focus ?? arrived, arrived);
      leg = this.leg!;
      leg.u = Math.min(0.5, u - 1);
    } else {
      leg.u = u;
    }
    this.w = leg.u;

    const e = lingerEase(leg.u, s.linger);
    const bump = Math.sin(Math.PI * e);
    this.discrete = e < 0.5 ? leg.fromDiscrete : discreteOf(leg.to.project);
    this.genes.forEach((g, i) => {
      const from = leg.from[i]!;
      const to = geneOf(leg.to.project, i);
      // A HOP BETWEEN PHYSICS FAMILIES: physics jumps across around the middle
      // of the leg instead of lingering in the in-between physics.
      const ee = this.hopping && GENES[i]!.family === 'physics' ? hopEase(leg.u) : e;
      g.x = from.map((a, k) => a + ee * ((to[k] ?? a) - a) + bump * (g.offset[k] ?? 0));
      clampPath(i, g.x, from, to);
      g.v = g.x.map((x, k) => (dt > 0 ? (x - (prev[i]![k] ?? x)) / dt : 0));
    });
    // MELT, SWAP, SEPARATE. A change of cohort count reassigns almost every
    // particle to a new cohort in one frame (`get_cohort`), which pops. So when
    // this leg changes the count, the cohorts' twists fade to nothing around
    // the midpoint -- every cohort briefly obeys the same rule -- the count
    // switches there, invisibly, and the twists fade back in.
    if (this.hashHold !== null) {
      const r = this.legacyTwists ? 0 : clamp((e - 0.5) * 2, 0, 1);
      HASH_LANES.forEach(([gi, k], j) => {
        const g = this.genes[gi]!;
        g.x[k] = this.hashHold![j]! * (1 - r) + g.x[k]! * r;
      });
    }
    if (this.legacyTwists || leg.fromDiscrete.cohorts !== discreteOf(leg.to.project).cohorts) {
      const d = clamp(Math.abs(leg.u - 0.5) / COHORT_MELT_HALF_WIDTH, 0, 1);
      const k = d * d * (3 - 2 * d);
      const m = this.genes[MUTATION_GENE]!;
      m.x = m.x.map((v) => v * k);
    }
    // COLOR BY COHORT FADES rather than switching: it blends between the two
    // favorites' settings along the leg, and when the cohort count changes --
    // which re-deals every particle's cohort colour -- it fades out to the
    // behaviour colours around the midpoint and back, like the twists do.
    {
      const toD = discreteOf(leg.to.project);
      // FROM WHERE IT ACTUALLY WAS, not from the setting it started with: a
      // leg can begin mid-fade (cold turn-back or abandon), and starting from
      // the setting made the cohort colours pop back in all at once.
      const fromC = leg.fromCohortColor;
      let cc = fromC + ((toD.colorByCohort ? 1 : 0) - fromC) * e;
      if (leg.fromDiscrete.cohorts !== toD.cohorts) {
        const d = clamp(Math.abs(leg.u - 0.5) / COHORT_MELT_HALF_WIDTH, 0, 1);
        cc *= d * d * (3 - 2 * d);
      }
      this.cohortColor = cc;
    }
    // Past the first melt's midpoint: every cohort is (all but) on the same
    // rule, so steady twists can take over unseen.
    if (this.legacyTwists && leg.u >= 0.5) this.legacyTwists = false;
    return this.current();
  }

  /** Advance the target point and every spring by `dt` seconds; return the project to show. */
  step(dt: number): Project | null {
    if (!this.running || this.base === null || this.pool.length === 0) return null;
    const s = this.settings;
    const spread = this.ruleSpread();
    this.lastSpread = spread;

    this.focusClock += dt;
    let focusChanged = false;
    // In path mode the next favorite is chosen on ARRIVAL, not on a clock.
    if (s.motion === 'leash' && this.focusClock >= s.focusSeconds) {
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

    if (s.motion === 'path') return this.stepPath(dt);
    if (s.motion === 'breathe') return this.stepBreathe(dt);

    // THE TARGET POINT glides at a steady pace along its line. At an end it
    // either turns back (momentum kept, direction flipped) or -- if the focus
    // has moved on, or by chance -- sets off along a new line.
    const { lo, hi } = this.span();
    if (this.pair === null) this.newLine(spread);
    // COLD: the particles have gone still. Hurry through rather than linger,
    // and if it stays cold, turn back toward where it was alive.
    const cold = this.temperature.cold;
    const end = this.nearerEnd();
    if (cold && end !== null) {
      // LEARN: blame the nearer endpoint for this cold.
      this.chill.set(end.key, (this.chill.get(end.key) ?? 0) + dt);
    } else if (this.temperature.relative > 0.5 && end !== null) {
      this.warmAnchor = end;
    }
    if (cold && this.temperature.coldFor > COLD_ABANDON_SECONDS && !this.abandonedThisSpell) {
      // ABANDON: start over from where it was last alive.
      const anchor =
        this.warmAnchor !== null && this.pool.includes(this.warmAnchor) ? this.warmAnchor : undefined;
      this.newLine(spread, anchor);
      this.abandonedThisSpell = true;
      this.turnedThisSpell = true;
    } else if (cold && this.temperature.coldFor > COLD_TURN_SECONDS && !this.turnedThisSpell) {
      this.direction = -this.direction;
      this.turnedThisSpell = true;
    }
    const pace = cold ? COLD_SPEEDUP : 1;
    if (hi > lo) {
      this.w += (pace * this.direction * (hi - lo) * dt) / Math.max(1, s.strideSeconds);
      if (this.w > hi || this.w < lo) {
        // A hop line never turns back: its physics already lives in the new
        // family, so it always carries on from where it arrived.
        if (focusChanged || this.hopping || this.rng() < 0.5) {
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

    if (this.pair !== null) this.discrete = discreteOf((this.w < 0.5 ? this.pair.a : this.pair.b).project);
    this.cohortColor = this.discrete.colorByCohort ? 1 : 0;

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
      const family = GENES[i]!.family;
      const omega =
        family === 'color'
          ? 3 / Math.max(5, s.colorSeconds)
          : family === 'physics' && this.hopping && g.own === null
            ? 3 / HOP_SECONDS
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
    if (this.legacyTwists && this.hashHold !== null) {
      HASH_LANES.forEach(([gi, k], j) => {
        rule[GENES[gi]!.ruleStart! + k] = this.hashHold![j]!;
      });
    }
    // COHORTS ARE CARRIED: the count, layout and cohort switches of the
    // favorite in force, and mutation scale as a gene (above). The seed is
    // written NEGATIVE, which tells the shader to use steady per-cohort twists
    // rather than ones re-drawn from the moving rule (`rule.wgsl`). A baked
    // favorite has mutation 0, so it shows exactly as it did.
    config['cohorts'] = this.discrete.cohorts;
    config['initialConditions'] = this.discrete.initialConditions;
    config['cohortFences'] = this.discrete.cohortFences;
    config['colorByCohort'] = this.cohortColor > 0;
    config['mutationSeed'] =
      this.settings.motion === 'breathe'
        ? this.breath.legacy
          ? baseConfig.mutationSeed
          : -this.breath.seed
        : this.legacyTwists
          ? baseConfig.mutationSeed
          : -Math.max(1e-6, Math.abs(baseConfig.mutationSeed));
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
  debug(): { a: string; b: string; w: number; dir: number; focus: string; hop: boolean; fam: string } {
    return {
      hop: this.hopping,
      fam: this.pair === null ? '' : `${familyOf(this.pair.a.project)}>${familyOf(this.pair.b.project)}`,
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
      attractors: this.pool.map(({ key, name, likes }) => ({
        key,
        name,
        likes,
        chill: Math.round(this.chill.get(key) ?? 0),
      })),
      focusKey: this.focus?.key ?? -1,
      focusName: this.focus?.name ?? '',
      hopping: this.hopping,
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
