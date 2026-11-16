import type { SimulationConfig } from '../particleSystem/config.ts';

/**
 * REVERSAL GUARD: steer the route around a population-wide brake.
 *
 * Nov 16 run, 6:03-6:09: every particle carried the same signal (one colour),
 * and as the genes moved toward Triforce that shared signal's FORWARD DRIVE
 * swung from +2.5 to -3.7. A backward drive is a brake, so the whole
 * population stopped in its tracks at once and stayed pinned.
 *
 * The forward drive is something we can compute on the CPU: it is the x
 * output of the rule's Fourier black box (entityUpdate.wgsl `fourier_term`,
 * base + mirror), and it is LINEAR in each center's amplitude.x. So:
 *
 *   1. Find probe inputs whose drive under the current rule matches the
 *      population's measured mean drive -- stand-ins for "what they sense".
 *   2. Extrapolate the rule a few seconds along its current motion and ask
 *      what drive those inputs would produce there.
 *   3. If most of them would turn into a brake, add the smallest change to the
 *      ten amplitude.x genes that keeps the drive forward, easing it in.
 *
 * Physics is untouched: this only bends the route the genes take. Checked
 * offline against that run: 4-6 s ahead it predicted the flip (75-84% of
 * matched inputs going negative) while the drive was still +2.5 to +3.7.
 */

export const CENTERS = 10;
const FLOATS_PER_CENTER = 8;
/** Seconds to look ahead along the genes' current motion. */
export const LOOKAHEAD_SECONDS = 4;
/** Seconds between predictions. */
export const INTERVAL_SECONDS = 0.25;
/** Particle colour spread under which the population counts as moving in lockstep. */
export const LOCKSTEP_SPREAD = 0.25;
/** Fraction of matched inputs turning into a brake that counts as danger. */
export const DANGER_FRACTION = 0.5;
/** Seconds for the detour to ease in, and to ease back out once clear. */
export const EASE_IN_SECONDS = 1;
export const EASE_OUT_SECONDS = 3;

/** Forward drive of one input (L.x, L.y, R.x, R.y) under a rule, as the shader computes it. */
export function drive(rule: ArrayLike<number>, s: readonly number[]): number {
  return driveAndGradient(rule, s).drive;
}

/** The drive and its gradient with respect to each center's amplitude.x. */
export function driveAndGradient(rule: ArrayLike<number>, s: readonly number[]): { drive: number; grad: Float64Array } {
  // Mirror input: L/R swapped and y-reflected (`calculate_entity_behavior`).
  const m = [s[2]!, -s[3]!, s[0]!, -s[1]!];
  const grad = new Float64Array(CENTERS);
  let total = 0;
  for (let i = 0; i < CENTERS; i++) {
    const o = i * FLOATS_PER_CENTER;
    const f0 = rule[o]!, f1 = rule[o + 1]!, f2 = rule[o + 2]!, f3 = rule[o + 3]!;
    const ax = rule[o + 4]!;
    const aw = rule[o + 7]!;
    const off = 2 * i * 0.6283 + aw * 3.14159;
    const pb = s[0]! * f0 + s[1]! * f1 + s[2]! * f2 + s[3]! * f3;
    const pm = m[0]! * f0 + m[1]! * f1 + m[2]! * f2 + m[3]! * f3;
    const g = Math.sin(pb + off) + Math.sin(pm + off);
    grad[i] = g;
    total += ax * g;
  }
  return { drive: total, grad };
}

/** Deterministic probe inputs spanning several orders of magnitude. */
function makeProbes(n: number): number[][] {
  let seed = 0x9e3779b9;
  const rnd = (): number => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    out.push([0, 1, 2, 3].map(() => (rnd() < 0.5 ? -1 : 1) * 10 ** (-2 + 3 * rnd())));
  }
  return out;
}
const PROBES = makeProbes(600);

export interface Assessment {
  /** Matched probe inputs. */
  matched: number;
  /** Fraction of matched inputs whose drive ahead is a brake. */
  risk: number;
  /** Mean drive ahead across matched inputs, and its mean gradient. */
  ahead: number;
  grad: Float64Array;
}

