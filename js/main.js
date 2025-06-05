import { initializeCanvas, setOverlayDimensions, showOverlay, quitGame } from './ui.js';
import { setupStarfield } from './starfield.js';
import { startGame, continueGame } from './loop.js';
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

  restartButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame(canvas);
  }, { passive: false });
  restartButton.addEventListener('click', () => startGame(canvas));

  continueButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    continueGame(canvas);
  }, { passive: false });
  continueButton.addEventListener('click', () => continueGame(canvas));

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