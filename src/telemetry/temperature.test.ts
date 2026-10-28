import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TemperatureProbe } from './temperature.ts';

/** Entities as the GPU lays them out: (pos.x, pos.y, vel.x, vel.y, misc x4). */
function entities(points: readonly [number, number, number][]): Float32Array {
  const f = new Float32Array(points.length * 8);
  points.forEach(([x, y, speed], i) => {
    f[8 * i] = x;
    f[8 * i + 1] = y;
    f[8 * i + 2] = speed;
  });
  return f;
}

function fold(probe: TemperatureProbe, f: Float32Array, nowMs: number): void {
  (probe as unknown as { fold(f: Float32Array, nowMs: number): void }).fold(f, nowMs);
}

test('still means most particles going nowhere -- stopped or jiggling in place', () => {
  const probe = new TemperatureProbe({} as GPUDevice);
  const start = Array.from({ length: 100 }, (_, i) => [i * 0.01, 0, 0.01] as [number, number, number]);
  fold(probe, entities(start), 0);
  assert.equal(probe.value.cold, false, 'one sample alone says nothing');

  // 70 jiggle fast but end up where they were; 30 travel.
  const jiggle = start.map(([x, y], i) => (i < 70 ? [x + 0.001, y, 0.02] : [x + 0.1, y, 0.02]) as [number, number, number]);
  fold(probe, entities(jiggle), 1000);
  assert.ok(Math.abs(probe.value.stuck - 0.7) < 1e-9, `stuck ${probe.value.stuck}`);
  assert.equal(probe.value.cold, true, 'fast but going nowhere is still');

  // Everyone travels, gently: not still, however slow next to a lively spell.
  const flow = jiggle.map(([x, y]) => [x + 0.05, y, 0.001] as [number, number, number]);
  fold(probe, entities(flow), 2000);
  assert.equal(probe.value.stuck, 0);
  assert.equal(probe.value.cold, false);

  // A wrap or respawn jump is neither motion nor stillness.
  const jump = flow.map(([x, y], i) => (i < 60 ? [x + 1.5, y, 0.001] : [x + 0.05, y, 0.001]) as [number, number, number]);
  fold(probe, entities(jump), 3000);
  assert.equal(probe.value.stuck, 0);
});
