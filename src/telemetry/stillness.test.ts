import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stuckFraction, isDead } from './temperature.ts';

function particles(n: number, at: (i: number) => [number, number]): Float32Array {
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) [out[2 * i], out[2 * i + 1]] = at(i);
  return out;
}

test('jiggling in place counts as stuck; travelling does not; wraps are ignored', () => {
  const a = particles(100, (i) => [i * 0.1, 0]);
  // Jiggled all second but ended up nearly where it started.
  const jiggle = particles(100, (i) => [i * 0.1 + 0.003, 0.002]);
  assert.equal(stuckFraction(a, jiggle, 1), 1);
  const travel = particles(100, (i) => [i * 0.1 + 0.05, 0]);
  assert.equal(stuckFraction(a, travel, 1), 0);
  // Half wrapped across the world (ignored), half stuck: all measured ones stuck.
  const wrapped = particles(100, (i) => (i < 50 ? [i * 0.1 + 1.8, 0] : [i * 0.1, 0]));
  assert.equal(stuckFraction(a, wrapped, 1), 1);
});

test('dead when most are stuck, or one colour -- unless one colour is by design', () => {
  assert.equal(isDead(0.7, 0.6, 0.3), true, 'stuck');
  assert.equal(isDead(0.2, 0.6, 0.3), false, 'alive');
  assert.equal(isDead(0.2, 0.01, 0.3), true, 'one colour');
  assert.equal(isDead(0.2, 0.01, 0), false, 'sensitivity 0: one colour by design');
  assert.equal(isDead(undefined, undefined, 0.3), false, 'unknown is not dead');
});
