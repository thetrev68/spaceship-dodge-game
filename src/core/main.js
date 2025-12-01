/**
 * @fileoverview Main entry point for the spaceship dodge game.
 * Handles initialization, input setup, and game start logic.
 */

import { initializeCanvas, setOverlayDimensions, showOverlay, quitGame } from '@ui/overlays/overlayManager.js';
import { setupStarfield } from '@effects/starfield.js';
import { setCanvas, restartGameLoop } from '@game/gameLoop.js';
import { startGame, continueGame } from '@game/gameStateManager.js';
import { setupInput } from '@input/inputManager.js';
import { setupMobileInput } from '@input/mobileControls.js';
import { gameState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import * as soundManager from '@systems/soundManager.js';
import { debug, warn } from '@core/logger.js';
import { initializeSettings } from '@ui/settings/settingsManager.js';
import { initializeSettingsUI, showSettings, hideSettings } from '@ui/settings/settingsUI.js';
import { initPerfHud } from '@ui/hud/perfHUD.js';

/**
 * Flag to track if audio unlock has been attempted.
 * @type {boolean}
 */
let audioUnlockAttempted = false;

/**
 * Handles the first touch or click to unlock audio.
 */
function handleFirstTouch() {
  if (audioUnlockAttempted) return;
  audioUnlockAttempted = true;

  debug('audio', 'Attempting unlock from first touch');

  soundManager.forceAudioUnlock().then(() => {
    debug('audio', 'Audio unlocked from raw touch event');
    soundManager.unmuteAll(); // 🔊 triggers startMusic after unlock
  }).catch(err => {
    warn('audio', 'Final audio unlock failed:', err);
  });

  document.removeEventListener('touchend', handleFirstTouch);
  document.removeEventListener('click', handleFirstTouch);
}

document.addEventListener('touchend', handleFirstTouch, { passive: true });
document.addEventListener('click', handleFirstTouch, { passive: true });

/**
 * Initializes the game when DOM is loaded.
 */
function init() {
  debug('game', 'init running - DOM loaded');

  initPerfHud();

  const canvasEl = document.getElementById('gameCanvas');
  if (!(canvasEl instanceof HTMLCanvasElement)) {
    warn('ui', 'gameCanvas not found or not a canvas element.');
    return;
  }
  const canvas = canvasEl;
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const continueButton = document.getElementById('continueButton');
  const quitButton = document.getElementById('quitButton');
  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
  const starfieldCanvasEl = document.getElementById('starfieldCanvas');
  const starfieldCanvas = starfieldCanvasEl instanceof HTMLCanvasElement ? starfieldCanvasEl : null;
  const settingsButtonStart = document.getElementById('settingsButtonStart');
  const settingsButtonLevel = document.getElementById('settingsButtonLevel');
  const settingsButtonPause = document.getElementById('settingsButtonPause');
  const settingsButtonGameOver = document.getElementById('settingsButtonGameOver');

  if (!startOverlay) {
    warn('ui', 'startOverlay not found in DOM.');
    return;
  }

  if (!isMobile() && starfieldCanvas) {
    setupStarfield(starfieldCanvas);
  }

  // Initialize settings system
  initializeSettings();
  initializeSettingsUI();

  initializeCanvas(canvas);
  setOverlayDimensions(canvas);
  setCanvas(canvas);

  const startEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

  /**
   * Handler for starting the game from overlay.
   * @param {Event} e - The event object.
   */
  const startGameHandler = (e) => {
    e.preventDefault();
    if (gameState.value !== 'START') return;

    debug('game', 'Starting game from overlay');

    // Do NOT call forceAudioUnlock here
    soundManager.unmuteAll();   // this will call startMusic if unlock already succeeded

    startGame(canvas);
    restartGameLoop();
  };

  // Remove the overlay-wide event listener to prevent starting by tapping anywhere
  // startOverlay.addEventListener(startEvent, startGameHandler, { passive: false });

  // Only allow starting via the start button
  startButton?.addEventListener(startEvent, startGameHandler, { passive: false });

  if (isMobile()) {
    setupMobileInput(canvas);

    pauseOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'PAUSED') return;
      debug('game', 'Resuming game from overlay touch');
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      soundManager.unmuteAll();
      restartGameLoop();
    }, { passive: false });

    levelTransitionOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'LEVEL_TRANSITION') return;
      debug('game', 'Resuming from level transition overlay');
      continueGame();
      restartGameLoop();
    }, { passive: false });
  } else {
    setupInput(canvas);

    // Remove duplicate start button listener - handled above for both mobile and desktop
    // startButton?.addEventListener('click', () => {
    //   if (gameState.value !== 'START') return;
    //   soundManager.forceAudioUnlock().then(() => {
    //     soundManager.startMusic();
    //     startGame(canvas);
    //     restartGameLoop();
    //   });
    // });

    continueButton?.addEventListener('click', () => {
      continueGame();
      restartGameLoop();
    });

    quitButton?.addEventListener('click', () => {
      quitGame();
    });
  }

  restartButton?.addEventListener('click', () => {
    startGame(canvas);
    restartGameLoop();
  });

  // Add settings button event listeners
  settingsButtonStart?.addEventListener('click', (e) => {
    e.preventDefault();
    showSettings();
  });

  settingsButtonLevel?.addEventListener('click', (e) => {
    e.preventDefault();
    showSettings();
  });

  settingsButtonPause?.addEventListener('click', (e) => {
    e.preventDefault();
    showSettings();
  });

  settingsButtonGameOver?.addEventListener('click', (e) => {
    e.preventDefault();
    showSettings();
  });

  document.addEventListener('keydown', (e) => {
    const isActivateKey = e.key === 'Enter' || e.key === ' ';
    if (e.key === 'Escape') {
      hideSettings();
      return;
    }

    if (!isActivateKey) return;
    if (gameState.value === 'PLAYING') return;

    if (gameState.value === 'START') {
      startGameHandler(e);
    } else if (gameState.value === 'LEVEL_TRANSITION') {
      e.preventDefault();
      continueGame();
      restartGameLoop();
    } else if (gameState.value === 'GAME_OVER') {
      e.preventDefault();
      startGame(canvas);
      restartGameLoop();
    } else if (gameState.value === 'PAUSED') {
      e.preventDefault();
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      soundManager.unmuteAll();
      restartGameLoop();
    }
  });

  showOverlay('START');
}

window.addEventListener('DOMContentLoaded', init);
