import { test } from 'node:test';
import assert from 'node:assert/strict';
import { litMask, pictureChange, pictureSpread } from './pictureProbe.ts';

/** A grid of n cells; `at(i)` gives display rgb, 0..1. */
function grid(n: number, at: (i: number) => [number, number, number]): Float32Array {
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const [r, g, b] = at(i);
    out.set([r, g, b, 1], 4 * i);
  }
  return out;
}

test('one-colour creature on a varied dim haze reads as one colour', () => {
  const g = grid(400, (i) =>
    i < 100 ? [0.9, 0.1, 0.1] : ([[0.08, 0, 0], [0, 0.08, 0], [0, 0, 0.08]][i % 3] as [number, number, number]),
  );
  assert.ok(pictureSpread(g)! < 0.05, String(pictureSpread(g)));
  const rainbow = grid(300, (i) => [[0.9, 0, 0], [0, 0.9, 0], [0, 0, 0.9]][i % 3] as [number, number, number]);
  assert.ok(pictureSpread(rainbow)! > 0.9);
  assert.equal(pictureSpread(grid(50, () => [0.8, 0.8, 0.8])), undefined, 'grey: no colour to judge');
});

test('a colour strobe over a frozen shape is still; a moving shape is not', () => {
  const shape = (i: number) => i % 7 < 3;
  const red = grid(700, (i) => (shape(i) ? [0.9, 0.1, 0.1] : [0, 0, 0]));
  const blue = grid(700, (i) => (shape(i) ? [0.1, 0.1, 0.6] : [0, 0, 0]));
  assert.equal(pictureChange(litMask(red), litMask(blue)), 0, 'recoloured, not changed');
  const moved = grid(700, (i) => (shape(i + 2) ? [0.9, 0.1, 0.1] : [0, 0, 0]));
  assert.ok(pictureChange(litMask(red), litMask(moved))! > 0.5);
  const dark = litMask(grid(10, () => [0, 0, 0]));
  assert.equal(pictureChange(dark, dark), undefined);
});
