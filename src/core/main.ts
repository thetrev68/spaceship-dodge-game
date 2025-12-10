/**
 * @module core/main
 * Main entry point for the spaceship dodge game.
 * Orchestrates initialization and UI wiring.
 */

import type { CanvasSetup } from './init/canvasInit.js';
import { initializeCanvas } from './init/canvasInit.js';
import { initializeAudio } from './init/audioInit.js';
import { initializeInput } from './init/inputInit.js';
import { initializeUI } from './init/uiInit.js';
import { wireOverlayControls } from './init/overlayInit.js';
import { setCanvas } from '@game/gameLoop.js';
import { debug, warn } from '@core/logger.js';
import { CanvasError, handleError } from '@utils/errors.js';
import { initializeSettings } from '@ui/settings/settingsManager.js';
import { services } from '@services/ServiceProvider.js';
import { analytics } from '@utils/analytics.js';
import { initializeKeyboardHelp } from '@ui/accessibility/keyboardHelp.js';
import { announcer } from '@ui/accessibility/announcer.js';
import { initializeThemeSystem, applyUITheme, watchTheme } from '@core/themes';
import { registerDevTools } from '@utils/devTools.js';
import { logVersion, VERSION_STRING } from '@core/version.js';

let audioUnlockAttempted = false;

function handleFirstTouch(): void {
  if (audioUnlockAttempted) return;
  audioUnlockAttempted = true;

  debug('audio', 'Attempting unlock from first touch');

  initializeAudio(true)
    .then(() => {
      debug('audio', 'Audio unlocked from raw touch event');
      services.audioService.unmuteAll();
      analytics.trackInteraction('audio-unlock-attempted');
    })
    .catch((err: unknown) => {
      warn('audio', 'Final audio unlock failed:', err);
    });

  document.removeEventListener('touchend', handleFirstTouch);
  document.removeEventListener('click', handleFirstTouch);
}

document.addEventListener('touchend', handleFirstTouch, { passive: true });
document.addEventListener('click', handleFirstTouch, { passive: true });

async function main() {
  debug('game', 'Spaceship Dodge starting...');

  // Log version to console
  logVersion();

  // Display version in UI
  const versionElement = document.getElementById('versionInfo');
  if (versionElement) {
    versionElement.textContent = VERSION_STRING;
  }

  // Track app initialization
  analytics.trackEvent({
    category: 'performance',
    action: 'app-initialized',
    value: Date.now(),
  });

  // Initialize theme system before rendering
  initializeThemeSystem();
  applyUITheme();

  // Apply UI theme when theme changes
  watchTheme(applyUITheme);

  // Expose dev helpers when debugging locally
  registerDevTools();

  initializeSettings();

  const canvasSetup: CanvasSetup | null = initializeCanvas();
  if (!canvasSetup) {
    throw new CanvasError('Canvas initialization failed');
  }

  const { canvas, ctx } = canvasSetup;

  initializeUI();
  initializeInput(canvas);
  wireOverlayControls(canvas);

  await initializeAudio();

  // Initialize accessibility features
  initializeKeyboardHelp();

  // Welcome announcement
  announcer.announce(
    'Spaceship Dodge game loaded. Press ? for keyboard shortcuts, or click Start to begin.'
  );

  debug('game', 'Initialization complete');

  // Kick off render loop context
  if (ctx) {
    // Start in paused/start overlay; loop begins on start
    setCanvas(canvas);
  }
}

// Start the application
window.addEventListener('DOMContentLoaded', () => {
  main().catch((err) => {
    handleError(err as Error);
  });
});
