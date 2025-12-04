import type { GameConfig, LevelConfig, PowerUpKey, ReadonlyConfig } from '@types';

export const GAME_CONFIG: ReadonlyConfig<GameConfig> = {
  TARGET_FPS: 60,
  FRAME_DURATION: 1000 / 60,
  MAX_LIFETIME: 30000, // 30 seconds
  SPAWN_MARGIN: 100,
};

export const BULLET_CONFIG: ReadonlyConfig<{
  SPEED: number;
  RADIUS: number;
  FIRE_RATE: number;
  FIRE_COOLDOWN_MS: number;
}> = {
  SPEED: 10,
  RADIUS: 3,
  FIRE_RATE: 100, // milliseconds
  FIRE_COOLDOWN_MS: 150,
};

export const ASTEROID_CONFIG: ReadonlyConfig<{
  LEVEL_SIZES: number[];
  SCORE_VALUES: number[];
  FRAGMENT_BONUS: number;
  BASE_MIN_SPEED: number;
  BASE_MAX_SPEED: number;
  SPEED_INCREASE_PER_LEVEL: number;
  MAX_SPEED: number;
  MIN_SPAWN_INTERVAL: number;
  SHAPE_POINTS_MIN: number;
  SHAPE_POINTS_MAX: number;
  SHAPE_RANDOMNESS: number;
  ROTATION_SPEED_MIN: number;
  ROTATION_SPEED_MAX: number;
  FRAGMENT_SPEED_MULTIPLIER: number;
  FRAGMENTS_MIN: number;
  FRAGMENTS_MAX: number;
}> = {
  LEVEL_SIZES: [35, 22, 12],
  SCORE_VALUES: [20, 50, 100],
  FRAGMENT_BONUS: 150,
  BASE_MIN_SPEED: 0.8,
  BASE_MAX_SPEED: 2.5,
  SPEED_INCREASE_PER_LEVEL: 0.5,
  MAX_SPEED: 3,
  MIN_SPAWN_INTERVAL: 300,
  SHAPE_POINTS_MIN: 5,
  SHAPE_POINTS_MAX: 11,
  SHAPE_RANDOMNESS: 0.4,
  ROTATION_SPEED_MIN: -0.05,
  ROTATION_SPEED_MAX: 0.01,
  FRAGMENT_SPEED_MULTIPLIER: 0.3,
  FRAGMENTS_MIN: 2,
  FRAGMENTS_MAX: 3,
};

/**
 * @internal
 */
type PowerUpConfigShape = Record<PowerUpKey, { DURATION: number }> & { SPAWN_INTERVAL: number };

export const POWERUP_CONFIG: ReadonlyConfig<PowerUpConfigShape> = {
  doubleBlaster: {
    DURATION: 10000, // 10 seconds
  },
  shield: {
    DURATION: 5000, // 5 seconds
  },
  SPAWN_INTERVAL: 10000, // 10 seconds
};

export const MOBILE_CONFIG: ReadonlyConfig<{
  MAX_SHAPE_POINTS: number;
  SPAWN_INTERVAL_MULTIPLIER: number;
  TOUCH_ACTION: string;
}> = {
  MAX_SHAPE_POINTS: 5,
  SPAWN_INTERVAL_MULTIPLIER: 1.6, // 2400ms vs 1500ms
  TOUCH_ACTION: 'manipulation',
};

export const LEVEL_CONFIG: ReadonlyConfig<LevelConfig> = {
  BASE_SPAWN_INTERVAL_DESKTOP: 1500,
  BASE_SPAWN_INTERVAL_MOBILE: 2400,
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: 70,
  DIFFICULTY_SCALE_THRESHOLD: 5,
  LOGARITHMIC_SCALE_START: 5,
};
