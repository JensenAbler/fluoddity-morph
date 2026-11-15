import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blendKeepingLength, blendCenter, blendRule } from './ruleBlend.ts';

const norm = (v: readonly number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));

test('blend keeping length: exact ends, length moves in a straight line', () => {
  const a = [3, 0, 0, 0];
  const b = [0, 0, 0, 5];
  assert.deepEqual(blendKeepingLength(a, b, 0), a);
  assert.deepEqual(blendKeepingLength(a, b, 1), b);
  for (const u of [0.1, 0.25, 0.5, 0.75, 0.9]) {
    const m = blendKeepingLength(a, b, u);
    assert.ok(Math.abs(norm(m) - (3 + 2 * u)) < 1e-9, `length at ${u}: ${norm(m)}`);
  }
  // The straight line would have dipped: |(1.5,0,0,2.5)| = 2.92 < 4.
  assert.ok(norm(blendKeepingLength(a, b, 0.5)) > norm([1.5, 0, 0, 2.5]));
});

test('opposite directions turn through a perpendicular instead of through zero', () => {
  const a = [1, 0.2, 0, 0];
  const b = a.map((x) => -2 * x);
  let prev = blendKeepingLength(a, b, 0);
  let worst = 0;
  for (let i = 1; i <= 200; i++) {
    const m = blendKeepingLength(a, b, i / 200);
    assert.ok(norm(m) > 0.99 * norm(a), 'never collapses');
    worst = Math.max(worst, Math.max(...m.map((x, k) => Math.abs(x - prev[k]!))));
    prev = m;
  }
  assert.ok(worst < 0.05, `no jump: ${worst}`);
  const end = blendKeepingLength(a, b, 1);
  end.forEach((x, k) => assert.ok(Math.abs(x - b[k]!) < 1e-9));
});

test('a center blends frequency straight and amplitude keeping strength; a zero end stays straight', () => {
  const a = [1, 2, 3, 4, 2, 0, 0, 0];
  const b = [3, 2, 1, 0, 0, 2, 0, 0];
  const m = blendCenter(a, b, 0.5);
  assert.deepEqual(m.slice(0, 4), [2, 2, 2, 2]);
  assert.ok(Math.abs(norm(m.slice(4)) - 2) < 1e-9);
  const z = [0, 0, 0, 0, 0, 0, 0, 0];
  assert.deepEqual(blendCenter(z, b, 0.5), b.map((x) => x / 2));
  assert.equal(blendRule([...a, ...b], [...b, ...a], 0.25).length, 16);
});
