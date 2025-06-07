import { initializeCanvas, setOverlayDimensions, showOverlay, quitGame } from './ui.js';
import { setupStarfield } from './starfield.js';
import { setCanvas, restartGameLoop } from './gameLoop.js';
import { startGame, continueGame } from './gameStateManager.js';
import { setupInput } from './inputManager.js';
import { setupMobileInput } from './mobileControls.js';
import { gameState, isMobile } from './state.js';
import * as soundManager from './soundManager.js';
import { forceAudioUnlock } from './soundManager.js';

let audioUnlockAttempted = false;

function handleFirstTouch() {
  if (audioUnlockAttempted) return;
  audioUnlockAttempted = true;

  console.log('[DEBUG] Attempting unlock from first touch');

  soundManager.forceAudioUnlock().then(() => {
    console.log('[DEBUG] Audio unlocked from raw touch event');
    soundManager.unmuteAll(); // 🔊 triggers startMusic after unlock
  }).catch(err => {
    console.warn('[WARN] Final audio unlock failed:', err);
  });

  document.removeEventListener('touchend', handleFirstTouch);
  document.removeEventListener('click', handleFirstTouch);
}

document.addEventListener('touchend', handleFirstTouch, { passive: true });
document.addEventListener('click', handleFirstTouch, { passive: true });

// console.log('[DEBUG] main.js is running');

function init() {
  // console.log('[DEBUG] init running — DOM loaded');

  const canvas = document.getElementById('gameCanvas');
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const continueButton = document.getElementById('continueButton');
  const quitButton = document.getElementById('quitButton');
  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
  const starfieldCanvas = document.getElementById('starfieldCanvas');

  // console.log('[DEBUG] startOverlay element:', startOverlay);

  if (!startOverlay) {
    // console.error('[ERROR] startOverlay not found in DOM.');
    return;
  }

  if (!isMobile && starfieldCanvas) {
    setupStarfield(starfieldCanvas);
  }

  initializeCanvas(canvas);
  setOverlayDimensions(canvas);
  setCanvas(canvas);

  const startEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

  const startGameHandler = (e) => {
    e.preventDefault();
    if (gameState.value !== 'START') return;

    // console.log('[DEBUG] Starting game from overlay');

    // Do NOT call forceAudioUnlock here
    soundManager.unmuteAll();   // this will call startMusic if unlock already succeeded

    startGame(canvas);
    restartGameLoop();
  };

  startOverlay.addEventListener(startEvent, startGameHandler, { passive: false });

  if (isMobile) {
    setupMobileInput(canvas);

    pauseOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'PAUSED') return;
      // console.log('[DEBUG] Resuming game from overlay touch');
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      import('./soundManager.js').then(m => m.unmuteAll());
      restartGameLoop();
    }, { passive: false });

    levelTransitionOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'LEVEL_TRANSITION') return;
      // console.log('[DEBUG] Resuming from level transition overlay');
      continueGame();
      restartGameLoop();
    }, { passive: false });
  } else {
    setupInput(canvas);

    startButton?.addEventListener('click', () => {
      if (gameState.value !== 'START') return;
      import('./soundManager.js').then(m => {
        m.unlockAudio().then(() => {
          m.startMusic();
          startGame(canvas);
          restartGameLoop();
        });
      });
    });

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

  showOverlay('START');
}

window.addEventListener('DOMContentLoaded', init);