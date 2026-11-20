import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fullSpeedFraction, rateFor } from './motionMeter.ts';

test('a still room plays nothing', () => {
  assert.equal(rateFor(0, 0.5), 0);
  assert.equal(rateFor(0.003, 1), 0);
});

test('enough motion plays at full speed, never faster', () => {
  assert.equal(rateFor(fullSpeedFraction(0.5), 0.5), 1);
  assert.equal(rateFor(1, 0.5), 1);
});

test('higher sensitivity needs less motion', () => {
  assert.ok(fullSpeedFraction(1) < fullSpeedFraction(0.5));
  assert.ok(fullSpeedFraction(0.5) < fullSpeedFraction(0));
  assert.ok(rateFor(0.02, 1) > rateFor(0.02, 0));
});

test('rate climbs with motion', () => {
  assert.ok(rateFor(0.02, 0.5) < rateFor(0.04, 0.5));
});
