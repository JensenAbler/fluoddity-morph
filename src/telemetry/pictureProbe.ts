/**
 * Picture probe: judge stillness from the PICTURE ON SCREEN, not the particles.
 *
 * Everything before this measured particles -- their speed, their net travel,
 * the spread of their colour signals -- and on Nov 15 each of those disagreed
 * with what Jensen saw: creatures whose particles hold their place while the
 * picture moves were called dead, and one-colour screens were called varied
 * because the sample weighs dim background particles like the bright creature.
 *
 * So this reads the presented frame itself (the canvas, after tone mapping,
 * exactly what a screen recording captures) averaged into a GRID_W x GRID_H
 * grid four times a second (~74 KB readback), and measures:
 *
 *  - CHANGE: of the cells lit (brightness >= LIT) two seconds ago or now, the
 *    fraction whose lit/unlit state flipped. That is the SHAPE changing. A
 *    colour strobe over a frozen shape barely moves it.
 *  - SPREAD: how many different colours the picture shows, each cell weighted
 *    by how colourful it is. 0 = one colour, 1 = colours all round the wheel.
 *    Used by the hue anchor, NOT as a sign of death: on Nov 15 a lively blue
 *    cell field read 0.02.
 *
 * Calibrated on Jensen's four Nov 15 recordings, measured exactly this way:
 * every freeze he pointed at (8:08, 5:15, the 20 s Weave) read 0.00-0.09 over
 * 2 s; every lively stretch checked read 0.13 or more. Pure maths exported
 * for tests.
 */

export const GRID_W = 48;
export const GRID_H = 96;
const CELLS = GRID_W * GRID_H;
const BYTES = CELLS * 16;
const INTERVAL_MS = 250;
/** Shapes are compared over about this long. */
const CHANGE_WINDOW_MS = 2000;

/** A cell is part of the picture when its brightness (max of r, g, b; 0..1 as displayed) is at least this. */
export const LIT = 0.12;
/** A cell counts toward colour when its colourfulness (max - min) is at least this. */
const COLOURFUL = 0.06;

export interface PictureReading {
  /** Fraction of the lit picture whose shape changed over ~2 s. Absent until two snapshots exist. */
  readonly change?: number;
  /** Colourfulness-weighted colour spread of the picture. Absent when nothing is colourful. */
  readonly spread?: number;
  /** `performance.now()` of the reading. */
  readonly sampledAt?: number;
}

function clamp01(x: number): number {
  return Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0;
}

/** Which cells are lit, from an rgba grid (0..1 display values). */
export function litMask(rgba: Float32Array): Uint8Array {
  const n = Math.floor(rgba.length / 4);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const v = Math.max(clamp01(rgba[4 * i]!), clamp01(rgba[4 * i + 1]!), clamp01(rgba[4 * i + 2]!));
    out[i] = v >= LIT ? 1 : 0;
  }
  return out;
}

/** Colourfulness-weighted hue spread of an rgba grid; undefined when nothing is colourful. */
export function pictureSpread(rgba: Float32Array): number | undefined {
  let cx = 0;
  let cy = 0;
  let w = 0;
  const n = Math.floor(rgba.length / 4);
  for (let i = 0; i < n; i++) {
    const r = clamp01(rgba[4 * i]!);
    const g = clamp01(rgba[4 * i + 1]!);
    const b = clamp01(rgba[4 * i + 2]!);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const c = max - min;
    if (max < LIT || c < COLOURFUL) continue;
    let h: number;
    if (max === r) h = ((g - b) / c + 6) % 6;
    else if (max === g) h = (b - r) / c + 2;
    else h = (r - g) / c + 4;
    const a = (h / 6) * 2 * Math.PI;
    cx += c * Math.cos(a);
    cy += c * Math.sin(a);
    w += c;
  }
  if (w < 3 * COLOURFUL) return undefined;
  return Math.max(0, Math.min(1, 1 - Math.hypot(cx, cy) / w));
}

/** Of the cells lit in either snapshot, the fraction lit in only one; undefined if none lit. */
export function pictureChange(prev: Uint8Array, cur: Uint8Array): number | undefined {
  let lit = 0;
  let flipped = 0;
  const n = Math.min(prev.length, cur.length);
  for (let i = 0; i < n; i++) {
    const a = prev[i]!;
    const b = cur[i]!;
    if (a === 0 && b === 0) continue;
    lit++;
    if (a !== b) flipped++;
  }
  return lit > 0 ? flipped / lit : undefined;
}

