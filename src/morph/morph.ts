/**
 * Morph: animate the simulation from one saved state to another.
 *
 * Fluoddity's joy is discovery, but a creature on its own hides the path that
 * produced it. A morph timeline is a list of keyframes (whole `Project`s) with
 * a hold and a transition time each; playing it slides every continuous setting
 * from one keyframe to the next WHILE THE SIMULATION KEEPS RUNNING, so the
 * particles themselves carry the change -- you watch one creature become
 * another rather than a cut between two.
 *
 * This file is pure: no GPU, no DOM, no Orchestrator. The Orchestrator owns a
 * `MorphTimeline` and asks it, once per frame, which project should be live.
 *
 * ## What blends and what cuts
 *
 *   - Every finite number blends linearly, except the rule's amplitudes: they
 *     keep their strength through the blend (`ruleBlend.ts`), so two unrelated
 *     rules don't cancel into a weak one in the middle.
 *   - Integer modes (cohort count, initial conditions, boundary condition) and
 *     booleans CUT at the midpoint of a transition. There is no half-way grid.
 *   - `mutationSeed` is a hash input, so a blended seed is noise. When the two
 *     keyframes have different seeds and any mutation at all, the transition
 *     runs mutation scale DOWN to zero over its first half, swaps the seed at
 *     the midpoint (invisible, since nothing is being mutated then), and runs
 *     it back UP over the second half. Cohorts converge onto the parent and
 *     bloom back out into the new family -- continuous, and honest about it.
 *   - A rule that is all zeros is GENERATED on the GPU from the seed, so there
 *     is no host copy to blend toward. Such a rule cuts at the midpoint too.
 */

import type { SimulationConfig, WorldSettings } from '../particleSystem/config.ts';
import { type Project, makeProject } from '../project/project.ts';
import { blendRule } from '../project/ruleBlend.ts';

export type Easing = 'smooth' | 'linear';

/** Fields that are modes, not quantities. They cut at the midpoint. */
const DISCRETE_CONFIG_FIELDS: ReadonlySet<string> = new Set([
  'cohorts',
  'initialConditions',
  'mutationSeed', // handled specially, see `lerpConfig`
]);
const DISCRETE_WORLD_FIELDS: ReadonlySet<string> = new Set(['boundaryConditions']);

export function ease(u: number, easing: Easing): number {
  const t = Math.min(1, Math.max(0, u));
  return easing === 'smooth' ? t * t * (3 - 2 * t) : t;
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

function isZeroRule(rule: readonly number[]): boolean {
  return rule.every((v) => v === 0);
}

/**
 * Blend the plain fields of two records. Numbers lerp unless listed as
 * discrete; everything else (booleans, modes, unknown shapes) cuts at 0.5.
 */
function blendRecord<T extends object>(a: T, b: T, u: number, discrete: ReadonlySet<string>): T {
  const out: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  const bRec = b as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    const av = out[key];
    const bv = bRec[key];
    if (bv === undefined) continue;
    if (
      typeof av === 'number' &&
      typeof bv === 'number' &&
      Number.isFinite(av) &&
      Number.isFinite(bv) &&
      !discrete.has(key)
    ) {
      out[key] = lerp(av, bv, u);
    } else if (!Array.isArray(av)) {
      out[key] = u < 0.5 ? av : bv;
    }
  }
  return out as T;
}

/** Blend two configs at `u` in [0,1]. `u` is already eased. */
export function lerpConfig(a: SimulationConfig, b: SimulationConfig, u: number): SimulationConfig {
  if (u <= 0) return a;
  if (u >= 1) return b;
  const out = blendRecord(a, b, u, DISCRETE_CONFIG_FIELDS) as SimulationConfig & {
    rule: readonly number[];
    mutationScale: number;
    mutationSeed: number;
  };

  // --- the rule, the seed, and mutation ---------------------------------------
  //
  // THE GPU'S MUTATION IS SEEDED BY HASHING THE RULE ITSELF, and the hash is
  // chaotic. So a rule that is moving while mutation is nonzero draws a fresh
  // random mutation every frame -- noise, not a morph. Three cases:
  //
  //   rule moving, mutation on   STAGED: mutation eases to 0 over the first
  //                              quarter, the bare rules blend through the middle
  //                              half at zero mutation, and mutation eases back
  //                              up over the last quarter. Keyframes captured in
  //                              the studio are BAKED (mutation folded into the
  //                              rule, scale 0), so this only happens for
  //                              multi-cohort families.
  //   rule still, seed changes   the seed is swapped at the midpoint, hidden by
  //                              mutation dipping to 0 there.
  //   otherwise                  everything blends straight through.
  const sameRule =
    a.rule.length === b.rule.length && a.rule.every((v, i) => v === b.rule[i]);
  const blendable =
    a.rule.length === b.rule.length && !isZeroRule(a.rule) && !isZeroRule(b.rule);
  const anyMutation = a.mutationScale !== 0 || b.mutationScale !== 0;

  if (!sameRule && blendable && anyMutation) {
    if (u < 0.25) {
      out.rule = a.rule;
      out.mutationScale = lerp(a.mutationScale, 0, u / 0.25);
      out.mutationSeed = a.mutationSeed;
    } else if (u < 0.75) {
      const w = (u - 0.25) / 0.5;
      out.rule = blendRule(a.rule, b.rule, w);
      out.mutationScale = 0;
      out.mutationSeed = w < 0.5 ? a.mutationSeed : b.mutationSeed;
    } else {
      out.rule = b.rule;
      out.mutationScale = lerp(0, b.mutationScale, (u - 0.75) / 0.25);
      out.mutationSeed = b.mutationSeed;
    }
    return out;
  }

  out.rule = sameRule
    ? a.rule
    : blendable
      ? blendRule(a.rule, b.rule, u)
      : u < 0.5
        ? a.rule
        : b.rule;
  if (a.mutationSeed !== b.mutationSeed && anyMutation) {
    out.mutationScale =
      u < 0.5 ? lerp(a.mutationScale, 0, u * 2) : lerp(0, b.mutationScale, (u - 0.5) * 2);
  }
  out.mutationSeed = u < 0.5 ? a.mutationSeed : b.mutationSeed;
  return out;
}

