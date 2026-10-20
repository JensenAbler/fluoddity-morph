/**
 * Starting like counts for attractors seeded from the save library, keyed by
 * save name (lowercased, dashes and underscores read as spaces). Anything not
 * listed starts with 1 like. Jensen asked for Indigo Flame Society at 3; 0
 * mutes (kept in the list, never visited).
 */
export const SEED_LIKES: Readonly<Record<string, number>> = {
  'indigo flame society': 3,
  // MUTED (♥0) after the first telemetry session: Jensen's freeze notes ("0
  // kelvin", "solid hue", "motion died") clustered where the drift reached
  // these presets, which are crystalline / static by design. Blends toward
  // them read as freezing. Unmute from the Evolve tab with +.
  crystal: 0,
  crystal2: 0,
  pseudocrystal: 0,
  tangle: 0,
  tension: 0,
  weave: 0,
  medley: 0,
  medusa: 0,
};

/**
 * The preset category shipped with this site holding Jensen's own saves
 * (`configs/Jensen/`). It appears in File > Load right under your saves, and
 * seeds the attractor pool when this browser has no saves of its own -- so the
 * evolver works on a fresh device with nothing to import.
 */
export const HOME_CATEGORY = 'Jensen';
