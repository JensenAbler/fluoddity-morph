/**
 * The hue anchor: when a creature collapses to one colour, hold that colour
 * still instead of letting the whole screen strobe round the wheel.
 *
 * WHY IT STROBES. Each particle's hue is `colorSensitivity * signal +
 * colorOffset` (in turns). In a dead arrangement every particle carries nearly
 * the same signal, so the screen is one colour; while evolving or morphing,
 * the genes keep moving and that shared hue slides, wrapping round the wheel
 * (Jensen, Nov 15: "the intermission in Monty Python and the Holy Grail").
 *
 * PREDICT, DON'T CHASE. The shared hue is `A * s + B`: A the colour
 * sensitivity, B the colour offset, s the shared signal. A and B are genes the
 * program sets itself every frame, so their part of the slide is known exactly
 * and cancelled the same frame -- no lag. Only s, the rule's output, lives on
 * the GPU: it is measured (the probe's mean signal, four times a second) and
 * extrapolated between readings. (The first version chased the measured hue
 * instead, and leaked whenever the genes moved faster than it could see.)
 *
 * HOLD, THEN LET GO. While the screen is one colour the anchor keeps the
 * shown hue at the colour it had when the collapse began. As variety comes
 * back it drifts home -- slowly, and the SHORT way round: hue is a circle, so
 * only where the offset sits matters, never how many turns it soaked up. It
 * is kept within half a turn of zero at all times.
 *
 * Display only: genes, saves and the simulation itself are untouched. Pure.
 */

/** Colour spread (see `Temperature.colorSpread`) at and below which the screen counts as one colour. */
export const ONE_COLOUR_SPREAD = 0.08;
/** Spread at and above which the screen has its variety back and the anchor lets go. */
export const VARIED_SPREAD = 0.25;
/** How fast the offset drifts home once colours are varied: half a turn in 20 s. */
export const RETURN_TURNS_PER_SECOND = 0.025;
/** A reading older than this (in the anchor's own seconds) is too old to hold on. */
const STALE_SECONDS = 2;
/** Never extrapolate the signal further than this past its last reading. */
const EXTRAPOLATE_SECONDS = 0.5;

/** Wrap turns into [-0.5, 0.5). */
export function wrapHalf(turns: number): number {
  return turns - Math.floor(turns + 0.5);
}

function smoothstep(lo: number, hi: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

export interface HueReading {
  /** Mean colour signal of the sampled particles (before sensitivity and offset). */
  readonly meanSignal?: number;
  /** 0 = one colour, 1 = colours all round the wheel. */
  readonly colorSpread?: number;
  /** When the reading was taken; a new value means a new reading. */
  readonly sampledAt?: number;
}

export class HueAnchor {
  /** The display offset to add to `colorOffset`, in turns, within [-0.5, 0.5). */
  offset = 0;
  /** 0..1: how firmly the anchor is holding right now (1 = one colour). */
  hold = 0;
  /** The anchor's own clock: seconds it has been stepped (simulation time, so recordings work). */
  private clock = 0;
  private signal: number | null = null;
  private signalAt = 0;
  private signalRate = 0;
  private lastSampledAt: number | undefined = undefined;
  private oneColour = 0;
  /** The shown hue being held, or null when not holding. */
  private target: number | null = null;

  /** Feed the probe's latest reading. Repeats of the same reading are ignored. */
  observe(r: HueReading): void {
    if (r.meanSignal === undefined || r.colorSpread === undefined) return;
    if (r.sampledAt !== undefined && r.sampledAt === this.lastSampledAt) return;
    this.lastSampledAt = r.sampledAt;
    if (this.signal !== null && this.clock > this.signalAt) {
      this.signalRate = (r.meanSignal - this.signal) / (this.clock - this.signalAt);
    }
    this.signal = r.meanSignal;
    this.signalAt = this.clock;
    this.oneColour = 1 - smoothstep(ONE_COLOUR_SPREAD, VARIED_SPREAD, r.colorSpread);
  }

  /**
   * Advance `dt` seconds and return the display offset. `active`: evolving or
   * morphing -- the only times the genes move under a collapsed screen.
   * `sensitivity` and `offset` are the colour genes in force THIS frame.
   */
  step(dt: number, active: boolean, sensitivity: number, colorOffset: number): number {
    this.clock += dt;
    const fresh = this.signal !== null && this.clock - this.signalAt <= STALE_SECONDS;
    const hold = active && fresh ? this.oneColour : 0;
    this.hold = hold;
    if (hold > 0 && this.signal !== null) {
      // The shown hue without the anchor: known genes times the extrapolated signal.
      const ahead = Math.min(this.clock - this.signalAt, EXTRAPOLATE_SECONDS);
      const s = this.signal + this.signalRate * ahead;
      const raw = sensitivity * s + colorOffset;
      this.target ??= wrapHalf(raw + this.offset);
      // Hold firmly when the screen is one colour; partly when it is nearly so.
      const wanted = wrapHalf(this.target - raw);
      this.offset = wrapHalf(this.offset + hold * wrapHalf(wanted - this.offset));
      return this.offset;
    }
    // LET GO: forget the held colour and drift home the short way.
    this.target = null;
    const home = RETURN_TURNS_PER_SECOND * dt;
    const off = wrapHalf(this.offset);
    this.offset = Math.abs(off) <= home ? 0 : wrapHalf(off - Math.sign(off) * home);
    return this.offset;
  }
}
