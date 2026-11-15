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
  familyOf,
  lingerEase,
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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
  ev.settings.motion = 'leash';
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

test('path cold: never turns back, abandons or blames; it just hurries to the favorite ahead', () => {
  const ev = new Evolver(seeded(61));
  ev.settings.motion = 'path';
  ev.settings.strideSeconds = 100;
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
    { name: 'c', project: project(-1), likes: 1 },
  ]);
  ev.start(project(0.5));
  const chills = () => ev.view().attractors.filter((x) => x.chill > 0).map((x) => x.name);
  ev.setTemperature({ relative: 0.9, cold: false, coldFor: 0 });
  for (let i = 0; i < 40; i++) ev.step(1); // 40% of the way along the leg
  const dest = ev.debug().b;
  const w0 = ev.debug().w;
  // Cold for far longer than the old turn-back (6 s) and abandon (15 s) waits.
  ev.setTemperature({ relative: 0.02, cold: true, coldFor: 30 });
  for (let i = 0; i < 10; i++) ev.step(1);
  assert.equal(ev.debug().b, dest, 'still heading for the same favorite');
  assert.ok(Math.abs(ev.debug().w - (w0 + 0.3)) < 1e-6, `hurried at 3x: ${ev.debug().w}`);
  for (let i = 0; i < 12; i++) ev.step(1);
  assert.equal(ev.debug().a, dest, 'it arrived there and set off from it');
  assert.notEqual(ev.debug().b, dest, 'toward the next favorite');
  assert.deepEqual(chills(), [], 'and nobody was blamed for the cold');
});

function famProject(rule: number, lateral: number, angle: number, axial: number) {
  return makeProject({
    configs: [
      makeSimulationConfig(
        {
          cohorts: 1, mutationSeed: 0.5, sensorGain: 1, sensorAngle: angle, sensorDistance: 1.5,
          mutationScale: 0, globalForceMult: 0.2, drag: 0.5, strafePower: 0.3, axialForce: axial,
          lateralForce: lateral, hazardRate: 0,
        },
        { rule: Array.from({ length: 80 }, () => rule) },
      ),
    ],
    world: makeWorldSettings(),
  });
}

test('physics families: sign pattern of sideways push and sensors, plus the engine', () => {
  assert.equal(familyOf(famProject(0, -0.7, 0.07, 0.37)), '-+E');
  assert.equal(familyOf(famProject(0, 0.5, -0.18, 0.12)), '+-E');
  assert.equal(familyOf(famProject(0, -0.19, -0.13, 0.02)), '--e');
});

test('with hops off, the drift never passes through a family boundary', () => {
  const ev = new Evolver(seeded(70));
  ev.settings.motion = 'leash';
  ev.setPool([
    { name: 'f1', project: famProject(0, -0.7, 0.07, 0.37), likes: 1 },
    { name: 'f2', project: famProject(1, -0.7, 0.2, 0.37), likes: 1 },
    { name: 'b1', project: famProject(0.5, 0.5, -0.18, 0.12), likes: 3 },
    { name: 'b2', project: famProject(0.2, 0.5, -0.1, 0.12), likes: 3 },
  ]);
  ev.settings.familyHop = 0;
  ev.settings.settingWander = 0;
  ev.start(famProject(0.5, -0.7, 0.1, 0.37));
  for (let i = 0; i < 4000; i++) {
    const c = ev.step(0.25)!.configs[0]!;
    assert.ok(c.lateralForce < -0.6 && c.sensorAngle > 0.05, `left the family: lat ${c.lateralForce} ang ${c.sensorAngle}`);
  }
});

test('a hop crosses families quickly, without lingering in between', () => {
  const ev = new Evolver(seeded(71));
  ev.settings.motion = 'leash';
  ev.setPool([
    { name: 'f1', project: famProject(0, -0.7, 0.07, 0.37), likes: 1 },
    { name: 'b1', project: famProject(1, 0.5, -0.18, 0.12), likes: 1 },
  ]);
  ev.settings.familyHop = 1;
  ev.settings.settingWander = 0;
  ev.settings.focusSeconds = 5;
  ev.start(famProject(0, -0.7, 0.07, 0.37));
  let between = 0;
  let maxRun = 0;
  for (let i = 0; i < 4000; i++) {
    const c = ev.step(0.1)!.configs[0]!;
    // "In between": sideways push near zero on its way through the sign flip.
    if (Math.abs(c.lateralForce) < 0.2) between++;
    else between = 0;
    maxRun = Math.max(maxRun, between);
  }
  assert.ok(maxRun * 0.1 < 3, `lingered ${(maxRun * 0.1).toFixed(1)}s in the switched-off zone`);
});

