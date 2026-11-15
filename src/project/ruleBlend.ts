/**
 * Blending two rules without letting them cancel.
 *
 * A rule is 10 Fourier centers of 8 floats: a 4D FREQUENCY (where in signal
 * space the term ripples) then a 4D AMPLITUDE (how hard it pushes). See
 * `FourierCenter` in common.wgsl.
 *
 * A straight-line blend of two unrelated rules partly CANCELS: the amplitude
 * vectors point different ways, so their average is shorter than either. On
 * Introspection -> Bridges (Nov 15) the blended amplitudes kept only ~70% of the
 * strength of the two ends a quarter of the way along -- weaker than the weaker
 * favorite. A weaker rule is a quieter, less organised creature.
 *
 * So the amplitude is blended in two parts, DIRECTION and LENGTH: the
 * direction turns from one favorite's to the other's at a steady angular rate
 * (slerp), and the length moves in a straight line from one to the other. The
 * midpoint is never weaker than the two ends. Frequencies still blend in a
 * straight line: they say where a term ripples, not how strongly.
 *
 * Pure; shared by the morph timeline and Path mode.
 */

export const CENTER_FLOATS = 8;
const AMP_START = 4;
const AMP_FLOATS = 4;

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

function norm(v: readonly number[]): number {
  let s = 0;
  for (const x of v) s += x * x;
  return Math.sqrt(s);
}

/**
 * Blend two vectors keeping their strength: direction by slerp, length by
 * lerp. Equals `a` at 0 and `b` at 1. When one end is (near) zero there is no
 * direction to keep and the straight line is already exact.
 */
export function blendKeepingLength(a: readonly number[], b: readonly number[], u: number): number[] {
  const na = norm(a);
  const nb = norm(b);
  if (u <= 0) return [...a];
  if (u >= 1) return [...b];
  if (na < 1e-9 || nb < 1e-9) return a.map((x, k) => lerp(x, b[k] ?? x, u));
  const da = a.map((x) => x / na);
  const db = b.map((x) => x / nb);
  let cos = 0;
  for (let k = 0; k < da.length; k++) cos += da[k]! * (db[k] ?? 0);
  cos = Math.max(-1, Math.min(1, cos));
  const len = lerp(na, nb, u);
  let dir: number[];
  if (cos > 0.9999) {
    // Nearly the same direction: the straight line is already a turn of ~0.
    dir = da.map((x, k) => lerp(x, db[k] ?? x, u));
  } else if (cos > -0.9999) {
    const theta = Math.acos(cos);
    const s = Math.sin(theta);
    const wa = Math.sin((1 - u) * theta) / s;
    const wb = Math.sin(u * theta) / s;
    dir = da.map((x, k) => wa * x + wb * (db[k] ?? 0));
  } else {
    // Opposite directions: any turn of 180 degrees works. Turn through a fixed
    // perpendicular so the path is smooth rather than through zero.
    const perp = perpendicular(da);
    const c = Math.cos(Math.PI * u);
    const sn = Math.sin(Math.PI * u);
    dir = da.map((x, k) => c * x + sn * perp[k]!);
  }
  const nd = norm(dir) || 1;
  return dir.map((x) => (x / nd) * len);
}

/** A unit vector perpendicular to unit `d`, chosen deterministically. */
function perpendicular(d: readonly number[]): number[] {
  // Start from the axis d leans on least, then remove d's share.
  let k0 = 0;
  for (let k = 1; k < d.length; k++) if (Math.abs(d[k]!) < Math.abs(d[k0]!)) k0 = k;
  const e = d.map((_, k) => (k === k0 ? 1 : 0));
  const dot = d[k0]!;
  const p = e.map((x, k) => x - dot * d[k]!);
  const n = norm(p) || 1;
  return p.map((x) => x / n);
}

/** Blend ONE Fourier center (8 floats): frequency straight, amplitude keeping its strength. */
export function blendCenter(a: readonly number[], b: readonly number[], u: number): number[] {
  const out = a.map((x, k) => lerp(x, b[k] ?? x, u));
  if (a.length < AMP_START + AMP_FLOATS || b.length < AMP_START + AMP_FLOATS) return out;
  const amp = blendKeepingLength(
    a.slice(AMP_START, AMP_START + AMP_FLOATS),
    b.slice(AMP_START, AMP_START + AMP_FLOATS),
    u,
  );
  for (let k = 0; k < AMP_FLOATS; k++) out[AMP_START + k] = amp[k]!;
  return out;
}

/** Blend two whole rules center by center. Lengths are assumed equal. */
export function blendRule(a: readonly number[], b: readonly number[], u: number): number[] {
  const out: number[] = [];
  for (let start = 0; start < a.length; start += CENTER_FLOATS) {
    out.push(...blendCenter(a.slice(start, start + CENTER_FLOATS), b.slice(start, start + CENTER_FLOATS), u));
  }
  return out;
}
