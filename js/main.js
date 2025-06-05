// main.js
/*
  Entry point: sets up canvas, UI buttons, starfield, and game start/continue logic
  Updated to use modular gameLoop, gameStateManager, and inputManager.
*/

import { initializeCanvas, setOverlayDimensions, showOverlay, quitGame } from './ui.js';
import { setupStarfield } from './starfield.js';
import { setCanvas, restartGameLoop } from './gameLoop.js';
import { startGame, continueGame } from './gameStateManager.js';
import { setupInput } from './inputManager.js';
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
  setCanvas(canvas);         // NEW: provide canvas to gameLoop
  setupInput(canvas);        // NEW: setup controls on canvas

  window.addEventListener('resize', () => {
    initializeCanvas(canvas);
    setOverlayDimensions(canvas);
  });

  let isStarting = false; // Prevent double-tap

  startButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState.value !== 'START' || isStarting) return;
    isStarting = true;
    import('./soundManager.js').then(m => m.unlockAudio());
    startGame(canvas);        // start game logic
    restartGameLoop();        // start game loop animation
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

  restartButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame(canvas);
    restartGameLoop();
  }, { passive: false });
  restartButton.addEventListener('click', () => {
    startGame(canvas);
    restartGameLoop();
  });

  continueButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    continueGame();
    restartGameLoop();
  }, { passive: false });
  continueButton.addEventListener('click', () => {
    continueGame();
    restartGameLoop();
  });

  if (quitButton) {
    quitButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      quitGame();
    }, { passive: false });
    quitButton.addEventListener('click', () => quitGame());
  }

  showOverlay('START');
}

window.addEventListener('DOMContentLoaded', init);