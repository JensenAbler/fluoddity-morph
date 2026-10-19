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
    for (const v of p.configs[0]!.rule) assert.ok(v > -0.6 && v < 1.6, `rule drifted to ${v}`);
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

test('a visit really arrives: the live rule becomes the favorite, then dwells', () => {
  const ev = new Evolver(seeded(21));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.settings.mode = 'static';
  ev.settings.dwellSeconds = 5;
  ev.start(project(0.5));
  assert.equal(ev.phase, 'visit');
  let p = ev.current()!;
  for (let i = 0; i < 2000 && ev.phase === 'visit'; i++) p = ev.step(0.1)!;
  assert.equal(ev.phase, 'dwell');
  const view = ev.view();
  assert.ok(view.nearestDistance < 1e-9, String(view.nearestDistance));
  assert.equal(view.nearestName, view.focusName);
  const target = view.focusName === 'a' ? 0 : 1;
  assert.ok(p.configs[0]!.rule.every((v) => Math.abs(v - target) < 1e-9));
  for (let i = 0; i < 60; i++) ev.step(0.1);
  assert.equal(ev.phase, 'explore');
});

test('with explore at 0 it goes straight to a different favorite', () => {
  const ev = new Evolver(seeded(4));
  ev.setPool([
    { name: 'a', project: project(0), likes: 1 },
    { name: 'b', project: project(1), likes: 1 },
  ]);
  ev.settings.exploreSeconds = 0;
  ev.settings.dwellSeconds = 1;
  ev.start(null);
  const first = ev.view().focusName;
  for (let i = 0; i < 4000 && ev.view().focusName === first; i++) ev.step(0.1);
  assert.notEqual(ev.view().focusName, first);
  assert.equal(ev.phase, 'visit');
});
