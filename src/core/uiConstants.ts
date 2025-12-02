import type { ReadonlyConfig } from '@types';

export const SETTINGS_UI: ReadonlyConfig<{
  Z_INDEX: number;
  BACKGROUND_OPACITY: number;
  PADDING: string;
  BORDER_RADIUS: string;
  MOBILE_WIDTH: string;
  DESKTOP_WIDTH: string;
  MAX_WIDTH: string;
  MAX_HEIGHT: string;
  CLOSE_BUTTON_FONT_SIZE: string;
  CLOSE_BUTTON_SIZE: string;
  TITLE_FONT_SIZE: string;
  TITLE_MARGIN_BOTTOM: string;
  SECTION_MARGIN_BOTTOM: string;
  SUBTITLE_FONT_SIZE: string;
  SUBTITLE_MARGIN_BOTTOM: string;
  LABEL_FONT_SIZE: string;
  LABEL_MARGIN_BOTTOM: string;
  SLIDER_WIDTH: string;
  SLIDER_MARGIN_BOTTOM: string;
  SLIDER_MIN: number;
  SLIDER_MAX: number;
  SLIDER_STEP: number;
  BUTTON_FONT_SIZE: string;
  BUTTON_SIZE: string;
  BUTTON_MARGIN_LEFT: string;
  BUTTON_BG_OPACITY: number;
  BUTTON_BORDER_RADIUS: string;
}> = {
  Z_INDEX: 100,
  BACKGROUND_OPACITY: 0.9,
  PADDING: '2rem',
  BORDER_RADIUS: '0.5rem',
  MOBILE_WIDTH: '90%',
  DESKTOP_WIDTH: '500px',
  MAX_WIDTH: '90%',
  MAX_HEIGHT: '80%',
  CLOSE_BUTTON_FONT_SIZE: '1.5rem',
  CLOSE_BUTTON_SIZE: '30px',
  TITLE_FONT_SIZE: '1.5rem',
  TITLE_MARGIN_BOTTOM: '1.5rem',
  SECTION_MARGIN_BOTTOM: '1.5rem',
  SUBTITLE_FONT_SIZE: '1.2rem',
  SUBTITLE_MARGIN_BOTTOM: '1rem',
  LABEL_FONT_SIZE: '0.9rem',
  LABEL_MARGIN_BOTTOM: '0.5rem',
  SLIDER_WIDTH: '100%',
  SLIDER_MARGIN_BOTTOM: '1rem',
  SLIDER_MIN: 0,
  SLIDER_MAX: 1,
  SLIDER_STEP: 0.05,
  BUTTON_FONT_SIZE: '1.2rem',
  BUTTON_SIZE: '40px',
  BUTTON_MARGIN_LEFT: '5px',
  BUTTON_BG_OPACITY: 0.5,
  BUTTON_BORDER_RADIUS: '50%',
};

export const AUDIO_CONTROLS: ReadonlyConfig<{
  Z_INDEX: number;
  POSITION_TOP: string;
  POSITION_RIGHT: string;
  GAP: string;
  BUTTON_FONT_SIZE: string;
  BUTTON_SIZE: string;
  SLIDER_WIDTH: string;
  BUTTON_MARGIN_LEFT: string;
}> = {
  Z_INDEX: 20,
  POSITION_TOP: '20px',
  POSITION_RIGHT: '20px',
  GAP: '10px',
  BUTTON_FONT_SIZE: '1.2rem',
  BUTTON_SIZE: '40px',
  SLIDER_WIDTH: '120px',
  BUTTON_MARGIN_LEFT: '5px',
};

export const VOLUME_CONSTANTS: ReadonlyConfig<{
  DEFAULT_BACKGROUND_MUSIC: number;
  DEFAULT_SOUND_EFFECTS: number;
  MIN_VOLUME: number;
  MAX_VOLUME: number;
  VOLUME_STEP: number;
}> = {
  DEFAULT_BACKGROUND_MUSIC: 0.2,
  DEFAULT_SOUND_EFFECTS: 0.5,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  VOLUME_STEP: 0.05,
};

export const SETTINGS_CONSTANTS: ReadonlyConfig<{
  LOCAL_STORAGE_KEY: string;
  DEFAULT_SETTINGS_VERSION: string;
}> = {
  LOCAL_STORAGE_KEY: 'spaceshipDodgeSettings',
  DEFAULT_SETTINGS_VERSION: '1.0',
};

export const CANVAS_CONSTANTS: ReadonlyConfig<{
  MOBILE_WIDTH: number;
  MOBILE_HEIGHT: number;
  MOBILE_THRESHOLD: number;
}> = {
  MOBILE_WIDTH: 360,
  MOBILE_HEIGHT: 640,
  MOBILE_THRESHOLD: 600,
};

export const ANIMATION_CONSTANTS: ReadonlyConfig<{
  OPACITY_TRANSITION: string;
  PULSE_SPEED_DIVISOR: number;
}> = {
  OPACITY_TRANSITION: '0.3s',
  PULSE_SPEED_DIVISOR: 500,
};

export const MOBILE_DETECTION: ReadonlyConfig<{
  MAX_TOUCH_POINTS: number;
  TOUCH_EVENT: string;
}> = {
  MAX_TOUCH_POINTS: 0,
  TOUCH_EVENT: 'ontouchstart',
};
