/**
 * @fileoverview Game settings management system.
 * Handles user preferences, audio settings, and platform-specific configurations.
 */

import { debug, warn } from '@core/logger.js';
import * as soundManager from '@systems/soundManager.js';
import { isMobile } from '@utils/platform.js';
import {
  VOLUME_CONSTANTS,
  SETTINGS_CONSTANTS
} from '@core/uiConstants.js';

/** @typedef {{ backgroundMusicVolume: number; soundEffectsVolume: number; isMuted: boolean; showTutorial: boolean; vibrationEnabled: boolean; platformSpecificText: boolean; version: string }} GameSettings */

/**
 * Game settings storage key.
 * @constant {string}
 */
const SETTINGS_KEY = SETTINGS_CONSTANTS.LOCAL_STORAGE_KEY;

/**
 * Default settings configuration.
 * @constant {GameSettings}
 */
const DEFAULT_SETTINGS = /** @type {GameSettings} */ ({
  // Audio settings
  backgroundMusicVolume: VOLUME_CONSTANTS.DEFAULT_BACKGROUND_MUSIC,
  soundEffectsVolume: VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS,
  isMuted: false,

  // Gameplay settings
  showTutorial: true,
  vibrationEnabled: true,

  // UI settings
  platformSpecificText: true,

  // Version for future migrations
  version: SETTINGS_CONSTANTS.DEFAULT_SETTINGS_VERSION
});

/**
 * Current game settings.
 * @type {GameSettings}
 */
let currentSettings = { ...DEFAULT_SETTINGS };

/**
 * Load settings from localStorage.
 * @returns {GameSettings} Loaded settings or defaults.
 */
export function loadSettings() {
  try {
    const savedSettings = typeof localStorage !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null;
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Merge with defaults to handle new settings
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
      debug('settings', 'Settings loaded from storage', currentSettings);
    } else {
      debug('settings', 'No saved settings found, using defaults');
      currentSettings = { ...DEFAULT_SETTINGS };
    }
  } catch (error) {
    warn('settings', 'Failed to load settings:', error);
    currentSettings = { ...DEFAULT_SETTINGS };
  }

  return currentSettings;
}

/**
 * Save settings to localStorage.
 */
export function saveSettings() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
      debug('settings', 'Settings saved to storage', currentSettings);
    }
  } catch (error) {
    warn('settings', 'Failed to save settings:', error);
  }
}

/**
 * Get current settings.
 * @returns {GameSettings} Current settings.
 */
export function getSettings() {
  return { ...currentSettings };
}

/**
 * Set specific setting value.
 * @template {keyof GameSettings} K
 * @param {K} key - Setting key.
 * @param {GameSettings[K]} value - Setting value.
 */
export function setSetting(key, value) {
  if (Object.prototype.hasOwnProperty.call(currentSettings, key)) {
    currentSettings[key] = value;
    debug('settings', `Setting updated: ${key} = ${value}`);
    saveSettings();
  } else {
    warn('settings', `Unknown setting key: ${key}`);
  }
}

/**
 * Apply audio settings to sound manager.
 */
export function applyAudioSettings() {
  debug('settings', 'Applying audio settings', {
    bgVolume: currentSettings.backgroundMusicVolume,
    sfxVolume: currentSettings.soundEffectsVolume,
    muted: currentSettings.isMuted
  });

  // Apply mute state
  if (currentSettings.isMuted) {
    soundManager.muteAll();
  } else {
    soundManager.unmuteAll();
  }

  // Set volumes
  soundManager.setBackgroundMusicVolume(currentSettings.backgroundMusicVolume);
  soundManager.setSoundEffectsVolume(currentSettings.soundEffectsVolume);
}

/**
 * Initialize settings system.
 */
export function initializeSettings() {
  loadSettings();
  applyAudioSettings();
  debug('settings', 'Settings system initialized');
}

/**
 * Get platform-specific text for overlays.
 * @param {'start'|'pause'|'controls'} context - Context for text (start, pause, etc.)
 * @returns {string} Platform-appropriate text.
 */
export function getPlatformText(context) {
  if (!currentSettings.platformSpecificText) {
    return getDefaultText(context);
  }

  /** @type {Record<'start'|'pause'|'controls', { mobile: string; desktop: string }>} */
  const platformTexts = {
    start: {
      mobile: 'Tap the Screen to Begin',
      desktop: 'Mouse Click to fire'
    },
    pause: {
      mobile: 'Tap to Resume',
      desktop: 'Press P to Resume'
    },
    controls: {
      mobile: 'Use touch to move your spaceship',
      desktop: 'Use mouse to move your spaceship'
    }
  };

  const platform = isMobile() ? 'mobile' : 'desktop';
  return platformTexts[context]?.[platform] || getDefaultText(context);
}

/**
 * Get default text (fallback).
 * @param {'start'|'pause'|'controls'} context - Context for text.
 * @returns {string} Default text.
 */
function getDefaultText(context) {
  /** @type {Record<'start'|'pause'|'controls', string>} */
  const defaultTexts = {
    start: 'Tap or Click to Begin',
    pause: 'Tap or Press P to Resume',
    controls: 'Use touch or mouse to move'
  };
  return defaultTexts[context] || '';
}