export function lerpWorld(a: WorldSettings, b: WorldSettings, u: number): WorldSettings {
  if (u <= 0) return a;
  if (u >= 1) return b;
  return blendRecord(a, b, u, DISCRETE_WORLD_FIELDS);
}

/**
 * Blend two projects. Configs pair by index; if the two keyframes hold a
 * different NUMBER of configs, the whole buffer cuts at the midpoint.
 */
export function lerpProject(a: Project, b: Project, u: number): Project {
  if (u <= 0) return a;
  if (u >= 1) return b;
  const configs =
    a.configs.length === b.configs.length
      ? a.configs.map((c, i) => lerpConfig(c, b.configs[i]!, u))
      : u < 0.5
        ? a.configs
        : b.configs;
  const head = u < 0.5 ? a : b;
  return makeProject({
    configs,
    world: lerpWorld(a.world, b.world, u),
    name: head.name,
    selected: head.selected,
  });
}

// ---------------------------------------------------------------------------
// The timeline
// ---------------------------------------------------------------------------

export interface Keyframe {
  readonly key: number;
  readonly name: string;
  readonly project: Project;
  /** Seconds to sit on this keyframe before moving on. */
  readonly hold: number;
  /** Seconds to morph from this keyframe to the next. */
  readonly duration: number;
}

export const DEFAULT_HOLD = 2;
export const DEFAULT_DURATION = 8;
export const MAX_SECONDS = 600;

function clampSeconds(v: number): number {
  return Number.isFinite(v) ? Math.min(MAX_SECONDS, Math.max(0, v)) : 0;
}

/** Whether keyframe `i` has an outgoing transition. */
function hasTransition(count: number, i: number, loop: boolean): boolean {
  return count > 1 && (i < count - 1 || loop);
}

export function totalSeconds(keys: readonly Keyframe[], loop: boolean): number {
  let t = 0;
  keys.forEach((k, i) => {
    t += k.hold;
    if (hasTransition(keys.length, i, loop)) t += k.duration;
  });
  return t;
}

/** Where in the timeline `time` falls: the two endpoints and the raw progress. */
export interface Position {
  readonly from: number; // index
  readonly to: number; // index
  /** Raw (un-eased) progress through the transition; 0 while holding. */
  readonly u: number;
  /** Index of the keyframe whose segment we are in. */
  readonly segment: number;
}

export function locate(keys: readonly Keyframe[], time: number, loop: boolean): Position {
  const n = keys.length;
  if (n === 0) return { from: 0, to: 0, u: 0, segment: 0 };
  let t = Math.max(0, time);
  for (let i = 0; i < n; i++) {
    const k = keys[i]!;
    if (t < k.hold) return { from: i, to: i, u: 0, segment: i };
    t -= k.hold;
    if (hasTransition(n, i, loop)) {
      const next = (i + 1) % n;
      if (t < k.duration) {
        return { from: i, to: next, u: k.duration > 0 ? t / k.duration : 1, segment: i };
      }
      t -= k.duration;
    }
  }
  // Past the end: rest on the keyframe the timeline finishes on.
  const last = loop && n > 1 ? 0 : n - 1;
  return { from: last, to: last, u: 0, segment: n - 1 };
}

/** The project the timeline shows at `time`. Returns a keyframe's own project while holding. */
export function projectAt(
  keys: readonly Keyframe[],
  time: number,
  loop: boolean,
  easing: Easing,
): Project | null {
  if (keys.length === 0) return null;
  const pos = locate(keys, time, loop);
  const a = keys[pos.from]!.project;
  if (pos.from === pos.to) return a;
  return lerpProject(a, keys[pos.to]!.project, ease(pos.u, easing));
}

