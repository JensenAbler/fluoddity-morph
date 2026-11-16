import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Heat, dyingScore, heatConfig, heatWorld, MAX_ANGLE_JITTER, PULSE_SECONDS } from './heat.ts';
import { SIMULATION_CONFIG_DEFAULTS, type SimulationConfig } from '../particleSystem/config.ts';

const DEFAULT_CONFIG = SIMULATION_CONFIG_DEFAULTS as unknown as SimulationConfig;

test('a lively picture is not dying; a frozen one is', () => {
  assert.equal(dyingScore(0.4, 0.1), 0);
  assert.equal(dyingScore(0.35, 0.3), 0);
  // Merely slowing now warms a little.
  assert.ok(dyingScore(0.2, 0.3) > 0.2);
  assert.equal(dyingScore(0.05, 1), 1);
  assert.equal(dyingScore(undefined, 0.3), 0);
  // Run 3, 1:26: 85% stuck while a colour flicker kept picture change at 0.32.
  assert.ok(dyingScore(0.32, 0.85) > 0.6);
  assert.equal(dyingScore(undefined, 1), 1);
  // Nov 15 run, seconds before the 2:46 freeze: change 0.11, 92% stuck.
  assert.ok(dyingScore(0.106, 0.92) > 0.6);
  // Same slowing with particles still travelling counts for less.
  assert.ok(dyingScore(0.14, 0) < dyingScore(0.14, 1));
});

function run(h: Heat, seconds: number, active: boolean, dying: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    h.step(1 / 60, active, dying);
    out.push(h.level);
  }
  return out;
}

test('heat comes as one pulse: up quickly, back to zero within 5 s', () => {
  const h = new Heat();
  const lv = run(h, PULSE_SECONDS - 0.05, true, 1);
  assert.ok(Math.max(...lv) > 0.95, 'reaches full');
  assert.ok(lv[29]! > 0.9, 'half a second in, nearly full');
  assert.ok(lv[lv.length - 1]! < 0.01, 'cooled to ~0 by the end of the pulse');
});

test('at most one pulse per 5 s, even while dying the whole time', () => {
  const h = new Heat();
  const lv = run(h, 20, true, 1);
  let starts = 0;
  for (let i = 1; i < lv.length; i++) if (lv[i - 1]! < 0.05 && lv[i]! >= 0.05) starts++;
  assert.ok(starts <= 4, `pulses in 20 s: ${starts}`);
  // Between pulses heat touches zero: no constant heat.
  assert.ok(lv.filter((x) => x < 0.05).length > 10);
});

test('no pulse when the scene is healthy, and none when inactive', () => {
  const h = new Heat();
  assert.equal(Math.max(...run(h, 10, true, 0.2)), 0);
  const g = new Heat();
  assert.equal(Math.max(...run(g, 10, false, 1)), 0);
});

test('pulse height follows how close to dying', () => {
  const h = new Heat();
  const lv = run(h, 2, true, 0.4);
  assert.ok(Math.abs(Math.max(...lv) - 0.4) < 0.02);
});

test('heat touches only jitter and trail fade, and nothing at zero', () => {
  const c = { ...DEFAULT_CONFIG, sensorAngleJitter: 0.1 };
  assert.equal(heatConfig(c, 0), c);
  assert.ok(Math.abs(heatConfig(c, 1).sensorAngleJitter - (0.1 + MAX_ANGLE_JITTER)) < 1e-12);
  const w = { trailPersistence: 0.99 } as Parameters<typeof heatWorld>[0];
  assert.equal(heatWorld(w, 0), w);
  assert.ok(Math.abs(heatWorld(w, 1).trailPersistence - 0.93) < 1e-9);
});
