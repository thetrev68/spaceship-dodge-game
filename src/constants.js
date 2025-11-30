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

// 🚀 Player Configuration
export const PLAYER_CONFIG = {
  WIDTH: 30,
  HEIGHT: 45,
  SPEED: 7,
  START_X: 380,
  START_Y: 500,
  SHIELD_RADIUS_MULTIPLIER: 0.7,
  THRUSTER_PULSE_SPEED: 500, // milliseconds
};

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
export const POWERUP_CONFIG = {
  DOUBLE_BLASTER: {
    DURATION: 10000, // 10 seconds
  },
  SHIELD: {
    DURATION: 5000, // 5 seconds
  },
  SPAWN_INTERVAL: 10000, // 10 seconds
};

// 🎵 Audio Configuration
export const AUDIO_CONFIG = {
  BASE_VOLUME: 0.4,
  BGM_LOOP: true,
  SILENT_UNLOCK_VOLUME: 0,
};

// 🎨 Visual Configuration
export const VISUAL_CONFIG = {
  COLORS: {
    PLAYER: '#00ffff',
    ASTEROID: '#ff4500',
    BULLET: '#ffffff',
    SHIELD: '#00ffff',
    TEXT_SHADOW: 'rgba(0, 0, 0, 0.5)',
    GLOW_SHADOW: 'rgba(0, 255, 255, 0.5)',
    BUTTON_SHADOW: 'rgba(0, 123, 255, 0.4)',
    OVERLAY_BACKGROUND: 'rgba(0, 0, 0, 0.7)',
  },
  STROKE_WIDTH: {
    PLAYER: 2,
    ASTEROID: 2,
  },
  SHIELD: {
    STROKE_WIDTH: 4,
    BLUR: 20,
  },
  TRANSITION: {
    DURATION: 300, // milliseconds
    EASING: 'ease-in-out',
  },
  FONTS: {
    SIZE: {
      H1: '3rem', // 48px
      P: '1.5rem', // 24px
      BUTTON: '1.25rem', // 20px
      SCORE: '1.5rem', // 24px
    },
    FAMILY: 'Inter, sans-serif',
  },
};

// 📱 Mobile Configuration
export const MOBILE_CONFIG = {
  MAX_SHAPE_POINTS: 5,
  SPAWN_INTERVAL_MULTIPLIER: 1.6, // 2400ms vs 1500ms
  TOUCH_ACTION: 'manipulation',
};

// 🏆 Scoring Configuration
export const SCORING_CONFIG = {
  POPUP_DURATION: 2000, // milliseconds
  POPUP_OFFSET_Y: -10,
  FRAGMENT_COMPLETION_BONUS: 150,
};

// 🎯 Level Configuration
export const LEVEL_CONFIG = {
  BASE_SPAWN_INTERVAL_DESKTOP: 1500,
  BASE_SPAWN_INTERVAL_MOBILE: 2400,
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: 70,
  DIFFICULTY_SCALE_THRESHOLD: 5,
  LOGARITHMIC_SCALE_START: 5,
};

// 🔧 Development Configuration
export const DEV_CONFIG = {
  DEBUG_MODE: false, // Set to true for debug output
  CONSOLE_PREFIX: '[Spaceship Dodge]',
  PERFORMANCE_MONITORING: false,
};