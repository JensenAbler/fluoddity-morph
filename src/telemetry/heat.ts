import type { SimulationConfig, WorldSettings } from '../particleSystem/config.ts';

/**
 * HEAT: a thermostat against freezing.
 *
 * A creature dies ("absolute zero") when its particles all agree on one signal
 * and settle into the trails they laid themselves; the trails barely fade, so
 * the lock feeds itself. Hurrying to the next favorite does not thaw it -- the
 * frozen arrangement survives the settings change (Nov 15 run: frozen through
 * Branes4 and Starcrossed).
 *
 * So instead of reacting after death, warm the scene as it starts to cool:
 *   - a little SENSOR JITTER (particles disagree a little about where to look)
 *   - slightly FASTER TRAIL FADE (the scene's memory loosens its grip)
 * Both scale with how close to dying the picture looks, and are zero when the
 * scene is healthy. Physics only: the project, favorites and saves never see it.
 */

/** Picture change (pictureProbe.ts) where warming begins. Lively runs sit above ~0.2. */
export const COOL_START = 0.2;
/** Picture change where warming is full. Freezes measured 0.00-0.09. */
export const COOL_FULL = 0.08;
/** Extra sensor angle jitter at full heat, in half-turns (0.15 = about +-27 degrees). */
export const MAX_ANGLE_JITTER = 0.15;
/** Trail decay is multiplied by up to 1 + this at full heat (0.99 persistence -> 0.96). */
export const MAX_DECAY_BOOST = 3;
/** Seconds to warm up toward the target: quick, so a slide is caught early. */
export const RISE_SECONDS = 1;
/** Seconds to cool back down: slow, so a revived scene is not dropped straight back. */
export const FALL_SECONDS = 6;

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * How close to dying, 0..1. Mostly the picture slowing down; weighted up when
 * the particles are also stuck in place, down when they are still travelling.
 * 0 without a picture reading.
 */
export function dyingScore(change: number | undefined, stuck: number | undefined): number {
  if (change === undefined) return 0;
  const slowing = clamp01((COOL_START - change) / (COOL_START - COOL_FULL));
  const weight = 0.5 + 0.5 * clamp01(stuck ?? 1);
  return slowing * weight;
}

export class Heat {
  /** Current heat, 0..1. */
  level = 0;

  /** Advance by `dt` seconds toward `dying` (or toward 0 when not `active`). */
  step(dt: number, active: boolean, dying: number): void {
    const target = active ? clamp01(dying) : 0;
    const tau = target > this.level ? RISE_SECONDS : FALL_SECONDS;
    this.level += (target - this.level) * (1 - Math.exp(-Math.max(0, dt) / tau));
    if (this.level < 0.002 && target === 0) this.level = 0;
  }
}

export function heatConfig(config: SimulationConfig, heat: number): SimulationConfig {
  if (heat <= 0) return config;
  return { ...config, sensorAngleJitter: config.sensorAngleJitter + heat * MAX_ANGLE_JITTER };
}

export function heatWorld(world: WorldSettings, heat: number): WorldSettings {
  if (heat <= 0) return world;
  const decay = (1 - world.trailPersistence) * (1 + heat * MAX_DECAY_BOOST);
  return { ...world, trailPersistence: Math.max(0, 1 - decay) };
}
