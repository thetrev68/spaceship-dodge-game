import { initializeSettingsUI } from '@ui/settings/settingsUI.js';
import { createAudioControls } from '@ui/controls/audioControls.js';
import { initPerfHud } from '@ui/hud/perfHUD.js';
import { info } from '@core/logger.js';
import { initializeScorePopups } from '@ui/hud/scorePopups.js';

/**
 * Initializes UI components
 */
export function initializeUI(): void {
  initPerfHud();
  initializeSettingsUI();
  createAudioControls();
  initializeScorePopups();

  info('ui', 'UI components initialized');
}
