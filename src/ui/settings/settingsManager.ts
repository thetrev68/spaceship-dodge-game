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
type _SettingsContext = 'start' | 'pause' | 'controls';

/**
 * @internal
 */
type _GameSettings = {
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
let storageAvailable = true;

/**
 * Validates settings object for type safety
 * @internal
 */
function validateSettings(settings: Partial<_GameSettings>): Partial<_GameSettings> {
  const validated: Partial<_GameSettings> = {};

  if (
    typeof settings.backgroundMusicVolume === 'number' &&
    settings.backgroundMusicVolume >= 0 &&
    settings.backgroundMusicVolume <= 1
  ) {
    validated.backgroundMusicVolume = settings.backgroundMusicVolume;
  }

  if (
    typeof settings.soundEffectsVolume === 'number' &&
    settings.soundEffectsVolume >= 0 &&
    settings.soundEffectsVolume <= 1
  ) {
    validated.soundEffectsVolume = settings.soundEffectsVolume;
  }

  if (typeof settings.isMuted === 'boolean') {
    validated.isMuted = settings.isMuted;
  }

  if (typeof settings.showTutorial === 'boolean') {
    validated.showTutorial = settings.showTutorial;
  }

  if (typeof settings.vibrationEnabled === 'boolean') {
    validated.vibrationEnabled = settings.vibrationEnabled;
  }

  if (typeof settings.platformSpecificText === 'boolean') {
    validated.platformSpecificText = settings.platformSpecificText;
  }

  if (typeof settings.version === 'string') {
    validated.version = settings.version;
  }

  return validated;
}

/**
 * Checks localStorage quota availability
 * @internal
 */
function checkStorageQuota(): boolean {
  try {
    const testKey = '__storage_quota_test__';
    const testData = 'x'.repeat(1024); // 1KB test
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    warn('settings', 'localStorage quota check failed - using in-memory settings only');
    return false;
  }
}

function loadSettings(): _GameSettings {
  try {
    if (typeof localStorage === 'undefined') {
      debug('settings', 'localStorage not available, using defaults');
      currentSettings = { ...DEFAULT_SETTINGS };
      storageAvailable = false;
      return currentSettings;
    }

    // Check storage quota on first load
    if (!checkStorageQuota()) {
      debug('settings', 'localStorage quota exceeded, using in-memory settings');
      currentSettings = { ...DEFAULT_SETTINGS };
      storageAvailable = false;
      return currentSettings;
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as Partial<_GameSettings>;
      // Runtime type validation for security
      const validated = validateSettings(parsed);
      currentSettings = { ...DEFAULT_SETTINGS, ...validated };
      debug('settings', 'Settings loaded and validated from storage', currentSettings);
    } else {
      debug('settings', 'No saved settings found, using defaults');
      currentSettings = { ...DEFAULT_SETTINGS };
    }
  } catch (error) {
    warn('settings', 'Failed to load settings:', error);
    currentSettings = { ...DEFAULT_SETTINGS };
    storageAvailable = false;
  }

  return currentSettings;
}

function saveSettings(): void {
  try {
    if (typeof localStorage !== 'undefined' && storageAvailable) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
      debug('settings', 'Settings saved to storage', currentSettings);
    } else if (!storageAvailable) {
      debug('settings', 'localStorage not available, settings only saved in memory');
    }
  } catch (error) {
    warn('settings', 'Failed to save settings:', error);
    // If save fails, disable future save attempts
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      warn('settings', 'localStorage quota exceeded - disabling persistent storage');
      storageAvailable = false;
    }
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
