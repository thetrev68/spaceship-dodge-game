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
  const starfieldCanvas = document.getElementById('starfieldCanvas');

  if (!isMobile && starfieldCanvas) {
    setupStarfield(starfieldCanvas);
  }

  initializeCanvas(canvas);
  setOverlayDimensions(canvas);
  setCanvas(canvas);

  if (isMobile) {
    setupMobileInput(canvas); // ✅ mobile-only
  } else {
    setupInput(canvas);       // ✅ desktop only
  }

  window.addEventListener('resize', () => {
    initializeCanvas(canvas);
    setOverlayDimensions(canvas);
  });

  // Desktop start only
  if (!isMobile) {
    startButton?.addEventListener('click', () => {
      if (gameState.value !== 'START') return;
      import('./soundManager.js').then(m => m.unlockAudio());
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