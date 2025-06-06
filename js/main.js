/*
  main.js
  Clean separation of desktop and mobile logic.
  Prevents inputManager from clashing with mobileControls.
*/

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

  // Desktop-only starfield
  if (!isMobile && starfieldCanvas) {
    setupStarfield(starfieldCanvas);
  }

  // Core canvas setup
  initializeCanvas(canvas);
  setOverlayDimensions(canvas);
  setCanvas(canvas);

  // Platform-specific input
  if (isMobile) {
    setupMobileInput(canvas); // ✅ mobile-only touch setup
  } else {
    setupInput(canvas);       // ✅ desktop keyboard/mouse
  }

  // Resizing
  window.addEventListener('resize', () => {
    initializeCanvas(canvas);
    setOverlayDimensions(canvas);
  });

  let isStarting = false;

  // Desktop-only: Start Game button
  if (!isMobile) {
    startButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState.value !== 'START' || isStarting) return;
      isStarting = true;
      import('./soundManager.js').then(m => m.unlockAudio());
      startGame(canvas);
      restartGameLoop();
      setTimeout(() => isStarting = false, 1000);
    }, { passive: false });

    startButton.addEventListener('click', () => {
      if (gameState.value !== 'START' || isStarting) return;
      isStarting = true;
      import('./soundManager.js').then(m => m.unlockAudio());
      startGame(canvas);
      restartGameLoop();
      setTimeout(() => isStarting = false, 1000);
    });
  }

  // Restart after game over
  restartButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame(canvas);
    restartGameLoop();
  }, { passive: false });

  restartButton.addEventListener('click', () => {
    startGame(canvas);
    restartGameLoop();
  });

  // Continue after level-up
  continueButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    continueGame();
    restartGameLoop();
  }, { passive: false });

  continueButton.addEventListener('click', () => {
    continueGame();
    restartGameLoop();
  });

  // Quit
  if (quitButton) {
    quitButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      quitGame();
    }, { passive: false });

    quitButton.addEventListener('click', () => quitGame());
  }

  // Show initial overlay
  showOverlay('START');
}

window.addEventListener('DOMContentLoaded', init);