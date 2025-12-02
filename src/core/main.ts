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
import { getById } from '@utils/dom.js';

let audioUnlockAttempted = false;

function handleFirstTouch(): void {
  if (audioUnlockAttempted) return;
  audioUnlockAttempted = true;

  debug('audio', 'Attempting unlock from first touch');

  soundManager.forceAudioUnlock().then(() => {
    debug('audio', 'Audio unlocked from raw touch event');
    soundManager.unmuteAll();
  }).catch((err: unknown) => {
    warn('audio', 'Final audio unlock failed:', err);
  });

  document.removeEventListener('touchend', handleFirstTouch);
  document.removeEventListener('click', handleFirstTouch);
}

document.addEventListener('touchend', handleFirstTouch, { passive: true });
document.addEventListener('click', handleFirstTouch, { passive: true });

function init(): void {
  debug('game', 'init running - DOM loaded');

  initPerfHud();

  const canvasEl = getById<HTMLCanvasElement>('gameCanvas');
  if (!canvasEl) {
    warn('ui', 'gameCanvas not found or not a canvas element.');
    return;
  }
  const canvas = canvasEl;
  const startButton = getById<HTMLButtonElement>('startButton');
  const restartButton = getById<HTMLButtonElement>('restartButton');
  const continueButton = getById<HTMLButtonElement>('continueButton');
  const quitButton = getById<HTMLButtonElement>('quitButton');
  const startOverlay = getById<HTMLElement>('startOverlay');
  const pauseOverlay = getById<HTMLElement>('pauseOverlay');
  const levelTransitionOverlay = getById<HTMLElement>('levelTransitionOverlay');
  const starfieldCanvas = getById<HTMLCanvasElement>('starfieldCanvas');
  const settingsButtonStart = getById<HTMLButtonElement>('settingsButtonStart');
  const settingsButtonLevel = getById<HTMLButtonElement>('settingsButtonLevel');
  const settingsButtonPause = getById<HTMLButtonElement>('settingsButtonPause');
  const settingsButtonGameOver = getById<HTMLButtonElement>('settingsButtonGameOver');

  if (!startOverlay) {
    warn('ui', 'startOverlay not found in DOM.');
    return;
  }

  if (!isMobile() && starfieldCanvas) {
    setupStarfield(starfieldCanvas);
  }

  initializeSettings();
  initializeSettingsUI();

  initializeCanvas(canvas);
  setOverlayDimensions(canvas);
  setCanvas(canvas);

  const startEvent: 'touchstart' | 'click' = 'ontouchstart' in window ? 'touchstart' : 'click';

  const startGameHandler = (event: Event): void => {
    event.preventDefault();
    if (gameState.value !== 'START') return;

    debug('game', 'Starting game from overlay');
    soundManager.unmuteAll();
    startGame(canvas);
    restartGameLoop();
  };

  startButton?.addEventListener(startEvent, startGameHandler, { passive: false });

  if (isMobile()) {
    setupMobileInput(canvas);

    pauseOverlay?.addEventListener('touchstart', (event: TouchEvent) => {
      event.preventDefault();
      if (gameState.value !== 'PAUSED') return;
      debug('game', 'Resuming game from overlay touch');
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      soundManager.unmuteAll();
      restartGameLoop();
    }, { passive: false });

    levelTransitionOverlay?.addEventListener('touchstart', (event: TouchEvent) => {
      event.preventDefault();
      if (gameState.value !== 'LEVEL_TRANSITION') return;
      debug('game', 'Resuming from level transition overlay');
      continueGame();
      restartGameLoop();
    }, { passive: false });
  } else {
    setupInput(canvas);

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

  const addSettingsHandler = (button: HTMLButtonElement | null): void => {
    button?.addEventListener('click', (event) => {
      event.preventDefault();
      showSettings();
    });
  };

  addSettingsHandler(settingsButtonStart);
  addSettingsHandler(settingsButtonLevel);
  addSettingsHandler(settingsButtonPause);
  addSettingsHandler(settingsButtonGameOver);

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    const isActivateKey = event.key === 'Enter' || event.key === ' ';
    if (event.key === 'Escape') {
      hideSettings();
      return;
    }

    if (!isActivateKey || gameState.value === 'PLAYING') return;

    if (gameState.value === 'START') {
      startGameHandler(event);
    } else if (gameState.value === 'LEVEL_TRANSITION') {
      event.preventDefault();
      continueGame();
      restartGameLoop();
    } else if (gameState.value === 'GAME_OVER') {
      event.preventDefault();
      startGame(canvas);
      restartGameLoop();
    } else if (gameState.value === 'PAUSED') {
      event.preventDefault();
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      soundManager.unmuteAll();
      restartGameLoop();
    }
  });

  showOverlay('START');
}

window.addEventListener('DOMContentLoaded', init);