test('path mode: walks straight to each favorite, arrives, and moves on without a jump', () => {
  const ev = new Evolver(seeded(77));
  ev.settings.motion = 'path';
  ev.settings.ruleWander = 0;
  ev.settings.settingWander = 0;
  ev.settings.strideSeconds = 10;
  ev.settings.linger = 0;
  ev.setPool([
    { name: 'a', project: project(0, 0.4), likes: 1 },
    { name: 'b', project: project(1, 0.6), likes: 1 },
    { name: 'c', project: project(-1, 0.5), likes: 1 },
  ]);
  assert.ok(ev.start(project(0.5, 0.45)));
  const rules = new Map(ev.attractors.map((a) => [a.name, a.project.configs[0]!.rule]));
  const dt = 0.05;
  let prev = ev.current()!.configs[0]!.rule;
  let dest = ev.debug().b;
  let closest = Infinity;
  const arrivals: number[] = [];
  let maxStep = 0;
  for (let f = 0; f < 1200; f++) {
    const rule = ev.step(dt)!.configs[0]!.rule;
    maxStep = Math.max(maxStep, ...rule.map((v, k) => Math.abs(v - prev[k]!)));
    const now = ev.debug().b;
    if (now !== dest) {
      if (f > 0) arrivals.push(closest);
      dest = now;
      closest = Infinity;
    }
    const target = rules.get(dest)!;
    closest = Math.min(closest, Math.max(...rule.map((v, k) => Math.abs(v - target[k]!))));
    prev = rule;
  }
  // 60 s at 10 s a leg: about six favorites reached.
  assert.ok(arrivals.length >= 5, `arrivals ${arrivals.length}`);
  // Each favorite was actually reached (within one frame's travel)...
  for (const d of arrivals) assert.ok(d <= 0.021, `missed a favorite by ${d}`);
  // ...and nothing ever jumped: at most 2 units per 10 s leg, so 0.01 a frame.
  assert.ok(maxStep <= 0.0101, `jump of ${maxStep}`);
});

test('linger: an S-curve that spends its time near the favorites', () => {
  for (const l of [0, 0.4, 1]) {
    assert.equal(lingerEase(0, l), 0);
    assert.equal(lingerEase(1, l), 1);
    assert.ok(Math.abs(lingerEase(0.5, l) - 0.5) < 1e-12);
    let prev = 0;
    for (let u = 0.01; u <= 1; u += 0.01) {
      const e = lingerEase(u, l);
      assert.ok(e >= prev, `not monotonic at linger ${l}`);
      prev = e;
    }
  }
  assert.ok(Math.abs(lingerEase(0.3, 0) - 0.3) < 1e-12, 'linger 0 is constant speed');
  // Default: most of the leg's time within 10% of one favorite or the other.
  let near = 0;
  for (let i = 0; i < 1000; i++) {
    const e = lingerEase((i + 0.5) / 1000, 0.4);
    if (e < 0.1 || e > 0.9) near++;
  }
  assert.ok(near > 600, String(near));
});

