/**
 * The hue anchor: when a creature collapses to one colour, hold that colour
 * still instead of letting the whole screen strobe round the wheel.
 *
 * WHY IT STROBES. Each particle's hue is `colorSensitivity * signal +
 * colorOffset` (in turns). In a dead arrangement every particle carries nearly
 * the same signal, so the screen is one colour; while evolving or morphing,
 * the rule and the sensitivity keep moving, that shared value slides, and the
 * hue wraps -- so the whole picture spins through the rainbow (Jensen, Nov 15:
 * "the intermission in Monty Python and the Holy Grail").
 *
 * WHAT IT DOES. The temperature probe reads the average hue several times a
 * second. While the screen is one colour, a display-only offset turns the wheel
 * against that drift, so the shared colour stays put. As colour variety comes
 * back, the offset drifts home -- slowly, and the SHORT way round. Hue is a
 * circle, so only where the offset sits matters, never how many turns it
 * soaked up: it is kept within half a turn of zero at all times, and the trip
 * home is at most half a turn.
 *
 * Display only: genes, saves and the simulation itself are untouched. Pure.
 */

/** Colour spread (see `Temperature.colorSpread`) at and below which the screen counts as one colour. */
export const ONE_COLOUR_SPREAD = 0.08;
/** Spread at and above which the screen has its variety back and the anchor lets go. */
export const VARIED_SPREAD = 0.25;
/** How fast the offset drifts home once colours are varied: half a turn in 20 s. */
export const RETURN_TURNS_PER_SECOND = 0.025;
/** A reading older than this (in the anchor's own seconds) no longer says how fast the hue moves. */
const STALE_SECONDS = 2;

/** Wrap turns into [-0.5, 0.5). */
export function wrapHalf(turns: number): number {
  return turns - Math.floor(turns + 0.5);
}

function smoothstep(lo: number, hi: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

export interface HueReading {
  /** Average hue of the particles BEFORE `colorOffset`, in turns. */
  readonly meanHue?: number;
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
  private lastHue: number | null = null;
  private lastClock = 0;
  private lastSampledAt: number | undefined = undefined;
  /** The shared hue's measured drift, turns per second. */
  private rate = 0;
  private oneColour = 0;

  /** Feed the probe's latest reading. Repeats of the same reading are ignored. */
  observe(r: HueReading): void {
    if (r.meanHue === undefined || r.colorSpread === undefined) return;
    if (r.sampledAt !== undefined && r.sampledAt === this.lastSampledAt) return;
    this.lastSampledAt = r.sampledAt;
    if (this.lastHue !== null && this.clock > this.lastClock) {
      this.rate = wrapHalf(r.meanHue - this.lastHue) / (this.clock - this.lastClock);
    }
    this.lastHue = r.meanHue;
    this.lastClock = this.clock;
    this.oneColour = 1 - smoothstep(ONE_COLOUR_SPREAD, VARIED_SPREAD, r.colorSpread);
  }

  /**
   * Advance `dt` seconds. `active`: evolving or morphing -- the only times the
   * genes move under a collapsed screen. Inactive, the anchor just goes home.
   */
  step(dt: number, active: boolean): number {
    this.clock += dt;
    const fresh = this.clock - this.lastClock <= STALE_SECONDS;
    const hold = active && fresh ? this.oneColour : 0;
    this.hold = hold;
    // HOLD: turn the wheel against the shared drift, as firmly as the screen is one colour.
    let off = this.offset - hold * this.rate * dt;
    // LET GO: drift home the short way, as the colours come back.
    const home = (1 - hold) * RETURN_TURNS_PER_SECOND * dt;
    off = wrapHalf(off);
    off = Math.abs(off) <= home ? 0 : off - Math.sign(off) * home;
    this.offset = wrapHalf(off);
    return this.offset;
  }
}
