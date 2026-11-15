import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HueAnchor, wrapHalf, RETURN_TURNS_PER_SECOND } from './hueAnchor.ts';

/** Simulate: the shared hue drifts at `rate` turns/s; readings every 0.25 s; frames at 60 fps. */
function run(a: HueAnchor, seconds: number, rate: number, spread: number, active = true, start = { hue: 0, t: 0 }) {
  let shown: number[] = [];
  const dt = 1 / 60;
  for (let i = 0; i < seconds * 60; i++) {
    start.t += dt;
    start.hue = (start.hue + rate * dt) % 1;
    if (i % 15 === 0) a.observe({ meanHue: start.hue, colorSpread: spread, sampledAt: start.t });
    a.step(dt, active);
    shown.push(wrapHalf(start.hue + a.offset));
  }
  return shown;
}

test('one colour spinning fast: the shown colour holds nearly still', () => {
  const a = new HueAnchor();
  const shown = run(a, 10, 0.8, 0.02); // 8 full turns of rainbow, uncorrected
  const later = shown.slice(60);
  const span = Math.max(...later.map((h) => Math.abs(wrapHalf(h - later[0]!))));
  assert.ok(span < 0.05, `shown colour wandered ${span} turns`);
  assert.ok(Math.abs(a.offset) <= 0.5);
});

test('letting go goes home the short way, never replaying the absorbed turns', () => {
  const a = new HueAnchor();
  const clock = { hue: 0, t: 0 };
  run(a, 10, 0.8, 0.02, true, clock);
  const before = Math.abs(a.offset);
  // Colours come back and the hue stops sliding.
  const shown = run(a, 30, 0, 0.6, true, clock);
  assert.equal(a.offset, 0, 'home');
  let travelled = 0;
  for (let i = 1; i < shown.length; i++) travelled += Math.abs(wrapHalf(shown[i]! - shown[i - 1]!));
  assert.ok(travelled <= before + 1e-6, `travelled ${travelled} turns home from ${before}`);
  assert.ok(travelled <= 0.5 + 1e-6);
  // ...and slowly: no faster than the return rate.
  for (let i = 1; i < shown.length; i++) {
    assert.ok(Math.abs(wrapHalf(shown[i]! - shown[i - 1]!)) <= RETURN_TURNS_PER_SECOND / 60 + 1e-9);
  }
});

test('varied colours and idle simulation leave the colours exactly as saved', () => {
  const a = new HueAnchor();
  run(a, 5, 0.3, 0.7);
  assert.equal(a.offset, 0, 'varied: no hold');
  const b = new HueAnchor();
  run(b, 5, 0.8, 0.02, false);
  assert.equal(b.offset, 0, 'not evolving or morphing: no hold');
});

test('wrapHalf keeps turns within half a turn', () => {
  assert.equal(wrapHalf(0.75), -0.25);
  assert.equal(wrapHalf(-0.75), 0.25);
  assert.equal(wrapHalf(3.1).toFixed(6), (0.1).toFixed(6));
});
