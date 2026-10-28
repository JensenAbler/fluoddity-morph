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
 * logs both so marks line up with measured motion, not guesses. `cold` now
 * comes from the STUCK fraction (see `STUCK_PER_SECOND`); `relative` is kept
 * for the log.
 *
 * The readback is tiny (SAMPLE x 32 bytes), one in flight at a time, and
 * entirely optional: if mapping fails the probe just stays silent.
 */

const SAMPLE = 4096;
const BYTES_PER_ENTITY = 32;
const INTERVAL_MS = 1000;
/**
 * A particle is STUCK if, between two samples, it went less than this far per
 * second (world units; the world is about 2 across). Speed alone is not
 * enough: a particle jiggling in place is fast but goes nowhere, and to the eye
 * that is as still as a stopped one. 0.01 a second is half a percent of the
 * world's width.
 */
const STUCK_PER_SECOND = 0.01;
/** Farther than this per second between samples is a wrap or a respawn, not motion. */
const JUMP_PER_SECOND = 0.5;
/** More than this fraction of the sample stuck, and the scene counts as still. */
const STUCK_FRACTION = 0.5;
/** The recent peak decays by half over about this long. */
const PEAK_HALF_LIFE_S = 90;

export interface Temperature {
  readonly speed: number;
  readonly relative: number;
  /** Fraction of the sample that is stuck (see `STUCK_PER_SECOND`), 0..1. */
  readonly stuck: number;
  readonly cold: boolean;
  /** Seconds the run has been continuously cold (0 when warm). */
  readonly coldFor: number;
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
  private latest: Temperature = { speed: 0, relative: 1, stuck: 0, cold: false, coldFor: 0 };
  private failed = false;
  /** Positions at the previous sample, to measure how far each particle went. */
  private prevPos: Float32Array | null = null;
  private prevTime = 0;

  constructor(device: GPUDevice) {
    this.device = device;
  }

  get value(): Temperature {
    return this.latest;
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
    let sum = 0;
    let n = 0;
    for (let i = 0; i + 3 < f.length; i += 8) {
      const vx = f[i + 2]!;
      const vy = f[i + 3]!;
      if (!Number.isFinite(vx) || !Number.isFinite(vy)) continue;
      sum += Math.hypot(vx, vy);
      n++;
    }
    if (n === 0) return;
    const speed = sum / n;
    const dt = Math.max(0, (nowMs - this.lastPeakTime) / 1000);
    this.lastPeakTime = nowMs;
    this.peak = Math.max(speed, this.peak * Math.pow(0.5, dt / PEAK_HALF_LIFE_S));
    const relative = this.peak > 0 ? speed / this.peak : 1;

    // HOW MUCH OF THE SCENE IS GOING NOWHERE. Each sampled particle's travel
    // since the last sample: under `STUCK_PER_SECOND` it counts as stuck --
    // stopped OR jiggling in place, which look the same: still. The scene is
    // still when more than half the sample is stuck. This replaced "far slower
    // than this run's recent peak", which missed mostly-static scenes with a
    // few fast particles and misread gently moving ones after a lively stretch.
    const count = Math.floor(f.length / 8);
    const pos = new Float32Array(count * 2);
    for (let k = 0; k < count; k++) {
      pos[2 * k] = f[8 * k]!;
      pos[2 * k + 1] = f[8 * k + 1]!;
    }
    const sinceS = (nowMs - this.prevTime) / 1000;
    let stuck = 0;
    let counted = 0;
    if (this.prevPos !== null && this.prevPos.length === pos.length && sinceS > 0.25 && sinceS < 5) {
      for (let j = 0; j + 1 < pos.length; j += 2) {
        const dx = pos[j]! - this.prevPos[j]!;
        const dy = pos[j + 1]! - this.prevPos[j + 1]!;
        if (!Number.isFinite(dx) || !Number.isFinite(dy)) continue;
        const perSecond = Math.hypot(dx, dy) / sinceS;
        if (perSecond > JUMP_PER_SECOND) continue;
        counted++;
        if (perSecond < STUCK_PER_SECOND) stuck++;
      }
    }
    this.prevPos = pos;
    this.prevTime = nowMs;
    const stuckFraction = counted > 0 ? stuck / counted : 0;
    const cold = counted > 0 && stuckFraction > STUCK_FRACTION;
    if (cold) this.coldSince ??= nowMs;
    else this.coldSince = null;
    this.latest = {
      speed,
      relative,
      stuck: stuckFraction,
      cold,
      coldFor: this.coldSince === null ? 0 : (nowMs - this.coldSince) / 1000,
    };
  }
}
