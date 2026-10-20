import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeSimulationConfig, makeWorldSettings } from '../particleSystem/config.ts';
import { makeProject } from '../project/project.ts';
import {
  DEFAULT_SETTINGS,
  Evolver,
  GENE_COUNT,
  SCALARS,
  durationFor,
  pickAttractor,
} from './evolve.ts';
import { SEED_LIKES } from './seedPool.ts';

function seeded(seed = 1): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function project(ruleValue: number, gain = 0.4) {
  return makeProject({
    configs: [
      makeSimulationConfig(
        {
          cohorts: 1,
          mutationSeed: 0.5,
          sensorGain: gain,
          sensorAngle: 0.07,
          sensorDistance: 1.5,
          mutationScale: 0,
          globalForceMult: 0.15,
          drag: 0.5,
          strafePower: 0.39,
          axialForce: 0.37,
          lateralForce: -0.7,
          hazardRate: 0,
        },
        { rule: Array.from({ length: 80 }, () => ruleValue) },
      ),
    ],
    world: makeWorldSettings(),
  });
}

test('likes weight the pick', () => {
  const ev = new Evolver(seeded(3));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 9 },
  ]);
  const rng = seeded(7);
  let b = 0;
  for (let i = 0; i < 2000; i++) if (pickAttractor(ev.attractors, rng)?.name === 'b') b++;
  assert.ok(b > 1650 && b < 1950, String(b));
});

test('durations span min..max and skew shifts them', () => {
  const s = { ...DEFAULT_SETTINGS, minSeconds: 5, maxSeconds: 80, skew: 0 };
  assert.ok(Math.abs(durationFor(0, s) - 5) < 1e-9);
  assert.ok(Math.abs(durationFor(1, s) - 80) < 1e-9);
  assert.ok(durationFor(0.5, { ...s, skew: 1 }) > durationFor(0.5, s));
  assert.ok(durationFor(0.5, { ...s, skew: -1 }) < durationFor(0.5, s));
});

test('the rule stays on its leash: always near some attractor', () => {
  const ev = new Evolver(seeded(11));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.settings.ruleWander = 0.15;
  ev.start(null);
  for (let i = 0; i < 3000; i++) {
    const p = ev.step(0.1)!;
    for (const v of p.configs[0]!.rule) assert.ok(v > -0.9 && v < 1.9, `rule drifted to ${v}`);
  }
});

test('settings stay inside their slider ranges and output is baked', () => {
  const ev = new Evolver(seeded(5));
  ev.setPool([{ name: 'a', project: project(0.5, 7.9), likes: 1 }]);
  ev.settings.settingWander = 0.5;
  ev.start(null);
  for (let i = 0; i < 2000; i++) {
    const p = ev.step(0.2)!;
    const c = p.configs[0]! as unknown as Record<string, number>;
    for (const spec of SCALARS) {
      if (spec.source !== 'config') continue;
      assert.ok(c[spec.field]! >= spec.lo - 1e-9 && c[spec.field]! <= spec.hi + 1e-9, spec.field);
    }
    assert.equal(p.configs[0]!.mutationScale, 0);
    assert.equal(p.configs[0]!.cohorts, 1);
  }
});

test('static ranks hold still, fluid ranks wander', () => {
  const ev = new Evolver(seeded(9));
  ev.setPool([{ name: 'a', project: project(0), likes: 1 }]);
  ev.settings.mode = 'static';
  ev.start(null);
  const before = [...ev.ranks];
  for (let i = 0; i < 100; i++) ev.step(1);
  assert.deepEqual(ev.ranks, before);
  ev.settings.mode = 'fluid';
  ev.settings.fluidSeconds = 30;
  for (let i = 0; i < 100; i++) ev.step(1);
  assert.notDeepEqual(ev.ranks, before);
  assert.equal(ev.ranks.length, GENE_COUNT);
  assert.ok(ev.ranks.every((r) => r >= 0 && r <= 1));
});

test('Indigo Flame Society seeds with three likes', () => {
  assert.equal(SEED_LIKES['indigo flame society'], 3);
});

test('it never rests: genes are always in motion', () => {
  const ev = new Evolver(seeded(21));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.start(project(0.5));
  let previous = ev.current()!.configs[0]!.rule.join(',');
  for (let i = 0; i < 600; i++) {
    const rule = ev.step(0.25)!.configs[0]!.rule.join(',');
    assert.notEqual(rule, previous, `frozen at step ${i}`);
    previous = rule;
  }
});

test('exploration 0 and no wander: every target is exactly a favorite', () => {
  const ev = new Evolver(seeded(8));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.settings.exploration = 0;
  ev.settings.ruleWander = 0;
  ev.settings.mode = 'static';
  ev.start(project(0.5));
  // Springs may overshoot a MOVING target slightly; never far past a favorite.
  for (let i = 0; i < 400; i++) {
    const p = ev.step(0.5)!;
    for (const v of p.configs[0]!.rule) assert.ok(v > -0.1 && v < 1.1, String(v));
  }
});

test('exploration reaches past the favorites, but stays leashed', () => {
  const ev = new Evolver(seeded(13));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.settings.exploration = 1;
  ev.settings.ruleWander = 0;
  ev.start(project(0.5));
  let beyond = false;
  for (let i = 0; i < 4000; i++) {
    for (const v of ev.step(0.25)!.configs[0]!.rule) {
      assert.ok(v >= -0.65 && v <= 1.65, `escaped the leash: ${v}`);
      if (v < -0.05 || v > 1.05) beyond = true;
    }
  }
  assert.ok(beyond, 'never explored past a favorite');
});

