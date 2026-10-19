import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, strToU8 } from 'fflate';

import { jsonFromZip } from './saveFolder.ts';

test('zip import keeps json entries and flattens folders', async () => {
  const zip = zipSync({
    'fluoddity-saves/Creature.json': strToU8('{"a":1}'),
    'fluoddity-saves/readme.txt': strToU8('nope'),
    '__MACOSX/fluoddity-saves/._Creature.json': strToU8('junk'),
  });
  const out = await jsonFromZip(zip);
  assert.deepEqual(out, [{ filename: 'Creature.json', text: '{"a":1}' }]);
});

test('reads the zip the app itself exports', async () => {
  const { buildZipBytes } = await import('./zip.ts');
  const bytes = buildZipBytes([{ filename: 'Mine.json', text: '{"v":8}' }]);
  const out = await jsonFromZip(bytes);
  assert.equal(out[0]?.filename, 'Mine.json');
  assert.equal(out[0]?.text, '{"v":8}');
});