test('cohorts are carried: count switches mid-leg, mutation blends, seed asks for steady twists', () => {
  const ev = new Evolver(seeded(91));
  ev.settings.motion = 'path';
  ev.settings.ruleWander = 0;
  ev.settings.settingWander = 0;
  ev.settings.linger = 0;
  ev.settings.strideSeconds = 10;
  const many = makeProject({
    configs: [{ ...project(1).configs[0]!, cohorts: 16, mutationScale: 0.2, mutationSeed: 0.3, initialConditions: 3 }],
    world: makeWorldSettings(),
  });
  ev.setPool([{ name: 'many', project: many, likes: 1 }]);
  assert.ok(ev.start(project(0)));
  let c = ev.step(0.05)!.configs[0]!;
  assert.equal(c.cohorts, 1, 'starts with the start state\'s cohorts');
  assert.ok(c.mutationSeed < 0, 'a negative seed asks the shader for steady twists');
  for (let f = 0; f < 99; f++) c = ev.step(0.05)!.configs[0]!; // 5 s: the midpoint
  assert.ok(c.mutationScale < 0.002, `twists melted away at the switch: ${c.mutationScale}`);
  for (let f = 0; f < 21; f++) c = ev.step(0.05)!.configs[0]!; // 6 s: past halfway
  assert.equal(c.cohorts, 16, 'switched to the favorite\'s cohort count');
  assert.equal(c.initialConditions, 3, 'and its starting layout');
  assert.ok(c.mutationScale > 0 && c.mutationScale < 0.1, `twists coming back: ${c.mutationScale}`);
  for (let f = 0; f < 60; f++) c = ev.step(0.05)!.configs[0]!; // 9 s: melt over
  assert.ok(Math.abs(c.mutationScale - 0.18) < 0.01, `mutation blends: ${c.mutationScale}`);
});

test('starting from a multi-cohort state keeps its own twists, then melts into steady ones', () => {
  const ev = new Evolver(seeded(93));
  ev.settings.motion = 'path';
  ev.settings.ruleWander = 0;
  ev.settings.settingWander = 0;
  ev.settings.linger = 0;
  ev.settings.strideSeconds = 10;
  const startRule = Array.from({ length: 80 }, (_, i) => Math.sin(i * 1.7) * 0.8);
  const start = makeProject({
    configs: [{ ...project(0).configs[0]!, rule: startRule, cohorts: 8, mutationScale: 0.3, mutationSeed: 0.42 }],
    world: makeWorldSettings(),
  });
  ev.setPool([{ name: 'b', project: project(1), likes: 1 }]);
  assert.ok(ev.start(start));
  const hashed = [32, 33, 61, 60, 10, 11];
  let c = ev.step(0.05)!.configs[0]!;
  assert.equal(c.mutationSeed, 0.42, 'the save\'s own seed, so its own twists');
  assert.equal(c.cohorts, 8);
  for (const i of hashed) assert.equal(c.rule[i], startRule[i], `hash float ${i} held`);
  assert.notEqual(c.rule[0], startRule[0], 'the rest of the rule moves');
  for (let f = 0; f < 98; f++) c = ev.step(0.05)!.configs[0]!; // just before the midpoint
  assert.equal(c.mutationSeed, 0.42);
  for (const i of hashed) assert.equal(c.rule[i], startRule[i]);
  assert.ok(c.mutationScale < 0.01, `melted: ${c.mutationScale}`);
  for (let f = 0; f < 3; f++) c = ev.step(0.05)!.configs[0]!; // just past it
  assert.ok(c.mutationSeed < 0, 'steady twists from here');
  for (let f = 0; f < 100; f++) c = ev.step(0.05)!.configs[0]!; // arrived at b
  for (const i of hashed) assert.ok(Math.abs(c.rule[i]! - 1) < 0.05, `released to b: ${c.rule[i]}`);
});

test('path mode hops between physics regimes and reaches out-of-range physics as it is', () => {
  const ev = new Evolver(seeded(97));
  ev.settings.motion = 'path';
  ev.settings.ruleWander = 0;
  ev.settings.settingWander = 0;
  ev.settings.linger = 0;
  ev.settings.strideSeconds = 10;
  const odd = makeProject({
    configs: [{ ...project(1).configs[0]!, sensorGain: 17, drag: -0.6 }],
    world: makeWorldSettings(),
  });
  assert.notEqual(familyOf(odd), familyOf(project(0)), 'negative drag and huge gain are their own regime');
  ev.setPool([{ name: 'odd', project: odd, likes: 1 }]);
  assert.ok(ev.start(project(0, 4)));
  let c = ev.step(0.05)!.configs[0]!;
  for (let f = 0; f < 80; f++) c = ev.step(0.05)!.configs[0]!; // 4 s: before the hop
  assert.ok(Math.abs(c.sensorGain - 4) < 0.01, `physics waits: ${c.sensorGain}`);
  assert.ok(c.rule[0]! > 0.3, 'while the rule is well on its way');
  for (let f = 0; f < 40; f++) c = ev.step(0.05)!.configs[0]!; // 6 s: after it
  assert.ok(Math.abs(c.sensorGain - 17) < 0.01, `hopped over: ${c.sensorGain}`);
  assert.ok(Math.abs(c.drag + 0.6) < 0.01, `negative drag kept: ${c.drag}`);
});

