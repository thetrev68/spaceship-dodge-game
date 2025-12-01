/**
 * @fileoverview Centralized constants for the spaceship dodge game.
 * Updated: 2025-11-30
 */

/**
 * Game configuration constants.
 * @constant {Object} GAME_CONFIG
 * @property {number} TARGET_FPS - Target frames per second (60).
 * @property {number} FRAME_DURATION - Duration of each frame in milliseconds (1000/60).
 * @property {number} MAX_LIFETIME - Maximum game lifetime in milliseconds (30000).
 * @property {number} SPAWN_MARGIN - Margin for spawning entities (100).
 */
export const GAME_CONFIG = {
  TARGET_FPS: 60,
  FRAME_DURATION: 1000 / 60,
  MAX_LIFETIME: 30000, // 30 seconds
  SPAWN_MARGIN: 100,
};

// 🚀 Player Configuration (removed - unused)

/**
 * Bullet configuration constants.
 * @constant {Object} BULLET_CONFIG
 * @property {number} SPEED - Bullet movement speed (10).
 * @property {number} RADIUS - Bullet radius (3).
 * @property {number} FIRE_RATE - Fire rate in milliseconds (100).
 * @property {number} FIRE_COOLDOWN_MS - Cooldown between shots in milliseconds (150).
 */
export const BULLET_CONFIG = {
  SPEED: 10,
  RADIUS: 3,
  FIRE_RATE: 100, // milliseconds
  FIRE_COOLDOWN_MS: 150,
};

/**
 * Asteroid configuration constants.
 * @constant {Object} ASTEROID_CONFIG
 * @property {number[]} LEVEL_SIZES - Sizes for different asteroid levels [35, 22, 12].
 * @property {number[]} SCORE_VALUES - Score values for different asteroid levels [20, 50, 100].
 * @property {number} FRAGMENT_BONUS - Bonus score for fragmenting asteroids (150).
 * @property {number} BASE_MIN_SPEED - Base minimum speed for asteroids (0.8).
 * @property {number} BASE_MAX_SPEED - Base maximum speed for asteroids (2.5).
 * @property {number} SPEED_INCREASE_PER_LEVEL - Speed increase per level (0.5).
 * @property {number} MAX_SPEED - Maximum speed for asteroids (3).
 * @property {number} MIN_SPAWN_INTERVAL - Minimum spawn interval in milliseconds (300).
 * @property {number} SHAPE_POINTS_MIN - Minimum number of shape points (5).
 * @property {number} SHAPE_POINTS_MAX - Maximum number of shape points (11).
 * @property {number} SHAPE_RANDOMNESS - Randomness factor for asteroid shapes (0.4).
 * @property {number} ROTATION_SPEED_MIN - Minimum rotation speed (-0.05).
 * @property {number} ROTATION_SPEED_MAX - Maximum rotation speed (0.01).
 * @property {number} FRAGMENT_SPEED_MULTIPLIER - Speed multiplier for fragments (0.3).
 * @property {number} FRAGMENTS_MIN - Minimum number of fragments (2).
 * @property {number} FRAGMENTS_MAX - Maximum number of fragments (3).
 */
export const ASTEROID_CONFIG = {
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
 * Power-up configuration constants.
 * @constant {Object} POWERUP_CONFIG
 * @property {Object} doubleBlaster - Double blaster power-up settings.
 * @property {number} doubleBlaster.DURATION - Duration in milliseconds (10000).
 * @property {Object} shield - Shield power-up settings.
 * @property {number} shield.DURATION - Duration in milliseconds (5000).
 * @property {number} SPAWN_INTERVAL - Spawn interval in milliseconds (10000).
 */
export const POWERUP_CONFIG = {
  doubleBlaster: {
    DURATION: 10000, // 10 seconds
  },
  shield: {
    DURATION: 5000, // 5 seconds
  },
  SPAWN_INTERVAL: 10000, // 10 seconds
};

// 🎵 Audio Configuration (removed - unused)

// 🎨 Visual Configuration (removed - unused)

/**
 * Mobile-specific configuration constants.
 * @constant {Object} MOBILE_CONFIG
 * @property {number} MAX_SHAPE_POINTS - Maximum shape points for mobile (5).
 * @property {number} SPAWN_INTERVAL_MULTIPLIER - Multiplier for spawn intervals on mobile (1.6).
 * @property {string} TOUCH_ACTION - Touch action setting ('manipulation').
 */
export const MOBILE_CONFIG = {
  MAX_SHAPE_POINTS: 5,
  SPAWN_INTERVAL_MULTIPLIER: 1.6, // 2400ms vs 1500ms
  TOUCH_ACTION: 'manipulation',
};

// 🏆 Scoring Configuration (removed - unused)

/**
 * Level configuration constants.
 * @constant {Object} LEVEL_CONFIG
 * @property {number} BASE_SPAWN_INTERVAL_DESKTOP - Base spawn interval for desktop in milliseconds (1500).
 * @property {number} BASE_SPAWN_INTERVAL_MOBILE - Base spawn interval for mobile in milliseconds (2400).
 * @property {number} SPAWN_INTERVAL_DECREASE_PER_LEVEL - Decrease in spawn interval per level (70).
 * @property {number} DIFFICULTY_SCALE_THRESHOLD - Threshold for difficulty scaling (5).
 * @property {number} LOGARITHMIC_SCALE_START - Start level for logarithmic scaling (5).
 */
export const LEVEL_CONFIG = {
  BASE_SPAWN_INTERVAL_DESKTOP: 1500,
  BASE_SPAWN_INTERVAL_MOBILE: 2400,
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: 70,
  DIFFICULTY_SCALE_THRESHOLD: 5,
  LOGARITHMIC_SCALE_START: 5,
};

// 🔧 Development Configuration (removed - unused)
