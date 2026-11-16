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

// EARLIER AND STRONGER (Nov 16): in the Nov 15 Leash run the scene went dull
// several times before heat caught it, and 20 s at full heat (0.15 jitter,
// 0.99 -> 0.96 trails) did not always thaw it. So warming now starts while
// the picture is merely slowing, and full heat pushes twice as hard.

/** Picture change (pictureProbe.ts) where warming begins. */
export const COOL_START = 0.3;
/** Picture change where warming is full. Freezes measured 0.00-0.09. */
export const COOL_FULL = 0.12;
/** Extra sensor angle jitter at full heat, in half-turns (0.3 = about +-54 degrees). */
export const MAX_ANGLE_JITTER = 0.3;
/** Trail decay is multiplied by up to 1 + this at full heat (0.99 persistence -> 0.93). */
export const MAX_DECAY_BOOST = 6;
// PULSES, NOT A THERMOSTAT (Nov 16): held continuously, heat was on most of
// a 17-minute run (above 0.1 for 73% of it, mean 0.34). Heat now comes as
// single pulses -- a quick ramp up then a cool-down -- at most one per
// PULSE_SECONDS, with nothing in between.

/** Seconds a pulse takes to ramp up. */
export const RISE_SECONDS = 0.5;
/** Seconds per pulse, ramp up and cool-down together; also the minimum gap between pulse starts. */
export const PULSE_SECONDS = 5;
/** Dying score at which a pulse fires. Its height is the score itself. */
export const PULSE_TRIGGER = 0.3;

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Fraction of particles stuck where warming begins / is full, on its own. */
export const STUCK_START = 0.4;
export const STUCK_FULL = 0.8;

/**
 * How close to dying, 0..1: the larger of two readings.
 *
 * PICTURE SLOWING, weighted up when particles are also stuck.
 *
 * STUCK PARTICLES ON THEIR OWN. A frozen population can flip its signal all
 * at once, which flickers the screen colour; the flicker moves which cells
 * look lit, so the picture reads "changing" while nothing travels (Nov 15
 * run 3: 70-100% stuck with picture change 0.12-0.37). Colour cannot fake
 * particles moving, so stuck counts by itself.
 */
export function dyingScore(change: number | undefined, stuck: number | undefined): number {
  const stuckAlone = stuck === undefined ? 0 : clamp01((stuck - STUCK_START) / (STUCK_FULL - STUCK_START));
  if (change === undefined) return stuckAlone;
  const slowing = clamp01((COOL_START - change) / (COOL_START - COOL_FULL));
  const weight = 0.5 + 0.5 * clamp01(stuck ?? 1);
  return Math.max(slowing * weight, stuckAlone);
}

/** Pulse shape over 0..PULSE_SECONDS: linear ramp up, then a smooth cosine cool-down to 0. */
export function pulseShape(t: number): number {
  if (t <= 0 || t >= PULSE_SECONDS) return 0;
  if (t < RISE_SECONDS) return t / RISE_SECONDS;
  const u = (t - RISE_SECONDS) / (PULSE_SECONDS - RISE_SECONDS);
  return 0.5 * (1 + Math.cos(Math.PI * u));
}

export class Heat {
  /** Current heat, 0..1. */
  level = 0;
  /** Seconds since the current pulse started (Infinity when none has). */
  private age = Infinity;
  /** Height of the current pulse. */
  private height = 0;

  /** Advance by `dt` seconds. Fires a pulse when `dying` crosses the trigger and the last one is done. */
  step(dt: number, active: boolean, dying: number): void {
    this.age += Math.max(0, dt);
    if (!active) {
      this.age = Infinity;
      this.level = 0;
      return;
    }
    const d = clamp01(dying);
    if (this.age >= PULSE_SECONDS && d >= PULSE_TRIGGER) {
      this.age = 0;
      this.height = d;
    } else if (this.age < RISE_SECONDS) {
      // Still ramping: a worsening scene may raise this pulse, never lower it.
      this.height = Math.max(this.height, d);
    }
    this.level = this.height * pulseShape(this.age);
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
