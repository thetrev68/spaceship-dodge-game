import {
  forceAudioUnlock,
  startMusic,
  setBackgroundMusicVolume,
  setSoundEffectsVolume,
  muteAll,
  unmuteAll,
} from '@systems/soundManager.js';
import { getSettings } from '@ui/settings/settingsManager.js';
import { info, warn, error } from '@core/logger.js';

/**
 * Initializes the audio system with user settings
 *
 * @param userGesture - Whether initialization is triggered by user gesture
 * @returns Promise that resolves when audio is ready
 */
export async function initializeAudio(userGesture: boolean = false): Promise<void> {
  try {
    if (userGesture) {
      await forceAudioUnlock();
      info('audio', 'Audio unlocked via user gesture');
      unmuteAll();
    }

    const settings = getSettings();
    setBackgroundMusicVolume(settings.backgroundMusicVolume);
    setSoundEffectsVolume(settings.soundEffectsVolume);

    if (settings.isMuted) {
      muteAll();
    }

    info('audio', 'Audio initialized', { volume: settings.soundEffectsVolume, muted: settings.isMuted });
  } catch (err) {
    error('audio', 'Audio initialization failed', err as Error);
    // Non-fatal error, game can continue without audio
  }
}

/**
 * Starts background music if audio is unlocked and not muted
 */
export function startBackgroundMusic(): void {
  try {
    startMusic();
    info('audio', 'Background music started');
  } catch (err) {
    warn('audio', 'Failed to start background music', err);
  }
}