test('cohort colour never jumps, even when a cold spell hurries the leg mid-fade', () => {
  const ev = new Evolver(seeded(101));
  ev.settings.motion = 'path';
  ev.settings.linger = 0;
  // Long enough that the fade, even hurried 3x by cold, stays under the
  // per-frame bound below: this checks for pops, not for pace.
  ev.settings.strideSeconds = 30;
  const many = (r: number, n: number) => makeProject({
    configs: [{ ...project(r).configs[0]!, cohorts: n, mutationScale: 0.3, colorByCohort: true }],
    world: makeWorldSettings(),
  });
  ev.setPool([
    { name: 'six', project: many(1, 6), likes: 1 },
    { name: 'one', project: many(-1, 1), likes: 1 },
  ]);
  assert.ok(ev.start(many(0, 3)));
  let prev = ev.cohortColorMix;
  let worst = 0;
  for (let f = 0; f < 4800; f++) {
    // A cold spell every so often, which hurries the leg along mid-fade.
    const cold = f % 400 > 180 && f % 400 < 260;
    ev.setTemperature({ relative: cold ? 0 : 1, cold, coldFor: cold ? ((f % 400) - 180) * 0.25 : 0 });
    ev.step(0.05);
    worst = Math.max(worst, Math.abs(ev.cohortColorMix - prev));
    prev = ev.cohortColorMix;
  }
  assert.ok(worst < 0.05, `cohort colour jumped by ${worst}`);
});

test('breathe: mutation breathes 0 -> peak -> 0, re-rolls at zero, hops at the top of a big breath', () => {
  const ev = new Evolver(seeded(103));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 10;
  ev.settings.breathPeak = 3;
  ev.settings.bigPeak = 10;
  ev.settings.bigEvery = 2;
  const other = makeProject({
    configs: [{ ...project(1).configs[0]!, cohorts: 8 }],
    world: makeWorldSettings(),
  });
  ev.setPool([{ name: 'other', project: other, likes: 1 }]);
  assert.ok(ev.start(project(0)));
  const dt = 0.05;
  let c = ev.step(dt)!.configs[0]!;
  const seed0 = c.mutationSeed;
  let maxScale = 0;
  let f = 0;
  // One ordinary breath (10 s = 200 frames): until the seed re-rolls.
  while (c.mutationSeed === seed0 && f++ < 220) {
    maxScale = Math.max(maxScale, c.mutationScale);
    assert.equal(c.rule[0], 0, 'an ordinary breath stays on its favorite');
    c = ev.step(dt)!.configs[0]!;
  }
  assert.ok(f > 190 && f < 210, `one breath is about 200 frames: ${f}`);
  assert.ok(Math.abs(maxScale - 3) < 0.05, `ordinary breath peaks near 3: ${maxScale}`);
  assert.ok(c.mutationScale < 0.01, `re-rolled at the zero: ${c.mutationScale}`);
  assert.ok(c.mutationSeed < 0, 'steady twists');
  // Breath 2 is big (15 s): it peaks near 10 and hops underneath.
  let bigMax = 0;
  const cohortsWhileTwisted = new Set<number>();
  for (let i = 0; i < 290; i++) {
    c = ev.step(dt)!.configs[0]!;
    bigMax = Math.max(bigMax, c.mutationScale);
    if (c.mutationScale > 1) cohortsWhileTwisted.add(c.cohorts);
  }
  assert.ok(Math.abs(bigMax - 10) < 0.1, `big breath peaks near 10: ${bigMax}`);
  assert.deepEqual([...cohortsWhileTwisted], [1], 'the cohort count never changes while twists are showing');
  for (let i = 0; i < 20 && c.cohorts !== 8; i++) c = ev.step(dt)!.configs[0]!;
  assert.equal(c.cohorts, 8, 'it lands at the zero');
  assert.ok(c.mutationScale < 0.05, `at the zero: ${c.mutationScale}`);
  assert.ok(Math.abs(c.rule[0]! - 1) < 1e-9, 'arrived at the other favorite');
});

