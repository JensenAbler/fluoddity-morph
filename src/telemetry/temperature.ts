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
const INTERVAL_MS = 1000;
/** Below this fraction of the recent peak, the run counts as cold. */
const COLD_FRACTION = 0.18;
/** The recent peak decays by half over about this long. */
const PEAK_HALF_LIFE_S = 90;

export interface Temperature {
  readonly speed: number;
  readonly relative: number;
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
  private latest: Temperature = { speed: 0, relative: 1, cold: false, coldFor: 0 };
  private failed = false;

  constructor(device: GPUDevice) {
    this.device = device;
  }

  get value(): Temperature {
    return this.latest;
  }

  /**
   * Forget the recent peak, as if the run had just begun. Called when the
   * evolver arrives at a new favorite, so its stillness is judged against its
   * own motion rather than whatever came before.
   */
  freshStart(): void {
    this.peak = 0;
    this.coldSince = null;
    this.latest = { speed: this.latest.speed, relative: 1, cold: false, coldFor: 0 };
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
    const cold = relative < COLD_FRACTION;
    if (cold) this.coldSince ??= nowMs;
    else this.coldSince = null;
    this.latest = {
      speed,
      relative,
      cold,
      coldFor: this.coldSince === null ? 0 : (nowMs - this.coldSince) / 1000,
    };
  }
}