/** Match inputs to the measured drive under `now`, then read them under `ahead`. */
export function assess(now: ArrayLike<number>, ahead: ArrayLike<number>, meanDrive: number): Assessment {
  const tol = Math.max(0.2, 0.15 * Math.abs(meanDrive));
  const grad = new Float64Array(CENTERS);
  let matched = 0, negative = 0, sum = 0;
  for (const p of PROBES) {
    if (Math.abs(drive(now, p) - meanDrive) > tol) continue;
    const a = driveAndGradient(ahead, p);
    matched++;
    sum += a.drive;
    if (a.drive < 0) negative++;
    for (let i = 0; i < CENTERS; i++) grad[i]! += a.grad[i]!;
  }
  if (matched > 0) for (let i = 0; i < CENTERS; i++) grad[i]! /= matched;
  return { matched, risk: matched > 0 ? negative / matched : 0, ahead: matched > 0 ? sum / matched : 0, grad };
}

export class ReversalGuard {
  /** Detour added to each center's amplitude.x. */
  readonly offset = new Float64Array(CENTERS);
  private desired = new Float64Array(CENTERS);
  /** Last assessed risk, for telemetry. */
  risk = 0;
  private prev: Float64Array | null = null;
  private vel = new Float64Array(CENTERS * FLOATS_PER_CENTER);
  private clock = 0;

  /** Size of the current detour. */
  get size(): number {
    let s = 0;
    for (const v of this.offset) s += v * v;
    return Math.sqrt(s);
  }

  update(
    dt: number,
    active: boolean,
    rule: ArrayLike<number> | undefined,
    meanDrive: number | undefined,
    particleSpread: number | undefined,
  ): void {
    if (!active || rule === undefined) {
      this.prev = null;
      this.desired.fill(0);
      this.ease(dt);
      return;
    }
    const n = CENTERS * FLOATS_PER_CENTER;
    // How fast the genes are moving, smoothed over ~0.5 s.
    if (this.prev !== null && dt > 0) {
      const k = 1 - Math.exp(-dt / 0.5);
      for (let j = 0; j < n; j++) this.vel[j]! += ((rule[j]! - this.prev[j]!) / dt - this.vel[j]!) * k;
    }
    this.prev = Float64Array.from({ length: n }, (_, j) => rule[j]!);

    this.clock += dt;
    if (this.clock >= INTERVAL_SECONDS) {
      this.clock = 0;
      this.plan(rule, meanDrive, particleSpread);
    }
    this.ease(dt);
  }

  private plan(rule: ArrayLike<number>, meanDrive: number | undefined, particleSpread: number | undefined): void {
    const lockstep = particleSpread !== undefined && particleSpread < LOCKSTEP_SPREAD;
    if (meanDrive === undefined || !lockstep || meanDrive <= 0) {
      this.risk = 0;
      this.desired.fill(0);
      return;
    }
    const n = CENTERS * FLOATS_PER_CENTER;
    const now = new Float64Array(n);
    const ahead = new Float64Array(n);
    for (let j = 0; j < n; j++) {
      now[j] = rule[j]!;
      ahead[j] = rule[j]! + this.vel[j]! * LOOKAHEAD_SECONDS;
    }
    // The physics already sees the current detour, so include it on both sides.
    for (let i = 0; i < CENTERS; i++) {
      now[i * FLOATS_PER_CENTER + 4]! += this.offset[i]!;
      ahead[i * FLOATS_PER_CENTER + 4]! += this.offset[i]!;
    }
    const a = assess(now, ahead, meanDrive);
    this.risk = a.risk;
    if (a.matched < 5 || a.risk < DANGER_FRACTION) {
      this.desired.fill(0);
      return;
    }
    // Smallest change along the drive's gradient that keeps it forward.
    const target = Math.max(0.5, 0.3 * meanDrive);
    let g2 = 0;
    for (const g of a.grad) g2 += g * g;
    if (g2 < 1e-9) return;
    const need = Math.max(0, target - a.ahead) / g2;
    for (let i = 0; i < CENTERS; i++) this.desired[i] = this.offset[i]! + need * a.grad[i]!;
  }

  private ease(dt: number): void {
    for (let i = 0; i < CENTERS; i++) {
      const d = this.desired[i]!;
      const o = this.offset[i]!;
      const tau = Math.abs(d) > Math.abs(o) ? EASE_IN_SECONDS : EASE_OUT_SECONDS;
      this.offset[i] = o + (d - o) * (1 - Math.exp(-Math.max(0, dt) / tau));
    }
  }
}

/** A config with the detour added to each center's amplitude.x. */
export function guardConfig(config: SimulationConfig, offset: ArrayLike<number>): SimulationConfig {
  let any = false;
  for (let i = 0; i < CENTERS; i++) if (Math.abs(offset[i]!) > 1e-6) any = true;
  if (!any) return config;
  const rule = [...config.rule];
  for (let i = 0; i < CENTERS; i++) rule[i * FLOATS_PER_CENTER + 4]! += offset[i]!;
  return { ...config, rule };
}
