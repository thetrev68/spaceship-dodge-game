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
  const starfieldCanvas = document.getElementById('starfieldCanvas');

  if (!isMobile && starfieldCanvas) {
    setupStarfield(starfieldCanvas);
  }

  initializeCanvas(canvas);
  setOverlayDimensions(canvas);
  setCanvas(canvas);

  if (isMobile) {
    setupMobileInput(canvas);
    // Mobile start: Tap anywhere on start overlay
    startOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'START') return;
      console.log('[DEBUG] Starting game from overlay touch');
      import('./soundManager.js').then(m => {
        m.unlockAudio();
        m.startMusic();
      });
      startGame(canvas);
      restartGameLoop();
    }, { passive: false });

    // Mobile resume: Tap anywhere on pause overlay
    pauseOverlay?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'PAUSED') return;
      console.log('[DEBUG] Resuming game from overlay touch');
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      import('./soundManager.js').then(m => m.unmuteAll());
      restartGameLoop();
    }, { passive: false });
  } else {
    setupInput(canvas);
  }

  // Desktop start: Click to begin
  if (!isMobile) {
    startButton?.addEventListener('click', () => {
      if (gameState.value !== 'START') return;
      import('./soundManager.js').then(m => {
        m.unlockAudio();
        m.startMusic();
      });
      startGame(canvas);
      restartGameLoop();
    });
  }

  restartButton?.addEventListener('click', () => {
    startGame(canvas);
    restartGameLoop();
  });

  continueButton?.addEventListener('click', () => {
    continueGame();
    restartGameLoop();
  });

  quitButton?.addEventListener('click', () => {
    quitGame();
  });

  showOverlay('START');
}

window.addEventListener('DOMContentLoaded', init);