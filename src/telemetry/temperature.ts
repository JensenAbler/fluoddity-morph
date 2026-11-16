/**
 * Temperature: how much the particles are actually MOVING.
 *
 * Jensen's word for the dead state is "0 kelvin", and the telemetry showed it
 * is not something the parameters alone predict -- the same settings sit
 * frozen one moment and snap to Brownian motion the next. So this measures it
 * directly: once a second, copy the first `SAMPLE` entities off the GPU and
 * take their mean speed. Two numbers come out:
 *
 *   - `speed`: the raw mean |velocity| of the sample, for the log.
 *   - `relative`: that speed against the session's own recent liveliness (a
 *     slow-decaying peak), so "cold" means "far stiller than this run has
 *     been", whatever units a given world size works in.
 *
 * The evolver reads `cold` to stop lingering in frozen stretches; telemetry
 * logs both so marks line up with measured motion, not guesses.
 *
 * The readback is tiny (SAMPLE x 32 bytes), one in flight at a time, and
 * entirely optional: if mapping fails the probe just stays silent.
 */

const SAMPLE = 4096;
const BYTES_PER_ENTITY = 32;
/**
 * Four readings a second. Once a second was plenty for stillness, but the hue
 * anchor (`hueAnchor.ts`) tracks how fast a one-colour screen's hue slides, and
 * a hue sampled once a second can lap the wheel unseen. The readback is tiny.
 */
const INTERVAL_MS = 250;
/** The recent peak decays by half over about this long (for `relative`, logged only). */
const PEAK_HALF_LIFE_S = 90;

// ---- DEAD, judged absolutely ------------------------------------------------
//
// The speed-vs-recent-peak rule (`relative`) is blind to a creature that
// ARRIVES dead: it becomes its own baseline and reads warm (Jensen's Nov 15
// run: the Weave sat frozen ~20 s, half of it rated fully warm). And it misses
// particles that jiggle in place. So `cold` is now absolute, two ways:
//
//  - STUCK (restored from the Oct 28 sensor, commit 00dda33, which a later
//    commit dropped by accident): each particle's NET travel over about a
//    second. Below STUCK_SPEED it is stuck, however much it jiggled. Jumps
//    faster than JUMP_SPEED are wraps or respawns and are ignored.
//  - ONE COLOUR: the colour spread collapsed. In every freeze looked at on
//    Nov 15 the screen went one colour. Skipped when the shown sensitivity is
//    ~0, where every creature is one colour by design.

/** World units per second of net travel below which a particle is stuck. */
export const STUCK_SPEED = 0.01;
/** Net travel faster than this (world units/s) is a wrap or respawn: ignored. */
export const JUMP_SPEED = 0.5;
/** More than this fraction stuck: dead. */
export const STUCK_FRACTION = 0.5;
/** Colour spread at or below this: one colour, dead. */
export const DEAD_SPREAD = 0.08;
/** Below this |colorSensitivity| one colour is by design, not death. */
const MIN_SENSITIVITY = 0.02;
/** Positions are compared about this far apart, so jiggling nets out. */
const STUCK_WINDOW_MS = 1000;

/** Fraction of particles whose net travel between two snapshots is stuck; null if none measurable. */
export function stuckFraction(prev: Float32Array, cur: Float32Array, seconds: number): number | null {
  if (seconds <= 0) return null;
  let n = 0;
  let stuck = 0;
  const len = Math.min(prev.length, cur.length);
  for (let i = 0; i + 1 < len; i += 2) {
    const dx = cur[i]! - prev[i]!;
    const dy = cur[i + 1]! - prev[i + 1]!;
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) continue;
    const v = Math.hypot(dx, dy) / seconds;
    if (v > JUMP_SPEED) continue;
    n++;
    if (v < STUCK_SPEED) stuck++;
  }
  return n > 0 ? stuck / n : null;
}

/**
 * Picture change (see `pictureProbe.ts`) below this over ~2 s: the picture is
 * still. Nov 15 recordings: freezes 0.00-0.09, lively stretches 0.13 and up.
 */
export const STILL_CHANGE = 0.1;

/**
 * The verdict from the PICTURE (preferred): dead when its shape has stopped
 * changing. One colour alone is NOT death on screen -- a lively blue cell
 * field reads one colour. `undefined` when there is no picture reading yet.
 */