const SHADER = /* wgsl */ `
@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> outCells: array<vec4f>;
const GW: u32 = ${GRID_W}u;
const GH: u32 = ${GRID_H}u;
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  if (id.x >= GW || id.y >= GH) { return; }
  let dims = vec2f(textureDimensions(src));
  var acc = vec4f(0.0);
  for (var sy = 0u; sy < 3u; sy++) {
    for (var sx = 0u; sx < 3u; sx++) {
      let uv = (vec2f(f32(id.x), f32(id.y)) + (vec2f(f32(sx), f32(sy)) + 0.5) / 3.0) / vec2f(f32(GW), f32(GH));
      let p = min(vec2i(uv * dims), vec2i(dims) - vec2i(1));
      acc += textureLoad(src, p, 0);
    }
  }
  outCells[id.y * GW + id.x] = acc / 9.0;
}
`;

export class PictureProbe {
  private readonly device: GPUDevice;
  private pipeline: GPUComputePipeline | null = null;
  private layout: GPUBindGroupLayout | null = null;
  private cells: GPUBuffer | null = null;
  private readBuffer: GPUBuffer | null = null;
  private pending = false;
  private recorded = false;
  private lastRecord = -Infinity;
  private failed = false;
  /** Recent lit masks, oldest first, with their times: the 2 s comparison window. */
  private history: { mask: Uint8Array; at: number }[] = [];
  private latest: PictureReading = {};

  constructor(device: GPUDevice) {
    this.device = device;
  }

  get value(): PictureReading {
    return this.latest;
  }

  private build(): void {
    const d = this.device;
    this.layout = d.createBindGroupLayout({
      label: 'picture-probe',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'unfilterable-float' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      ],
    });
    this.pipeline = d.createComputePipeline({
      label: 'picture-probe',
      layout: d.createPipelineLayout({ bindGroupLayouts: [this.layout] }),
      compute: { module: d.createShaderModule({ code: SHADER, label: 'picture-probe' }), entryPoint: 'main' },
    });
    this.cells = d.createBuffer({
      label: 'picture-probe.cells',
      size: BYTES,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });
    this.readBuffer = d.createBuffer({
      label: 'picture-probe.read',
      size: BYTES,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
  }

  /** After the frame has been presented into `frame`, while the encoder is open: queue the grid if due. */
  record(encoder: GPUCommandEncoder, frame: GPUTexture, nowMs: number): void {
    if (this.failed || this.pending || nowMs - this.lastRecord < INTERVAL_MS) return;
    if ((frame.usage & GPUTextureUsage.TEXTURE_BINDING) === 0) {
      this.failed = true;
      return;
    }
    try {
      if (this.pipeline === null) this.build();
      const group = this.device.createBindGroup({
        layout: this.layout!,
        entries: [
          { binding: 0, resource: frame.createView() },
          { binding: 1, resource: { buffer: this.cells! } },
        ],
      });
      const pass = encoder.beginComputePass({ label: 'picture-probe' });
      pass.setPipeline(this.pipeline!);
      pass.setBindGroup(0, group);
      pass.dispatchWorkgroups(Math.ceil(GRID_W / 8), Math.ceil(GRID_H / 8));
      pass.end();
      encoder.copyBufferToBuffer(this.cells!, 0, this.readBuffer!, 0, BYTES);
      this.recorded = true;
      this.lastRecord = nowMs;
    } catch {
      this.failed = true;
    }
  }

  /** After submit: map what was copied and fold it in. */
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

  private fold(rgba: Float32Array, nowMs: number): void {
    const mask = litMask(rgba);
    this.history.push({ mask, at: nowMs });
    // Keep just enough history to compare against ~2 s ago.
    while (this.history.length > 2 && nowMs - this.history[1]!.at >= CHANGE_WINDOW_MS) this.history.shift();
    const old = this.history[0]!;
    const change = nowMs - old.at >= CHANGE_WINDOW_MS * 0.75 ? pictureChange(old.mask, mask) : this.latest.change;
    this.latest = { change, spread: pictureSpread(rgba), sampledAt: nowMs };
  }
}
