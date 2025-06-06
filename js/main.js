/*
  main.js
  Entry point for Spaceship Dodge
  Cleaned to defer game startup until explicit user action (touch or click)
*/

import { initializeCanvas, setOverlayDimensions, showOverlay, quitGame } from './ui.js';
import { setupStarfield } from './starfield.js';
import { setCanvas } from './gameLoop.js';
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
  setCanvas(canvas);               // Pass canvas to game loop
  setupInput(canvas);              // Desktop input

  if (isMobile) {
    setupMobileInput(canvas);      // Mobile touch-hold input
  }

  window.addEventListener('resize', () => {
    initializeCanvas(canvas);
    setOverlayDimensions(canvas);
  });

  let isStarting = false;

  // START button - desktop use
  startButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState.value !== 'START' || isStarting) return;
    isStarting = true;
    import('./soundManager.js').then(m => m.unlockAudio());
    startGame(canvas);
    setTimeout(() => isStarting = false, 1000);
  }, { passive: false });

  startButton.addEventListener('click', () => {
    if (gameState.value !== 'START' || isStarting) return;
    isStarting = true;
    import('./soundManager.js').then(m => m.unlockAudio());
    startGame(canvas);
    setTimeout(() => isStarting = false, 1000);
  });

  // RESTART after Game Over
  restartButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame(canvas);
  }, { passive: false });

  restartButton.addEventListener('click', () => {
    startGame(canvas);
  });

  // Continue after level up
  continueButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    continueGame();
  }, { passive: false });

  continueButton.addEventListener('click', () => {
    continueGame();
  });

  // Quit game
  if (quitButton) {
    quitButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      quitGame();
    }, { passive: false });

    quitButton.addEventListener('click', () => quitGame());
  }

  // Initial UI
  showOverlay('START');
}

window.addEventListener('DOMContentLoaded', init);