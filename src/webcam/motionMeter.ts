/**
 * How much the camera picture is moving, as one number, on the CPU.
 *
 * Used by "Motion plays Evolve": Evolve's clock advances only while the room
 * moves. The GPU field already knows where motion is, but reading it back would
 * stall the frame (and the FPS work of Nov 2026 is wary of readbacks), so this
 * keeps its own tiny copy instead: the video drawn into a 32x24 2D canvas a
 * few times a second, compared pixel by pixel with the previous one.
 *
 * THE MEASURE IS THE FRACTION OF PIXELS THAT CHANGED, not the mean change.
 * Sensor noise moves every pixel a little and a hand moves some pixels a lot;
 * a per-pixel threshold ignores the first and counts the second, and a
 * fraction does not care how bright the room is.
 */

const W = 32;
const H = 24;
/** Seconds between measurements. Motion is slow next to a frame. */
const INTERVAL = 0.1;
/** A measurement this long after the last compares against a stale picture. */
const STALE = 1;
/** Luma change (0..255) that counts a pixel as moved. Above sensor noise. */
const PIXEL_THRESHOLD = 14;
/** Fraction moved below which the room counts as still. */
const FLOOR = 0.004;

/**
 * The fraction moved that plays Evolve at full speed, from the sensitivity
 * slider: 0 needs a quarter of the picture moving, 1 a twentieth of that.
 */
export function fullSpeedFraction(sensitivity: number): number {
  const s = Math.min(1, Math.max(0, sensitivity));
  return 0.25 * Math.pow(0.05, s);
}

/** Moved fraction to play rate, 0..1. Pure; see `fullSpeedFraction`. */
export function rateFor(fraction: number, sensitivity: number): number {
  const full = Math.max(FLOOR * 2, fullSpeedFraction(sensitivity));
  const u = (fraction - FLOOR) / (full - FLOOR);
  return Math.min(1, Math.max(0, u));
}

export class MotionMeter {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prev: Uint8ClampedArray | null = null;
  /** Seconds (performance.now / 1000) of the last measurement. */
  private lastAt = -Infinity;
  private _fraction = 0;

  /** The latest fraction of the picture that moved, 0..1. */
  get fraction(): number {
    return this._fraction;
  }

  /** Forget the previous picture, e.g. when the stream changes. */
  reset(): void {
    this.prev = null;
    this._fraction = 0;
    this.lastAt = -Infinity;
  }

  /** Call on each new camera frame; measures at most every `INTERVAL`. */
  sample(video: HTMLVideoElement, nowSeconds: number): void {
    const since = nowSeconds - this.lastAt;
    if (since < INTERVAL) return;
    if (since > STALE) this.prev = null;
    this.lastAt = nowSeconds;
    if (this.ctx === null) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = W;
      this.canvas.height = H;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      if (this.ctx === null) return;
    }
    let data: Uint8ClampedArray;
    try {
      this.ctx.drawImage(video, 0, 0, W, H);
      data = this.ctx.getImageData(0, 0, W, H).data;
    } catch {
      return;
    }
    const prev = this.prev;
    const luma = new Uint8ClampedArray(W * H);
    let moved = 0;
    for (let i = 0, p = 0; i < luma.length; i++, p += 4) {
      const y = (data[p]! * 77 + data[p + 1]! * 150 + data[p + 2]! * 29) >> 8;
      luma[i] = y;
      if (prev !== null && Math.abs(y - prev[i]!) > PIXEL_THRESHOLD) moved++;
    }
    this.prev = luma;
    if (prev !== null) this._fraction = moved / luma.length;
  }
}
