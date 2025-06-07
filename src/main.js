import { initializeCanvas, setOverlayDimensions, showOverlay, quitGame } from './ui.js';
import { setupStarfield } from './starfield.js';
import { setCanvas, restartGameLoop } from './gameLoop.js';
import { startGame, continueGame } from './gameStateManager.js';
import { setupInput } from './inputManager.js';
import { setupMobileInput } from './mobileControls.js';
import { gameState, isMobile } from './state.js';

function init() {
  const canvas = document.getElementById('gameCanvas');
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const continueButton = document.getElementById('continueButton');
  const quitButton = document.getElementById('quitButton');
  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
  const starfieldCanvas = document.getElementById('starfieldCanvas');

  if (!isMobile && starfieldCanvas) {
    setupStarfield(starfieldCanvas);
  }

  initializeCanvas(canvas);
  setOverlayDimensions(canvas);
  setCanvas(canvas);

  const startEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

  startOverlay?.addEventListener(startEvent, async (e) => {
    e.preventDefault();
    if (gameState.value !== 'START') return;
    console.log('[DEBUG] Starting game from overlay');

    const m = await import('./soundManager.js');
    try {
      await m.unlockAudio();
      m.startMusic();
    } catch (err) {
      console.warn('[WARN] Audio unlock failed on first try', err);
    }

    const stateManager = await import('./gameStateManager.js');
    stateManager.startGame(canvas);
    restartGameLoop();
  }, { passive: false });

  if (isMobile) {
    setupMobileInput(canvas);

    pauseOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'PAUSED') return;
      console.log('[DEBUG] Resuming game from overlay touch');
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      import('./soundManager.js').then(m => m.unmuteAll());
      restartGameLoop();
    }, { passive: false });

    levelTransitionOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'LEVEL_TRANSITION') return;
      console.log('[DEBUG] Resuming from level transition overlay');
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