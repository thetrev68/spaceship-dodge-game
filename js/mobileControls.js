// js/mobileControls.js

import { startGame } from './gameStateManager.js'; // ✅ at top
import { gameState, player } from './state.js';
import { firePlayerBullets } from './player.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { restartGameLoop, stopGameLoop } from './gameLoop.js';

let touchActive = false;
let touchX = 0;
let touchY = 0;
let canvasEl = null;

export function setupMobileInput(canvas) {
  canvasEl = canvas;

  console.log('[DEBUG] setupMobileInput called');

  // Log game state every second
  setInterval(() => {
    console.log('[DEBUG] gameState:', gameState.value);
  }, 1000);

  // Main touch loop
  function mobileLoop() {
    console.log('[DEBUG] mobileLoop tick:', {
      active: touchActive,
      state: gameState.value
    });

    if (touchActive && gameState.value === 'PLAYING') {
      updatePlayerToTouch();
      firePlayerBullets();
    }

    requestAnimationFrame(mobileLoop);
  }

  requestAnimationFrame(mobileLoop);

  // Handle touch start
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;

    const rect = canvas.getBoundingClientRect();
    touchX = t.clientX - rect.left;
    touchY = t.clientY - rect.top;
    touchActive = true;

    console.log('[DEBUG] TOUCH START');

    if (gameState.value === 'START' || gameState.value === 'PAUSED') {
      console.log('[DEBUG] Starting game from touch');
      startGame(canvas); // ✅ fix: use correct reference
      restartGameLoop();
    }
  }, { passive: false });

  // Handle touch move
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;

    const rect = canvas.getBoundingClientRect();
    touchX = t.clientX - rect.left;
    touchY = t.clientY - rect.top;
  }, { passive: false });

  // Handle touch end
  const stopTouch = () => {
    console.log('[DEBUG] TOUCH END');
    touchActive = false;

    if (gameState.value === 'PLAYING') {
      console.log('[DEBUG] Switching state to PAUSED');
      gameState.value = 'PAUSED';
      showOverlay('PAUSED');
      soundManager.muteAll();
      stopGameLoop();
    }
  };

  canvas.addEventListener('touchend', stopTouch, { passive: false });
  canvas.addEventListener('touchcancel', stopTouch, { passive: false });
  document.addEventListener('touchend', stopTouch);
  document.addEventListener('touchcancel', stopTouch);
}

function updatePlayerToTouch() {
  player.x = touchX - player.width / 2;
  player.y = touchY - player.height / 2;
}