/** Seconds at which keyframe `index` begins (its hold starts). */
export function startOf(keys: readonly Keyframe[], index: number, loop: boolean): number {
  let t = 0;
  for (let i = 0; i < index && i < keys.length; i++) {
    t += keys[i]!.hold;
    if (hasTransition(keys.length, i, loop)) t += keys[i]!.duration;
  }
  return t;
}

/** What the UI sees of one keyframe: no `Project`, per invariant 10. */
export interface KeyframeView {
  readonly key: number;
  readonly name: string;
  readonly hold: number;
  readonly duration: number;
  /** True when this keyframe's rule is GPU-generated and will cut, not blend. */
  readonly generated: boolean;
}

export interface MorphView {
  readonly keyframes: readonly KeyframeView[];
  readonly playing: boolean;
  readonly time: number;
  readonly total: number;
  readonly loop: boolean;
  readonly easing: Easing;
  readonly resetOnPlay: boolean;
  /** Index of the segment the playhead is in, or -1 with no keyframes. */
  readonly segment: number;
}

/**
 * The mutable timeline the Orchestrator owns. Holds keyframes and the
 * playhead; knows nothing about the GPU. `advance` returns the project that
 * should be live this frame, or null when nothing should change.
 */
export class MorphTimeline {
  private keys: Keyframe[] = [];
  private nextKey = 1;
  playing = false;
  time = 0;
  loop = false;
  easing: Easing = 'smooth';
  resetOnPlay = true;

  get keyframes(): readonly Keyframe[] {
    return this.keys;
  }

  get total(): number {
    return totalSeconds(this.keys, this.loop);
  }

  add(project: Project, name?: string): Keyframe {
    const key = this.nextKey++;
    const k: Keyframe = {
      key,
      name: name ?? `Key ${key}`,
      project,
      hold: DEFAULT_HOLD,
      duration: DEFAULT_DURATION,
    };
    this.keys.push(k);
    return k;
  }

  remove(key: number): void {
    this.keys = this.keys.filter((k) => k.key !== key);
    if (this.keys.length === 0) this.stop();
    this.time = Math.min(this.time, this.total);
  }

  clear(): void {
    this.keys = [];
    this.stop();
    this.time = 0;
  }

  replace(key: number, project: Project): void {
    this.keys = this.keys.map((k) => (k.key === key ? { ...k, project } : k));
  }

  move(key: number, delta: number): void {
    const i = this.keys.findIndex((k) => k.key === key);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= this.keys.length) return;
    const copy = this.keys.slice();
    const [item] = copy.splice(i, 1);
    copy.splice(j, 0, item!);
    this.keys = copy;
  }

  setTiming(key: number, timing: { hold?: number; duration?: number }): void {
    this.keys = this.keys.map((k) =>
      k.key === key
        ? {
            ...k,
            hold: timing.hold === undefined ? k.hold : clampSeconds(timing.hold),
            duration: timing.duration === undefined ? k.duration : clampSeconds(timing.duration),
          }
        : k,
    );
  }

  byKey(key: number): Keyframe | null {
    return this.keys.find((k) => k.key === key) ?? null;
  }

  indexOf(key: number): number {
    return this.keys.findIndex((k) => k.key === key);
  }

  /** Begin playing. Returns true when playback starts from the very top. */
  play(): boolean {
    if (this.keys.length === 0) return false;
    if (this.time >= this.total) this.time = 0;
    this.playing = true;
    return this.time === 0;
  }

  stop(): void {
    this.playing = false;
  }

  seek(time: number): void {
    this.time = Math.min(Math.max(0, time), this.total);
  }

  current(): Project | null {
    return projectAt(this.keys, this.time, this.loop, this.easing);
  }

  /**
   * Step the playhead by `dt` seconds and return the project to show. A
   * looping timeline wraps; a one-shot one stops at the end, leaving the last
   * keyframe live.
   */
  advance(dt: number): Project | null {
    if (!this.playing || this.keys.length === 0) return null;
    const total = this.total;
    this.time += Math.max(0, dt);
    if (this.time >= total) {
      if (this.loop && total > 0) {
        this.time %= total;
      } else {
        this.time = total;
        this.playing = false;
      }
    }
    return this.current();
  }

  view(): MorphView {
    const pos = this.keys.length === 0 ? null : locate(this.keys, this.time, this.loop);
    return {
      keyframes: this.keys.map((k) => ({
        key: k.key,
        name: k.name,
        hold: k.hold,
        duration: k.duration,
        generated: k.project.configs.some((c) => isZeroRule(c.rule)),
      })),
      playing: this.playing,
      time: this.time,
      total: this.total,
      loop: this.loop,
      easing: this.easing,
      resetOnPlay: this.resetOnPlay,
      segment: pos === null ? -1 : pos.segment,
    };
  }
}
