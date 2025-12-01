// constants.js
// Centralized constants for the spaceship dodge game
// Updated: 2025-11-30

// 🎮 Game Configuration
export const GAME_CONFIG = {
  TARGET_FPS: 60,
  FRAME_DURATION: 1000 / 60,
  MAX_LIFETIME: 30000, // 30 seconds
  SPAWN_MARGIN: 100,
};

// 🚀 Player Configuration (removed - unused)

// 🔫 Bullet Configuration
export const BULLET_CONFIG = {
  SPEED: 10,
  RADIUS: 3,
  FIRE_RATE: 100, // milliseconds
  FIRE_COOLDOWN_MS: 150,
};

// 🪨 Asteroid Configuration
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

// 💥 Power-up Configuration
// Keys mirror powerup type strings for direct lookup in entities/powerup.js
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

// 📱 Mobile Configuration
export const MOBILE_CONFIG = {
  MAX_SHAPE_POINTS: 5,
  SPAWN_INTERVAL_MULTIPLIER: 1.6, // 2400ms vs 1500ms
  TOUCH_ACTION: 'manipulation',
};

// 🏆 Scoring Configuration (removed - unused)

// 🎯 Level Configuration
export const LEVEL_CONFIG = {
  BASE_SPAWN_INTERVAL_DESKTOP: 1500,
  BASE_SPAWN_INTERVAL_MOBILE: 2400,
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: 70,
  DIFFICULTY_SCALE_THRESHOLD: 5,
  LOGARITHMIC_SCALE_START: 5,
};

// 🔧 Development Configuration (removed - unused)