export function pictureDead(change: number | undefined): boolean | undefined {
  if (change === undefined) return undefined;
  return change < STILL_CHANGE;
}

/** The FALLBACK verdict from particles, used only without a picture reading. */
export function isDead(stuck: number | undefined, colorSpread: number | undefined, sensitivity: number): boolean {
  if (stuck !== undefined && stuck > STUCK_FRACTION) return true;
  return colorSpread !== undefined && Math.abs(sensitivity) >= MIN_SENSITIVITY && colorSpread <= DEAD_SPREAD;
}

export interface Temperature {
  readonly speed: number;
  /** Speed against the recent peak (reset on arrival). Logged only; no longer decides `cold`. */
  readonly relative: number;
  /** Fraction of particles stuck (net travel over ~1 s). Absent until measured. */
  readonly stuck?: number;
  /** Fraction of the picture whose brightness changed over ~1 s (pictureProbe.ts). */
  readonly pictureChange?: number;
  /** The particles' own colour spread (logged; `colorSpread` is the picture's when known). */
  readonly particleSpread?: number;
  /** Dead: most particles stuck, or one colour (see `isDead`). */
  readonly cold: boolean;
  /** Seconds the run has been continuously cold (0 when warm). */
  readonly coldFor: number;
  /**
   * COLOUR SPREAD, 0..1: how many different colours the particles show right
   * now. 0 = every particle the same hue, 1 = hues evenly round the wheel.
   * Colour here is the rule's own output signal, which particles lay into the
   * trails and sense -- so when it collapses to one hue they can no longer tell
   * each other apart, and stillness follows (Jensen, Oct 30). Absent = unknown.
   */
  readonly colorSpread?: number;
  /** Average hue of the particles BEFORE `colorOffset`, in turns [0, 1). Absent = unknown. */
  readonly meanHue?: number;
  /** Plain mean of the particles' colour signal (meaningful when they agree: low spread). */
  readonly meanSignal?: number;
  /** `performance.now()` of this reading; a new value means a new reading. */
  readonly sampledAt?: number;
}

export class TemperatureProbe {
  private readonly device: GPUDevice;
  private readBuffer: GPUBuffer | null = null;
  private pending = false;
  private recorded = false;
  private lastRecord = -Infinity;
  private peak = 0;
  private lastPeakTime = 0;
  private coldSince: number | null = null;
  private latest: Temperature = { speed: 0, relative: 1, cold: false, coldFor: 0 };
  private failed = false;
  /** `colorSensitivity` of what is shown: hue = scale * signal (+ an offset that cancels). */
  private hueScale = 1;
  /** Particle positions (x, y pairs) from about a second ago, and when. */
  private prevPos: Float32Array | null = null;
  private prevPosAt = 0;
  private stuck: number | undefined = undefined;
  private picture: { change?: number; spread?: number } = {};

  /** The picture probe's latest reading (see `pictureProbe.ts`); it decides `cold` when present. */
  setPicture(p: { change?: number; spread?: number }): void {
    this.picture = p;
  }

  constructor(device: GPUDevice) {
    this.device = device;
  }

  get value(): Temperature {
    return this.latest;
  }

  /** The shown config's `colorSensitivity`, so the spread measures the colours you SEE. */
  setHueScale(scale: number): void {
    if (Number.isFinite(scale)) this.hueScale = scale;
  }

  /**
   * Forget the recent peak (for the logged `relative`). Called when the
   * evolver arrives at a new favorite. Deliberately does NOT clear `cold`: a
   * favorite arrived at dead is dead now, and Path should hurry on at once.
   */
  freshStart(): void {
    this.peak = 0;
    this.latest = { ...this.latest, relative: 1 };
  }

