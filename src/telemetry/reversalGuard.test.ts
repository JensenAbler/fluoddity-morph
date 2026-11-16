import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CENTERS, ReversalGuard, assess, drive, driveAndGradient } from './reversalGuard.ts';

function rule(axs: number[], seed = 1): number[] {
  const r: number[] = [];
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < CENTERS; i++) r.push(rnd(), rnd(), rnd(), rnd(), axs[i] ?? 0, rnd(), rnd(), rnd() * 0.5);
  return r;
}

test('drive is linear in each amplitude.x, with the gradient we report', () => {
  const r = rule(Array.from({ length: 10 }, (_, i) => (i % 3) - 1));
  const s = [0.3, -0.2, 0.5, 0.1];
  const { drive: d, grad } = driveAndGradient(r, s);
  const r2 = [...r];
  r2[3 * 8 + 4]! += 0.7;
  assert.ok(Math.abs(drive(r2, s) - (d + 0.7 * grad[3]!)) < 1e-9);
});

test('a flip ahead is detected; a steady rule is not', () => {
  const now = rule(Array(10).fill(1));
  const meanDrive = 1.5;
  const flipped = now.map((v, j) => (j % 8 === 4 ? -v : v));
  assert.ok(assess(now, flipped, meanDrive).risk > 0.5);
  assert.ok(assess(now, now, meanDrive).risk < 0.2);
});

/**
 * A closed loop: a population in lockstep senses one fixed input, and its
 * measured drive is whatever the (detoured) rule gives that input. The genes
 * slide over 8 s toward a rule that reverses the drive. Returns the first
 * time the drive turns into a brake (Infinity if never).
 */
function firstBrake(guarded: boolean): number {
  const g = new ReversalGuard();
  const start = rule(Array(10).fill(1), 7);
  const end = start.map((v, j) => (j % 8 === 4 ? -v : v));
  // An input with a solid forward drive under the start rule.
  let input = [0.1, 0.1, 0.1, 0.1];
  for (let k = 0; k < 2000 && drive(start, input) < 1; k++) {
    const s = 0.05 * (k + 1);
    input = [Math.sin(k) * s, Math.cos(k * 1.3) * s, Math.sin(k * 0.7) * s, Math.cos(k * 2.1) * s];
  }
  for (let t = 0; t <= 10; t += 1 / 30) {
    const k = Math.min(1, t / 8);
    const r = start.map((v, j) => v + (end[j]! - v) * k);
    const eff = r.map((v, j) => (j % 8 === 4 ? v + (guarded ? g.offset[(j - 4) / 8]! : 0) : v));
    const d = drive(eff, input);
    if (d < 0) return t;
    g.update(1 / 30, true, r, d, 0.01);
  }
  return Infinity;
}

test('the guard steers a population in lockstep away from a predicted brake', () => {
  const bare = firstBrake(false);
  const steered = firstBrake(true);
  assert.ok(bare < 8, `without the guard the drive reverses (at ${bare} s)`);
  assert.ok(steered > bare + 1, `the guard holds it off: ${steered} s vs ${bare} s`);
});

test('no detour when not in lockstep, or when inactive', () => {
  const g = new ReversalGuard();
  const r = rule(Array(10).fill(1));
  for (let i = 0; i < 300; i++) g.update(1 / 60, true, r.map((v, j) => (j % 8 === 4 ? v - i / 100 : v)), 1, 0.9);
  assert.equal(g.size, 0);
  for (let i = 0; i < 300; i++) g.update(1 / 60, false, r, 1, 0.01);
  assert.equal(g.size, 0);
});
