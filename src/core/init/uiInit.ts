import { initializeSettingsUI } from '@ui/settings/settingsUI.js';
import { initPerfHud } from '@ui/hud/perfHUD.js';
import { info } from '@core/logger.js';
import { initializeScorePopups } from '@ui/hud/scorePopups.js';
import { createAudioControls } from '@ui/controls/audioControls.js';

/**
 * Initializes UI components
 */
export function initializeUI(): void {
  initPerfHud();
  initializeSettingsUI();
  initializeScorePopups();
  createAudioControls();

  info('ui', 'UI components initialized');
}
