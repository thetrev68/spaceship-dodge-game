import { getSettings } from '@ui/settings/settingsManager.js';
import { info, warn, error } from '@core/logger.js';
import { services } from '@services/ServiceProvider.js';

/**
 * Initializes the audio system with user settings
 *
 * @param userGesture - Whether initialization is triggered by user gesture
 * @returns Promise that resolves when audio is ready
 */
export async function initializeAudio(userGesture: boolean = false): Promise<void> {
  try {
    if (userGesture) {
      await services.audioService.unlock();
      info('audio', 'Audio unlocked via user gesture');
      services.audioService.unmuteAll();
    }

    const settings = getSettings();
    services.audioService.setVolume(settings.soundEffectsVolume);

    if (settings.isMuted) {
      services.audioService.muteAll();
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
    services.audioService.startMusic();
    info('audio', 'Background music started');
  } catch (err) {
    warn('audio', 'Failed to start background music', err);
  }
}
