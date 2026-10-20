/**
 * Where the attractor pool lives between visits: localStorage, as v9 documents
 * (the same bytes a save file holds) plus a like count. Stored BAKED, so a
 * reload does not need the GPU before evolving can resume.
 *
 * Every access is guarded: storage can be absent or full (private browsing),
 * and the pool is a convenience on top of the app, never a reason for it to
 * fail.
 */

import { fromDocument, toDocument } from '../config/persistence.ts';
import { type Project, makeProject } from '../project/project.ts';

// v2: the pool now seeds from every saved state (yours, the bundled Jensen
// category and the presets), and evolving is a continuous drift. Bumping the
// key re-seeds once, so a pool stored by the old rules (sometimes a single
// attractor) does not linger.
const KEY = 'fluoddity-morph.attractors.v2';

export interface StoredAttractor {
  readonly name: string;
  readonly likes: number;
  readonly project: Project;
}

export function loadPool(storage: Storage | null = safeStorage()): StoredAttractor[] | null {
  if (storage === null) return null;
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as { name: string; likes: number; doc: unknown }[];
    if (!Array.isArray(parsed)) return null;
    const out: StoredAttractor[] = [];
    for (const entry of parsed) {
      try {
        const saved = fromDocument(entry.doc, `attractor ${entry.name}`);
        out.push({
          name: String(entry.name),
          likes: Number.isFinite(entry.likes) ? entry.likes : 1,
          project: makeProject({ configs: saved.configs, world: saved.world, name: entry.name }),
        });
      } catch {
        // One bad entry should not cost the rest.
      }
    }
    return out;
  } catch {
    return null;
  }
}

export function savePool(
  pool: readonly StoredAttractor[],
  storage: Storage | null = safeStorage(),
): boolean {
  if (storage === null) return false;
  try {
    storage.setItem(
      KEY,
      JSON.stringify(
        pool.map((a) => ({
          name: a.name,
          likes: a.likes,
          doc: toDocument(a.project.configs, a.project.world),
        })),
      ),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearPool(storage: Storage | null = safeStorage()): void {
  try {
    storage?.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
