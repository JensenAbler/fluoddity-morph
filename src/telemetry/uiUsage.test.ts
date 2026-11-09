import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { Command } from '../orchestrator/commands.ts';
import type { Setting } from '../ui/settingsSpec.ts';
import { UiUsage, UsageCoalescer, burstKey, clip, describeCommand, type UsageRecord } from './uiUsage.ts';

const setting = { field: 'drag', label: 'Drag' } as unknown as Setting;

test('describeCommand names a setting by field and rounds the value', () => {
  const d = describeCommand({ kind: 'editSetting', setting, value: 0.123456789 });
  assert.deepEqual(d, { cmd: 'editSetting', setting: 'drag', value: 0.1235 });
});

test('describeCommand drops plumbing commands and whole saved documents', () => {
  assert.equal(describeCommand({ kind: 'snapshotConfigs', surface: 'load' }), null);
  assert.equal(describeCommand({ kind: 'clearSaveError' }), null);
  const shared = { kind: 'loadSharedConfig', saved: { big: 'x'.repeat(5000) }, name: 'Mega' } as unknown as Command;
  assert.deepEqual(describeCommand(shared), { cmd: 'loadSharedConfig', name: 'Mega' });
});

test('describeCommand keeps a flat settings object', () => {
  const cmd = { kind: 'evolveSettings', settings: { coherence: 0.5, mode: 'fluid' } } as unknown as Command;
  assert.deepEqual(describeCommand(cmd), { cmd: 'evolveSettings', settings: { coherence: 0.5, mode: 'fluid' } });
});

test('burstKey groups by kind and target', () => {
  assert.equal(burstKey({ cmd: 'editSetting', setting: 'drag', value: 1 }), 'editSetting|drag');
  assert.equal(burstKey({ cmd: 'morphSetTiming', key: 3, hold: 1 }), 'morphSetTiming|3');
  assert.equal(burstKey({ cmd: 'evolveSettings', settings: { b: 1, a: 2 } }), 'evolveSettings|a,b');
  assert.equal(burstKey({ cmd: 'undo' }), 'undo|');
});

test('a drag collapses to one record with count, duration and starting value', () => {
  const out: UsageRecord[] = [];
  const c = new UsageCoalescer((r) => out.push(r), 1000);
  c.add({ cmd: 'editSetting', setting: 'drag', value: 0.1 }, 'k', 0);
  c.add({ cmd: 'editSetting', setting: 'drag', value: 0.2 }, 'k', 100);
  c.add({ cmd: 'editSetting', setting: 'drag', value: 0.3 }, 'k', 900);
  c.flush(1500); // gap not yet passed
  assert.equal(out.length, 0);
  c.flush(2000);
  assert.deepEqual(out, [{ cmd: 'editSetting', setting: 'drag', value: 0.3, t: 0, n: 3, ms: 900, from: { value: 0.1 } }]);
});

test('a different target or a long gap starts a new record', () => {
  const out: UsageRecord[] = [];
  const c = new UsageCoalescer((r) => out.push(r), 1000);
  c.add({ cmd: 'undo' }, 'undo', 0);
  c.add({ cmd: 'redo' }, 'redo', 10);
  c.add({ cmd: 'redo' }, 'redo', 5000);
  c.flush();
  assert.deepEqual(out, [
    { cmd: 'undo', t: 0 },
    { cmd: 'redo', t: 10 },
    { cmd: 'redo', t: 5000 },
  ]);
});

test('commands with no recent real input are tagged auto', () => {
  let now = 10_000;
  const out: UsageRecord[] = [];
  const usage = new UiUsage((r) => out.push(r), () => now);
  usage.command({ kind: 'evolveStart' });
  usage.flushAll();
  usage.noteUserInput();
  now += 50;
  usage.command({ kind: 'evolveStop' });
  usage.flushAll();
  assert.equal(out[0]?.['auto'], true);
  assert.equal(out[0]?.['via'], 'cmd');
  assert.equal(out[1]?.['auto'], undefined);
});

test('clip collapses whitespace and bounds length', () => {
  assert.equal(clip('  a \n  b  '), 'a b');
  assert.equal(clip('x'.repeat(100)).length, 61);
});