test('breathe orbit: breaths overlap and swing past the favorite; 0 keeps them meeting at zero', () => {
  const run = (orbit: number) => {
    const ev = new Evolver(seeded(211));
    ev.settings.motion = 'breathe';
    ev.settings.breathSeconds = 10;
    ev.settings.breathPeak = 3;
    ev.settings.bigEvery = 0;
    ev.settings.orbit = orbit;
    ev.setPool([{ name: 'other', project: project(1), likes: 1 }]);
    assert.ok(ev.start(project(0)));
    const totals: number[] = [];
    let maxSecond = 0;
    const seeds = new Set<number>();
    for (let i = 0; i < 1200; i++) {
      const c = ev.step(0.05)!.configs[0]!;
      const second = c.mutationScale2 ?? 0;
      maxSecond = Math.max(maxSecond, second);
      totals.push(c.mutationScale + second);
      seeds.add(c.mutationSeed);
      assert.equal(c.rule[0], 0, 'orbiting stays on its favorite');
      if (second > 0) assert.ok((c.mutationSeed2 ?? 0) < 0 && c.mutationSeed2 !== c.mutationSeed, 'the fading voice has its own steady roll');
    }
    return { totals, maxSecond, seeds };
  };
  const still = run(0);
  assert.equal(still.maxSecond, 0, 'orbit 0: one voice only');
  assert.ok(Math.min(...still.totals.slice(200)) < 0.01, 'orbit 0: back to the favorite every breath');

  const orbiting = run(0.5);
  assert.ok(orbiting.maxSecond > 0.5, `orbit 0.5: a second voice fades out: ${orbiting.maxSecond}`);
  assert.ok(orbiting.seeds.size > 4, 'fresh rolls keep coming');
  const floor = Math.min(...orbiting.totals.slice(200));
  assert.ok(floor > 0.5, `orbit 0.5: never back at the favorite once orbiting: ${floor}`);
  // No jumps: the hand-over between voices is continuous.
  const t = orbiting.totals;
  for (let i = 1; i < t.length; i++) assert.ok(Math.abs(t[i]! - t[i - 1]!) < 0.1, `no jump at ${i}`);

  const across = run(1);
  const acrossFloor = Math.min(...across.totals.slice(200));
  assert.ok(acrossFloor > floor, `orbit 1 stays farther out than 0.5: ${acrossFloor} vs ${floor}`);
});

test('breathe: going still on the way up tops the breath out, continuing smoothly downward', () => {
  const ev = new Evolver(seeded(107));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 20;
  ev.settings.breathPeak = 2;
  ev.settings.bigPeak = 6;
  ev.settings.bigEvery = 2;
  ev.setPool([{ name: 'other', project: project(1), likes: 1 }]);
  assert.ok(ev.start(project(0)));
  const dt = 0.05;
  const run = (frames: number, cold: (f: number) => boolean) => {
    const scales: number[] = [];
    for (let f = 0; f < frames; f++) {
      const c = cold(f);
      ev.setTemperature({ relative: c ? 0 : 1, cold: c, coldFor: c ? 2 : 0 });
      scales.push(ev.step(dt)!.configs[0]!.mutationScale);
    }
    return scales;
  };
  // Ordinary breath: still from frame 100 (t = 0.25, 5 s up -- past the minimum climb).
  const a = run(120, (f) => f >= 100);
  const top = Math.max(...a);
  assert.ok(top < 1.1, `topped out well below the peak of 2: ${top}`);
  for (let i = 1; i < a.length; i++) assert.ok(Math.abs(a[i]! - a[i - 1]!) < 0.05, 'no jump');
  assert.ok(a[119]! < a[104]!, 'heading back down');
  // It reaches zero in about the time it took to climb, then the big breath.
  const b = run(160, () => false);
  assert.ok(Math.min(...b) < 0.02, 'back to zero');
  // Big breath: still a third of the way up -- it starts down toward the next favorite.
  const c = run(700, (f) => f > 60 && f < 140);
  for (let i = 1; i < c.length; i++) assert.ok(Math.abs(c[i]! - c[i - 1]!) < 0.08, `no jump in the big breath at ${i}`);
  assert.ok(Math.max(...c) < 5, `big breath topped out early: ${Math.max(...c)}`);
  assert.ok(Math.abs(ev.current()!.configs[0]!.rule[0]! - 1) < 1e-9, 'and still arrived at the next favorite');
});