  /** Called while the frame's encoder is open: queue the copy if one is due. */
  record(encoder: GPUCommandEncoder, entities: GPUBuffer, nowMs: number): void {
    if (this.failed || this.pending || nowMs - this.lastRecord < INTERVAL_MS) return;
    const bytes = Math.min(entities.size, SAMPLE * BYTES_PER_ENTITY);
    if (bytes <= 0) return;
    try {
      if (this.readBuffer === null || this.readBuffer.size !== bytes) {
        this.readBuffer?.destroy();
        this.readBuffer = this.device.createBuffer({
          label: 'temperature-probe',
          size: bytes,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
      }
      encoder.copyBufferToBuffer(entities, 0, this.readBuffer, 0, bytes);
      this.recorded = true;
      this.lastRecord = nowMs;
    } catch {
      this.failed = true;
    }
  }

  /** Called after submit: map what was copied and fold it in. */
  afterSubmit(nowMs: number): void {
    if (!this.recorded || this.readBuffer === null) return;
    this.recorded = false;
    this.pending = true;
    const buffer = this.readBuffer;
    buffer
      .mapAsync(GPUMapMode.READ)
      .then(() => {
        const f = new Float32Array(buffer.getMappedRange().slice(0));
        buffer.unmap();
        this.fold(f, nowMs);
      })
      .catch(() => {
        this.failed = true;
      })
      .finally(() => {
        this.pending = false;
      });
  }

  private fold(f: Float32Array, nowMs: number): void {
    // Entity layout: pos_vel = (pos.x, pos.y, vel.x, vel.y), then misc.
    // misc.z (lane 6) is col_params.x, the rule's colour signal; the renderer's
    // hue is colorSensitivity * signal + colorOffset, in turns.
    let sum = 0;
    let n = 0;
    let cs = 0;
    let sn = 0;
    let nc = 0;
    let sigSum = 0;
    const turn = 2 * Math.PI * this.hueScale;
    const pos = new Float32Array(Math.floor(f.length / 8) * 2);
    for (let i = 0; i + 3 < f.length; i += 8) {
      pos[(i / 8) * 2] = f[i]!;
      pos[(i / 8) * 2 + 1] = f[i + 1]!;
      const vx = f[i + 2]!;
      const vy = f[i + 3]!;
      if (!Number.isFinite(vx) || !Number.isFinite(vy)) continue;
      sum += Math.hypot(vx, vy);
      n++;
      const c = f[i + 6];
      if (c !== undefined && Number.isFinite(c)) {
        cs += Math.cos(turn * c);
        sn += Math.sin(turn * c);
        sigSum += c;
        nc++;
      }
    }
    if (n === 0) return;
    const colorSpread = nc > 0 ? colorSpreadOf(cs / nc, sn / nc) : 1;
    const meanHue =
      nc > 0 && (cs !== 0 || sn !== 0)
        ? (((Math.atan2(sn / nc, cs / nc) / (2 * Math.PI)) % 1) + 1) % 1
        : undefined;
    const speed = sum / n;
    const dt = Math.max(0, (nowMs - this.lastPeakTime) / 1000);
    this.lastPeakTime = nowMs;
    this.peak = Math.max(speed, this.peak * Math.pow(0.5, dt / PEAK_HALF_LIFE_S));
    const relative = this.peak > 0 ? speed / this.peak : 1;
    // STUCK: compare against positions from about a second ago.
    if (this.prevPos === null || pos.length !== this.prevPos.length) {
      this.prevPos = pos;
      this.prevPosAt = nowMs;
    } else if (nowMs - this.prevPosAt >= STUCK_WINDOW_MS) {
      const s = stuckFraction(this.prevPos, pos, (nowMs - this.prevPosAt) / 1000);
      if (s !== null) this.stuck = s;
      this.prevPos = pos;
      this.prevPosAt = nowMs;
    }
    // THE PICTURE DECIDES when it can (pictureProbe.ts); particles are the fallback.
    const pic = this.picture;
    const fromPicture = pictureDead(pic.change);
    const cold = fromPicture ?? isDead(this.stuck, nc > 0 ? colorSpread : undefined, this.hueScale);
    if (cold) this.coldSince ??= nowMs;
    else this.coldSince = null;
    this.latest = {
      speed,
      relative,
      stuck: this.stuck,
      cold,
      coldFor: this.coldSince === null ? 0 : (nowMs - this.coldSince) / 1000,
      // What the eye sees when the picture probe has a reading; else the particles'.
      colorSpread: pic.spread ?? colorSpread,
      particleSpread: colorSpread,
      pictureChange: pic.change,
      meanHue,
      meanSignal: nc > 0 ? sigSum / nc : undefined,
      sampledAt: nowMs,
    };
  }
}

/** 1 - |mean unit hue vector|: 0 when every hue agrees, 1 when they cancel out. */
export function colorSpreadOf(meanCos: number, meanSin: number): number {
  return Math.max(0, Math.min(1, 1 - Math.hypot(meanCos, meanSin)));
}
