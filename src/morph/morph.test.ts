import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BC, IC, makeSimulationConfig, makeWorldSettings } from '../particleSystem/config.ts';
import { makeProject } from '../project/project.ts';
import {
  MorphTimeline,
  ease,
  lerpConfig,
  lerpProject,
  locate,
  totalSeconds,
} from './morph.ts';

function config(over: Record<string, unknown> = {}) {
  return makeSimulationConfig(
    {
      cohorts: 1,
      mutationSeed: 0.25,
      sensorGain: 1,
      sensorAngle: 0.5,
      sensorDistance: 10,
      mutationScale: 0,
      globalForceMult: 1,
      drag: 0.1,
      strafePower: 0,
      axialForce: 1,
      lateralForce: 1,
      hazardRate: 0,
    },
    { rule: Array.from({ length: 80 }, (_, i) => i / 80), ...over },
  );
}

test('numbers and rule floats blend linearly', () => {
  const a = config({ sensorGain: 0 });
  const b = config({ sensorGain: 2, rule: Array.from({ length: 80 }, () => 1) });
  const mid = lerpConfig(a, b, 0.5);
  assert.equal(mid.sensorGain, 1);
  assert.equal(mid.rule[0], 0.5);
  assert.equal(mid.rule.length, 80);
});

test('modes and booleans cut at the midpoint', () => {
  const a = config({ cohorts: 1, initialConditions: IC.GRID, radialGravity: false });
  const b = config({ cohorts: 16, initialConditions: IC.RING, radialGravity: true });
  assert.equal(lerpConfig(a, b, 0.49).cohorts, 1);
  assert.equal(lerpConfig(a, b, 0.51).cohorts, 16);
  assert.equal(lerpConfig(a, b, 0.49).radialGravity, false);
  assert.equal(lerpConfig(a, b, 0.51).initialConditions, IC.RING);
});

test('same rule, different seeds: dip mutation to zero and swap at the midpoint', () => {
  const a = config({ mutationSeed: 0.1, mutationScale: 0.2 });
  const b = config({ mutationSeed: 0.9, mutationScale: 0.4 });
  assert.ok(Math.abs(lerpConfig(a, b, 0.25).mutationScale - 0.1) < 1e-12);
  assert.equal(lerpConfig(a, b, 0.25).mutationSeed, 0.1);
  assert.ok(Math.abs(lerpConfig(a, b, 0.5).mutationScale) < 1e-12);
  assert.equal(lerpConfig(a, b, 0.5).mutationSeed, 0.9);
  assert.ok(Math.abs(lerpConfig(a, b, 0.75).mutationScale - 0.2) < 1e-12);
});

test('same seed blends mutation scale normally', () => {
  const a = config({ mutationScale: 0.2 });
  const b = config({ mutationScale: 0.4 });
  assert.ok(Math.abs(lerpConfig(a, b, 0.5).mutationScale - 0.3) < 1e-12);
});

test('a generated (all-zero) rule cuts rather than blends', () => {
  const a = config({ rule: Array.from({ length: 80 }, () => 0) });
  const b = config();
  assert.equal(lerpConfig(a, b, 0.3).rule, a.rule);
  assert.equal(lerpConfig(a, b, 0.7).rule, b.rule);
});

test('world blends and boundary cuts', () => {
  const a = makeProject({ configs: [config()], world: makeWorldSettings({ trailPersistence: 0.9, boundaryConditions: BC.WRAP }) });
  const b = makeProject({ configs: [config()], world: makeWorldSettings({ trailPersistence: 0.7, boundaryConditions: BC.BOUNCE }) });
  const mid = lerpProject(a, b, 0.25);
  assert.ok(Math.abs(mid.world.trailPersistence - 0.85) < 1e-12);
  assert.equal(mid.world.boundaryConditions, BC.WRAP);
});

test('endpoints return the keyframe projects themselves', () => {
  const a = makeProject({ configs: [config()] });
  const b = makeProject({ configs: [config({ drag: 1 })] });
  assert.equal(lerpProject(a, b, 0), a);
  assert.equal(lerpProject(a, b, 1), b);
});

test('easing is clamped and smooth is symmetric', () => {
  assert.equal(ease(-1, 'smooth'), 0);
  assert.equal(ease(2, 'linear'), 1);
  assert.equal(ease(0.5, 'smooth'), 0.5);
});

test('timeline: holds, transitions, totals, looping', () => {
  const tl = new MorphTimeline();
  const a = tl.add(makeProject({ configs: [config({ drag: 0 })] }));
  const b = tl.add(makeProject({ configs: [config({ drag: 1 })] }));
  tl.setTiming(a.key, { hold: 1, duration: 4 });
  tl.setTiming(b.key, { hold: 2, duration: 3 });
  assert.equal(totalSeconds(tl.keyframes, false), 7);
  assert.equal(totalSeconds(tl.keyframes, true), 10);
  assert.deepEqual(locate(tl.keyframes, 0.5, false), { from: 0, to: 0, u: 0, segment: 0 });
  assert.deepEqual(locate(tl.keyframes, 3, false), { from: 0, to: 1, u: 0.5, segment: 0 });
  assert.deepEqual(locate(tl.keyframes, 8.5, true), { from: 1, to: 0, u: 0.5, segment: 1 });

  tl.easing = 'linear';
  assert.equal(tl.play(), true);
  const p = tl.advance(3);
  assert.equal(p?.configs[0]?.drag, 0.5);
  tl.advance(100);
  assert.equal(tl.playing, false);
  assert.equal(tl.current()?.configs[0]?.drag, 1);
});

test('timeline: looping wraps instead of stopping', () => {
  const tl = new MorphTimeline();
  tl.loop = true;
  tl.add(makeProject({ configs: [config()] }));
  tl.add(makeProject({ configs: [config()] }));
  tl.play();
  tl.advance(tl.total + 1);
  assert.equal(tl.playing, true);
  assert.ok(Math.abs(tl.time - 1) < 1e-9);
});

test('timeline: move and remove', () => {
  const tl = new MorphTimeline();
  const a = tl.add(makeProject({ configs: [config()] }));
  const b = tl.add(makeProject({ configs: [config()] }));
  tl.move(b.key, -1);
  assert.deepEqual(tl.keyframes.map((k) => k.key), [b.key, a.key]);
  tl.remove(b.key);
  assert.deepEqual(tl.keyframes.map((k) => k.key), [a.key]);
});

test('a moving rule under mutation is staged: never blended while mutating', () => {
  const a = config({ mutationScale: 0.3, mutationSeed: 0.1 });
  const b = config({ mutationScale: 0.2, mutationSeed: 0.9, rule: Array.from({ length: 80 }, () => 1) });
  for (let u = 0.01; u < 1; u += 0.01) {
    const c = lerpConfig(a, b, u);
    const ruleMoving = c.rule !== a.rule && c.rule !== b.rule;
    if (ruleMoving) assert.equal(c.mutationScale, 0, `u=${u}`);
  }
  assert.equal(lerpConfig(a, b, 0.5).rule[0], (a.rule[0]! + 1) / 2);
  assert.ok(Math.abs(lerpConfig(a, b, 0.125).mutationScale - 0.15) < 1e-12);
  assert.ok(Math.abs(lerpConfig(a, b, 0.875).mutationScale - 0.1) < 1e-12);
});
