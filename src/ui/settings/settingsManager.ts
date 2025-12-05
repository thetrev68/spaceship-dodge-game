/**
 * @module ui/settings/settingsManager
 * Game settings management system.
 * Handles user preferences, audio settings, and platform-specific configurations.
 */

import { debug, warn } from '@core/logger.js';
import { services } from '@services/ServiceProvider.js';
import { isMobile } from '@utils/platform.js';
import { VOLUME_CONSTANTS, SETTINGS_CONSTANTS } from '@core/uiConstants.js';

/**
 * @internal
 */
export type _SettingsContext = 'start' | 'pause' | 'controls';

/**
 * @internal
 */
export type _GameSettings = {
  backgroundMusicVolume: number;
  soundEffectsVolume: number;
  isMuted: boolean;
  showTutorial: boolean;
  vibrationEnabled: boolean;
  platformSpecificText: boolean;
  version: string;
};

const SETTINGS_KEY = SETTINGS_CONSTANTS.LOCAL_STORAGE_KEY;

const DEFAULT_SETTINGS: _GameSettings = {
  backgroundMusicVolume: VOLUME_CONSTANTS.DEFAULT_BACKGROUND_MUSIC,
  soundEffectsVolume: VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS,
  isMuted: false,
  showTutorial: true,
  vibrationEnabled: true,
  platformSpecificText: true,
  version: SETTINGS_CONSTANTS.DEFAULT_SETTINGS_VERSION,
};

let currentSettings: _GameSettings = { ...DEFAULT_SETTINGS };

function loadSettings(): _GameSettings {
  try {
    const savedSettings =
      typeof localStorage !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null;
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as Partial<_GameSettings>;
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

function saveSettings(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
      debug('settings', 'Settings saved to storage', currentSettings);
    }
  } catch (error) {
    warn('settings', 'Failed to save settings:', error);
  }
}

export function getSettings(): _GameSettings {
  return { ...currentSettings };
}

export function setSetting<K extends keyof _GameSettings>(key: K, value: _GameSettings[K]): void {
  currentSettings[key] = value;
  debug('settings', `Setting updated: ${key} = ${String(value)}`);
  saveSettings();
}

function applyAudioSettings(): void {
  debug('settings', 'Applying audio settings', {
    bgVolume: currentSettings.backgroundMusicVolume,
    sfxVolume: currentSettings.soundEffectsVolume,
    muted: currentSettings.isMuted,
  });

  if (currentSettings.isMuted) {
    services.audioService.muteAll();
  } else {
    services.audioService.unmuteAll();
  }

  services.audioService.setBackgroundMusicVolume(currentSettings.backgroundMusicVolume);
  services.audioService.setSoundEffectsVolume(currentSettings.soundEffectsVolume);
}

export function initializeSettings(): void {
  loadSettings();
  applyAudioSettings();
  debug('settings', 'Settings system initialized');
}

export function getPlatformText(context: _SettingsContext): string {
  if (!currentSettings.platformSpecificText) {
    return getDefaultText(context);
  }

  const platformTexts: Record<_SettingsContext, { mobile: string; desktop: string }> = {
    start: {
      mobile: 'Tap the Screen to Begin',
      desktop: 'Mouse Click to fire',
    },
    pause: {
      mobile: 'Tap to Resume',
      desktop: 'Press P to Resume',
    },
    controls: {
      mobile: 'Use touch to move your spaceship',
      desktop: 'Use mouse to move your spaceship',
    },
  };

  const platform = isMobile() ? 'mobile' : 'desktop';
  return platformTexts[context]?.[platform] ?? getDefaultText(context);
}

function getDefaultText(context: _SettingsContext): string {
  const defaultTexts: Record<_SettingsContext, string> = {
    start: 'Tap or Click to Begin',
    pause: 'Tap or Press P to Resume',
    controls: 'Use touch or mouse to move',
  };
  return defaultTexts[context] ?? '';
}
