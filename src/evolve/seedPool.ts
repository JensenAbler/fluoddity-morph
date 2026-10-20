/**
 * Starting like counts for attractors seeded from the save library, keyed by
 * save name (lowercased, dashes and underscores read as spaces). Anything not
 * listed starts with 1 like. Jensen asked for Indigo Flame Society at 3; 0
 * mutes (kept in the list, never visited).
 */
export const SEED_LIKES: Readonly<Record<string, number>> = {
  'indigo flame society': 3,
  // MUTED (♥0): presets outside the flames' physics family that the freeze
  // notes clustered around. The crystal-type presets that share the flames'
  // family (Crystal, Crystal2, Pseudocrystal, Tension, Medley, Medusa) are
  // back at 1: the drift now reaches them by blending rules within the family,
  // not through the switched-off in-between physics that froze it before.
  tangle: 0,
  weave: 0,
};

/**
 * The preset category shipped with this site holding Jensen's own saves
 * (`configs/Jensen/`). It appears in File > Load right under your saves, and
 * seeds the attractor pool when this browser has no saves of its own -- so the
 * evolver works on a fresh device with nothing to import.
 */
export const HOME_CATEGORY = 'Jensen';
