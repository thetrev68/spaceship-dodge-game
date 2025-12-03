/**
 * @fileoverview Main entry point for the spaceship dodge game.
 * Orchestrates initialization and UI wiring.
 */

import { initializeCanvas } from './init/canvasInit.js';
import { initializeAudio, startBackgroundMusic } from './init/audioInit.js';
import { initializeInput } from './init/inputInit.js';
import { initializeUI } from './init/uiInit.js';
import { setupStarfield } from '@effects/starfield.js';
import { setCanvas, restartGameLoop } from '@game/gameLoop.js';
import { startGame, continueGame } from '@game/gameStateManager.js';
import { gameState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import * as soundManager from '@systems/soundManager.js';
import { debug, warn } from '@core/logger.js';
import { initializeSettings } from '@ui/settings/settingsManager.js';
import { showSettings, hideSettings } from '@ui/settings/settingsUI.js';
import { getById } from '@utils/dom.js';
import { showOverlay, setOverlayDimensions, quitGame } from '@ui/overlays/overlayManager.js';

let audioUnlockAttempted = false;

function handleFirstTouch(): void {
  if (audioUnlockAttempted) return;
  audioUnlockAttempted = true;

  debug('audio', 'Attempting unlock from first touch');

  initializeAudio(true)
    .then(() => {
      debug('audio', 'Audio unlocked from raw touch event');
      soundManager.unmuteAll();
    })
    .catch((err: unknown) => {
      warn('audio', 'Final audio unlock failed:', err);
    });

  document.removeEventListener('touchend', handleFirstTouch);
  document.removeEventListener('click', handleFirstTouch);
}

document.addEventListener('touchend', handleFirstTouch, { passive: true });
document.addEventListener('click', handleFirstTouch, { passive: true });

function wireOverlayControls(canvas: HTMLCanvasElement): void {
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

  setOverlayDimensions(canvas);
  setCanvas(canvas);

  const startEvent: 'touchstart' | 'click' = 'ontouchstart' in window ? 'touchstart' : 'click';

  const startGameHandler = (event: Event): void => {
    event.preventDefault();
    if (gameState.value !== 'START') return;

    debug('game', 'Starting game from overlay');
    soundManager.unmuteAll();
    startBackgroundMusic();
    startGame(canvas);
    restartGameLoop();
  };

  startButton?.addEventListener(startEvent, startGameHandler, { passive: false });

  if (isMobile()) {
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

async function main() {
  debug('game', 'Spaceship Dodge starting...');

  initializeSettings();

  const canvasSetup = initializeCanvas();
  if (!canvasSetup) {
    warn('game', 'Fatal: Canvas initialization failed');
    return;
  }

  const { canvas, ctx } = canvasSetup;

  initializeUI();
  initializeInput(canvas);
  wireOverlayControls(canvas);

  await initializeAudio();

  debug('game', 'Initialization complete');

  // Kick off render loop context
  if (ctx) {
    // Start in paused/start overlay; loop begins on start
    setCanvas(canvas);
  }
}

// Start the application
window.addEventListener('DOMContentLoaded', () => {
  main().catch(err => {
    warn('game', 'Fatal error during initialization', err);
  });
});