test('momentum: velocity never collapses to zero while the point glides', () => {
  const ev = new Evolver(seeded(31));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.settings.mode = 'static';
  ev.start(project(0));
  // Let it get going, then watch one rule float's speed between frames.
  for (let i = 0; i < 40; i++) ev.step(0.1);
  let prev = ev.current()!.configs[0]!.rule[0]!;
  let stalls = 0;
  for (let i = 0; i < 1500; i++) {
    const now = ev.step(0.1)!.configs[0]!.rule[0]!;
    if (Math.abs(now - prev) < 1e-5) stalls++;
    prev = now;
  }
  // A turn at the end of a line passes through zero velocity once; it must
  // be a moment, not a habit.
  assert.ok(stalls < 30, `stalled ${stalls} frames`);
});

test('♥0 mutes an attractor: never picked while others have likes', () => {
  const ev = new Evolver(seeded(5));
  ev.setPool([
    { name: 'muted', project: project(0), likes: 0 },
    { name: 'liked', project: project(1), likes: 1 },
  ]);
  const rng = seeded(9);
  for (let i = 0; i < 500; i++) assert.equal(pickAttractor(ev.attractors, rng)?.name, 'liked');
});

test('physics settings never extrapolate past the favorites', () => {
  const low = project(0, 0.4);
  const high = project(1, 6);
  const ev = new Evolver(seeded(17));
  ev.setPool([
    { name: 'a', project: low, likes: 1 },
    { name: 'b', project: high, likes: 1 },
  ]);
  ev.settings.exploration = 1;
  ev.settings.settingWander = 0;
  ev.start(low);
  for (let i = 0; i < 3000; i++) {
    const gain = ev.step(0.2)!.configs[0]!.sensorGain;
    assert.ok(gain >= 0.4 - 0.05 && gain <= 6 + 0.05, `gain ${gain}`);
  }
});

test('physics settings travel together: drag and force stay on the line between presets', () => {
  const mk = (drag: number, force: number) =>
    makeProject({
      configs: [
        makeSimulationConfig(
          {
            cohorts: 1, mutationSeed: 0.5, sensorGain: 1, sensorAngle: 0.1, sensorDistance: 1.5,
            mutationScale: 0, globalForceMult: force, drag, strafePower: 0.2, axialForce: 0.3,
            lateralForce: -0.5, hazardRate: 0,
          },
          { rule: Array.from({ length: 80 }, () => 0.5) },
        ),
      ],
      world: makeWorldSettings(),
    });
  const a = mk(0.5, 0.15);
  const b = mk(0.125, 0.94);
  const ev = new Evolver(seeded(23));
  ev.setPool([
    { name: 'a', project: a, likes: 1 },
    { name: 'b', project: b, likes: 1 },
  ]);
  ev.settings.settingWander = 0;
  ev.settings.mode = 'fluid';
  ev.start(a);
  for (let i = 0; i < 1500; i++) {
    const c = ev.step(0.2)!.configs[0]!;
    const td = (c.drag - 0.5) / (0.125 - 0.5);
    const tf = (c.globalForceMult - 0.15) / (0.94 - 0.15);
    assert.ok(Math.abs(td - tf) < 1e-6, `drag at ${td.toFixed(3)} of the way, force at ${tf.toFixed(3)}`);
  }
});

test('cold: the drift hurries, then turns back toward where it was alive', () => {
  const ev = new Evolver(seeded(41));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.settings.exploration = 0.5;
  ev.start(project(0));
  for (let i = 0; i < 20; i++) ev.step(0.1);
  const w0 = ev.debug().w;
  ev.step(1);
  const warmStep = ev.debug().w - w0;
  ev.setTemperature({ relative: 0.05, cold: true, coldFor: 1 });
  const w1 = ev.debug().w;
  ev.step(1);
  const coldStep = ev.debug().w - w1;
  assert.ok(Math.abs(coldStep) > Math.abs(warmStep) * 2.5, `${coldStep} vs ${warmStep}`);
  const dir = ev.debug().dir;
  ev.setTemperature({ relative: 0.05, cold: true, coldFor: 9 });
  ev.step(0.1);
  assert.equal(ev.debug().dir, -dir);
  ev.step(0.1);
  assert.equal(ev.debug().dir, -dir, 'turns once per cold spell, not every frame');
});

test('a line that stays cold is abandoned for one starting where it was last warm', () => {
  const ev = new Evolver(seeded(52));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
    { name: 'c', project: project(2), likes: 1 },
  ]);
  ev.start(project(0));
  ev.setTemperature({ relative: 0.9, cold: false, coldFor: 0 });
  for (let i = 0; i < 5; i++) ev.step(0.1);
  const warmEnd = ev.debug().w < 0.5 ? ev.debug().a : ev.debug().b;
  ev.setTemperature({ relative: 0.02, cold: true, coldFor: 16 });
  ev.step(0.1);
  assert.equal(ev.debug().a, warmEnd, 'new line starts at the warm anchor');
  assert.ok(Math.abs(ev.debug().w) < 0.05, 'and from its start');
});

test('chill: a favorite the drift keeps freezing near gets picked less', () => {
  const ev = new Evolver(seeded(60));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.start(project(0));
  ev.setTemperature({ relative: 0.02, cold: true, coldFor: 1 });
  for (let i = 0; i < 300; i++) ev.step(0.2);
  const chilled = ev.view().attractors.filter((x) => x.chill > 0);
  assert.ok(chilled.length > 0, 'some favorite was blamed for the cold');
});
