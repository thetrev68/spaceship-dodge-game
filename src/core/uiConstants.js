/**
 * @fileoverview UI-related constants for the spaceship dodge game.
 * Consolidates magic numbers from UI components.
 */

// Settings UI Constants
export const SETTINGS_UI = {
  Z_INDEX: 100,
  BACKGROUND_OPACITY: 0.9,
  PADDING: '2rem',
  BORDER_RADIUS: '0.5rem',
  MOBILE_WIDTH: '90%',
  DESKTOP_WIDTH: '500px',
  MAX_WIDTH: '90%',
  MAX_HEIGHT: '80%',

  // Close Button
  CLOSE_BUTTON_FONT_SIZE: '1.5rem',
  CLOSE_BUTTON_SIZE: '30px',

  // Title Styles
  TITLE_FONT_SIZE: '1.5rem',
  TITLE_MARGIN_BOTTOM: '1.5rem',

  // Section Styles
  SECTION_MARGIN_BOTTOM: '1.5rem',
  SUBTITLE_FONT_SIZE: '1.2rem',
  SUBTITLE_MARGIN_BOTTOM: '1rem',

  // Label Styles
  LABEL_FONT_SIZE: '0.9rem',
  LABEL_MARGIN_BOTTOM: '0.5rem',

  // Slider Styles
  SLIDER_WIDTH: '100%',
  SLIDER_MARGIN_BOTTOM: '1rem',
  SLIDER_MIN: 0,
  SLIDER_MAX: 1,
  SLIDER_STEP: 0.05,

  // Button Styles
  BUTTON_FONT_SIZE: '1.2rem',
  BUTTON_SIZE: '40px',
  BUTTON_MARGIN_LEFT: '5px',
  BUTTON_BG_OPACITY: 0.5,
  BUTTON_BORDER_RADIUS: '50%'
};

// Audio Control Constants
export const AUDIO_CONTROLS = {
  Z_INDEX: 20,
  POSITION_TOP: '20px',
  POSITION_RIGHT: '20px',
  GAP: '10px',
  BUTTON_FONT_SIZE: '1.2rem',
  BUTTON_SIZE: '40px',
  SLIDER_WIDTH: '120px'
};

// Volume Constants
export const VOLUME_CONSTANTS = {
  DEFAULT_BACKGROUND_MUSIC: 0.2,
  DEFAULT_SOUND_EFFECTS: 0.5,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  VOLUME_STEP: 0.05
};

// Settings Constants
export const SETTINGS_CONSTANTS = {
  LOCAL_STORAGE_KEY: 'spaceshipDodgeSettings',
  DEFAULT_SETTINGS_VERSION: '1.0'
};

// Canvas Constants
export const CANVAS_CONSTANTS = {
  MOBILE_WIDTH: 360,
  MOBILE_HEIGHT: 640,
  MOBILE_THRESHOLD: 600
};

// Animation Constants
export const ANIMATION_CONSTANTS = {
  OPACITY_TRANSITION: '0.3s',
  PULSE_SPEED_DIVISOR: 500
};

// Mobile Detection Constants
export const MOBILE_DETECTION = {
  MAX_TOUCH_POINTS: 0,
  TOUCH_EVENT: 'ontouchstart'
};