test('breathe: edges reset all the way down to a new favorite, and are its own at rest', () => {
  const ev = new Evolver(seeded(109));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 10;
  ev.settings.bigEvery = 1;
  const other = makeProject({ configs: project(1).configs, world: makeWorldSettings({ boundaryConditions: 0 }) });
  ev.setPool([{ name: 'other', project: other, likes: 1 }]);
  const start = makeProject({ configs: project(0).configs, world: makeWorldSettings({ boundaryConditions: 1 }) });
  assert.ok(ev.start(start));
  const seen: number[] = [];
  for (let f = 0; f < 520; f++) seen.push(ev.step(0.05)!.world.boundaryConditions);
  assert.equal(seen[10], 1, 'the start\'s own edges on the way up');
  assert.equal(seen[300], 1, 'the start\'s own edges on the way up the big breath');
  assert.equal(seen[420], 2, 'reset on the way down');
  assert.equal(seen[515], 0, 'the new favorite\'s own edges once arrived');
});

test('breathe: cohort colour fades in on its own clock even if the next breath tops out at once', () => {
  const ev = new Evolver(seeded(113));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 10;
  ev.settings.bigEvery = 1;
  const many = makeProject({
    configs: [{ ...project(1).configs[0]!, cohorts: 16, colorByCohort: true }],
    world: makeWorldSettings(),
  });
  ev.setPool([{ name: 'many', project: many, likes: 1 }]);
  assert.ok(ev.start(project(0)));
  let prev = ev.cohortColorMix;
  let worst = 0;
  for (let f = 0; f < 1200; f++) {
    // Still near every zero, so breaths top out the moment they begin.
    const cold = f > 480;
    ev.setTemperature({ relative: cold ? 0 : 1, cold, coldFor: cold ? 2 : 0 });
    ev.step(0.05);
    worst = Math.max(worst, Math.abs(ev.cohortColorMix - prev));
    prev = ev.cohortColorMix;
  }
  assert.ok(worst < 0.05, `cohort colour jumped by ${worst}`);
});

test('breathe: a breath climbs at least a few seconds before it may top out', () => {
  const ev = new Evolver(seeded(127));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 40;
  ev.settings.bigEvery = 4;
  ev.setPool([{ name: 'other', project: project(1), likes: 1 }]);
  assert.ok(ev.start(project(0)));
  // Still the whole time: breaths still climb 4 s each, so four take well over 16 s.
  let frames = 0;
  while (ev.arrivals === 0 && frames < 4000) {
    ev.setTemperature({ relative: 0, cold: true, coldFor: 5 });
    ev.step(0.05);
    frames++;
  }
  assert.ok(frames * 0.05 > 16, `reached the next favorite after only ${frames * 0.05} s`);
});

test('breathe: rehome makes a liked state the new center and restarts the breath count', () => {
  const ev = new Evolver(seeded(223));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 10;
  ev.settings.breathPeak = 3;
  ev.settings.bigPeak = 10;
  ev.settings.bigEvery = 2;
  ev.settings.orbit = 0;
  ev.setPool([{ name: 'other', project: project(2), likes: 1 }]);
  assert.ok(ev.start(project(0)));
  // Most of the way through breath 1: the next breath would be the big one.
  for (let i = 0; i < 150; i++) ev.step(0.05);
  const liked = ev.add('Liked 1', project(1), 1);
  assert.ok(ev.rehome(liked));
  let c = ev.step(0.05)!.configs[0]!;
  assert.ok(Math.abs(c.rule[0]! - 1) < 1e-9, 'the liked state is the center');
  assert.ok(c.mutationScale < 0.05, `breathing starts over from zero: ${c.mutationScale}`);
  // Count reset: breath 1 after the like is ordinary (peaks near 3), not big.
  let max = 0;
  for (let i = 0; i < 190; i++) {
    c = ev.step(0.05)!.configs[0]!;
    max = Math.max(max, c.mutationScale);
    assert.ok(Math.abs(c.rule[0]! - 1) < 1e-9, 'stays on the new center');
  }
  assert.ok(Math.abs(max - 3) < 0.1, `an ordinary breath, not a big one: ${max}`);
  assert.equal(ev.view().focusName.length >= 0, true);
});

