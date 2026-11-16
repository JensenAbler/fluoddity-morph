import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Heat, dyingScore, heatConfig, heatWorld, MAX_ANGLE_JITTER } from './heat.ts';
import { SIMULATION_CONFIG_DEFAULTS, type SimulationConfig } from '../particleSystem/config.ts';

const DEFAULT_CONFIG = SIMULATION_CONFIG_DEFAULTS as unknown as SimulationConfig;

test('a lively picture is not dying; a frozen one is', () => {
  assert.equal(dyingScore(0.4, 0.1), 0);
  assert.equal(dyingScore(0.2, 1), 0);
  assert.equal(dyingScore(0.05, 1), 1);
  assert.equal(dyingScore(undefined, 1), 0);
  // Nov 15 run, seconds before the 2:46 freeze: change 0.11, 92% stuck.
  assert.ok(dyingScore(0.106, 0.92) > 0.6);
  // Same slowing with particles still travelling counts for less.
  assert.ok(dyingScore(0.14, 0) < dyingScore(0.14, 1));
});

test('heat rises quickly, falls slowly, and is zero when inactive', () => {
  const h = new Heat();
  for (let i = 0; i < 60; i++) h.step(1 / 60, true, 1);
  assert.ok(h.level > 0.6 && h.level < 0.7, `one second up: ${h.level}`);
  const peak = h.level;
  for (let i = 0; i < 60; i++) h.step(1 / 60, true, 0);
  assert.ok(h.level > peak * 0.8, 'one second later still mostly warm');
  for (let i = 0; i < 60 * 60; i++) h.step(1 / 60, false, 1);
  assert.equal(h.level, 0);
});

test('heat touches only jitter and trail fade, and nothing at zero', () => {
  const c = { ...DEFAULT_CONFIG, sensorAngleJitter: 0.1 };
  assert.equal(heatConfig(c, 0), c);
  assert.ok(Math.abs(heatConfig(c, 1).sensorAngleJitter - (0.1 + MAX_ANGLE_JITTER)) < 1e-12);
  const w = { trailPersistence: 0.99 } as Parameters<typeof heatWorld>[0];
  assert.equal(heatWorld(w, 0), w);
  assert.ok(Math.abs(heatWorld(w, 1).trailPersistence - 0.96) < 1e-9);
});
