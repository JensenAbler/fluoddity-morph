import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HueAnchor, wrapHalf, RETURN_TURNS_PER_SECOND } from './hueAnchor.ts';

interface World {
  t: number;
  /** The shared signal. */
  s: number;
  /** Colour sensitivity and offset genes. */
  A: number;
  B: number;
}

/**
 * Run `seconds` at 60 fps. `change` moves the world each frame; the probe
 * reads the signal four times a second. Returns the shown hue every frame.
 */
function run(a: HueAnchor, w: World, seconds: number, spread: number, change: (w: World, dt: number) => void, active = true) {
  const shown: number[] = [];
  const dt = 1 / 60;
  for (let i = 0; i < seconds * 60; i++) {
    w.t += dt;
    change(w, dt);
    if (i % 15 === 0) a.observe({ meanSignal: w.s, colorSpread: spread, sampledAt: w.t });
    const off = a.step(dt, active, w.A, w.B);
    shown.push(wrapHalf(w.A * w.s + w.B + off));
  }
  return shown;
}

const span = (xs: number[]) => Math.max(...xs.map((h) => Math.abs(wrapHalf(h - xs[0]!))));

test('sensitivity sweeping fast: the shown colour does not move at all', () => {
  const a = new HueAnchor();
  const w = { t: 0, s: 3, A: 0.2, B: 0.1 };
  run(a, w, 0.5, 0.02, () => {}); // settle
  // Sensitivity 0.2 -> 0.6 in 2 s with signal 3: 1.2 turns of rainbow, plus an offset slide.
  const shown = run(a, w, 2, 0.02, (x, dt) => {
    x.A += 0.2 * dt;
    x.B += 0.1 * dt;
  });
  assert.ok(span(shown) < 1e-6, `moved ${span(shown)} turns`);
});

test('the rule moving the signal: held within a sliver after the first reading', () => {
  const a = new HueAnchor();
  const w = { t: 0, s: 0, A: 0.4, B: 0 };
  run(a, w, 0.5, 0.02, () => {});
  const shown = run(a, w, 5, 0.02, (x, dt) => {
    x.s += 1.5 * dt; // 0.6 turns a second of slide, unseen by the genes
  });
  assert.ok(span(shown.slice(30)) < 0.03, `wandered ${span(shown.slice(30))} turns`);
});

test('letting go goes home the short way, slowly, never replaying the absorbed turns', () => {
  const a = new HueAnchor();
  const w = { t: 0, s: 2, A: 0.2, B: 0 };
  run(a, w, 4, 0.02, (x, dt) => (x.A += 0.5 * dt)); // absorbs 4 turns
  assert.ok(Math.abs(a.offset) <= 0.5);
  const before = Math.abs(a.offset);
  const shown = run(a, w, 30, 0.6, () => {});
  assert.equal(a.offset, 0, 'home');
  let travelled = 0;
  for (let i = 1; i < shown.length; i++) {
    const step = Math.abs(wrapHalf(shown[i]! - shown[i - 1]!));
    assert.ok(step <= RETURN_TURNS_PER_SECOND / 60 + 1e-9, 'slowly');
    travelled += step;
  }
  assert.ok(travelled <= before + 1e-6 && travelled <= 0.5 + 1e-6, `travelled ${travelled}`);
});

test('varied colours and an idle simulation leave the colours exactly as saved', () => {
  const a = new HueAnchor();
  run(a, { t: 0, s: 1, A: 0.2, B: 0 }, 5, 0.7, (x, dt) => (x.A += 0.3 * dt));
  assert.equal(a.offset, 0, 'varied: no hold');
  const b = new HueAnchor();
  run(b, { t: 0, s: 1, A: 0.2, B: 0 }, 5, 0.02, (x, dt) => (x.A += 0.3 * dt), false);
  assert.equal(b.offset, 0, 'not evolving or morphing: no hold');
});

test('wrapHalf keeps turns within half a turn', () => {
  assert.equal(wrapHalf(0.75), -0.25);
  assert.equal(wrapHalf(-0.75), 0.25);
  assert.equal(wrapHalf(3.1).toFixed(6), (0.1).toFixed(6));
});