test('breathe map: distance from the center is the real mutation strength; a like adds a center on the path', () => {
  const ev = new Evolver(seeded(227));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 10;
  ev.settings.breathPeak = 3;
  ev.settings.orbit = 0;
  ev.setPool([{ name: 'other', project: project(2), likes: 1 }]);
  assert.ok(ev.start(project(0), 'origin'));
  const m = ev.map;
  assert.equal(m.centers.length, 1);
  assert.equal(m.centers[0]!.name, 'origin');
  let maxR = 0;
  for (let i = 0; i < 450; i++) {
    const c = ev.step(0.05)!.configs[0]!;
    const r = Math.hypot(m.at!.x - m.centers[0]!.x, m.at!.y - m.centers[0]!.y);
    assert.ok(Math.abs(r - c.mutationScale) < 1e-9, `orbit 0: radius is the mutation scale (${r} vs ${c.mutationScale})`);
    maxR = Math.max(maxR, r);
  }
  assert.ok(Math.abs(maxR - 3) < 0.05, `reaches the breath peak: ${maxR}`);
  assert.ok(m.trail.length > 100, 'the path is recorded');
  // Two breaths, two different directions.
  const at = { ...m.at! };
  const liked = ev.add('Liked 1', project(1), 1);
  assert.ok(ev.rehome(liked));
  assert.equal(m.centers.length, 2, 'never pruned: the like adds a center');
  assert.ok(Math.abs(m.centers[1]!.x - at.x) < 1e-9 && Math.abs(m.centers[1]!.y - at.y) < 1e-9, 'right where the path was');
  assert.equal(m.centers[1]!.name, 'Liked 1');
  assert.equal(m.breaks.length, 0, 'a like continues the path');
});

test('breathe: a colour collapse below the floor turns the breath back, unless the favorite began below it', () => {
  // Only the FIRST breath: the next sets out already collapsed, so it is not judged on colour.
  const run = (startSpread: number, steps: number) => {
    const ev = new Evolver(seeded(229));
    ev.settings.motion = 'breathe';
    ev.settings.breathSeconds = 20;
    ev.settings.breathPeak = 3;
    ev.settings.orbit = 0;
    ev.settings.colorFloor = 0.08;
    ev.setPool([{ name: 'other', project: project(2), likes: 1 }]);
    assert.ok(ev.start(project(0)));
    let max = 0;
    for (let i = 0; i < steps; i++) {
      // As the Orchestrator does, every frame: halfway up the climb the colours collapse.
      ev.setTemperature({ relative: 1, cold: false, coldFor: 0, colorSpread: i < 60 ? startSpread : 0.03 });
      max = Math.max(max, ev.step(0.05)!.configs[0]!.mutationScale);
    }
    return max;
  };
  const a = run(0.6, 150);
  const b = run(0.05, 210);
  assert.ok(a < 2.5, `collapse turns the breath back before the peak: ${a}`);
  assert.ok(b > 2.9, `a one-colour favorite is judged on stillness alone: ${b}`);
});

test('breathe map: clearMap wipes it; still breathing, the current favorite is the first dot again', () => {
  const ev = new Evolver(seeded(233));
  ev.settings.motion = 'breathe';
  ev.settings.breathSeconds = 10;
  ev.setPool([{ name: 'other', project: project(2), likes: 1 }]);
  assert.ok(ev.start(project(0), 'origin'));
  for (let i = 0; i < 100; i++) ev.step(0.05);
  assert.ok(ev.add('Liked', project(1), 1) && ev.map.trail.length > 10);
  ev.clearMap();
  assert.equal(ev.map.centers.length, 1);
  assert.deepEqual([ev.map.centers[0]!.x, ev.map.centers[0]!.y], [0, 0]);
  assert.equal(ev.map.trail.length, 2);
  ev.stop();
  ev.clearMap();
  assert.equal(ev.map.centers.length, 0, 'stopped: simply empty');
  assert.equal(ev.map.trail.length, 0);
});
