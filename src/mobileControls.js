// js/mobileControls.js

import { gameState, player } from './state.js';
import { firePlayerBullets } from './player.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { stopGameLoop } from './gameLoop.js';

let touchActive = false;
let touchX = 0;
let touchY = 0;
let canvasEl = null;
let lastFireTime = 0;
const fireCooldown = 250; // milliseconds

export function setupMobileInput(canvas) {
  canvasEl = canvas;
  // console.log('[DEBUG] setupMobileInput called', { canvasId: canvas.id });

  // Mobile-specific input/gameplay loop
  function mobileLoop() {
    if (touchActive && gameState.value === 'PLAYING') {
      updatePlayerToTouch();
      const now = performance.now();
      if (now - lastFireTime >= fireCooldown) {
        firePlayerBullets();
        lastFireTime = now;
        // console.log('[DEBUG] Autofire triggered');
      }
    }
    requestAnimationFrame(mobileLoop);
  }

  requestAnimationFrame(mobileLoop);

  function handleTouchStart(e) {
    // console.log('[DEBUG] handleTouchStart triggered', e.target);
    e.preventDefault();

    // Only block the touch if it's inside a currently visible overlay
    const activeOverlay = document.querySelector('.game-overlay.visible');
    if (activeOverlay && activeOverlay.contains(e.target)) {
      // console.log('[DEBUG] Touch blocked — inside active overlay');
      return;
    }

    const t = e.touches[0];
    if (!t) {
      console.warn('[WARN] No touch object found');
      return;
    }

    const rect = canvasEl.getBoundingClientRect();
    touchX = t.clientX - rect.left;
    touchY = t.clientY - rect.top;
    touchActive = true;

    console.log('[DEBUG] TOUCH START', {
      touchX,
      touchY,
      state: gameState.value
    });
  }

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
// console.log('[DEBUG] Bound touchstart to canvas');

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  if (!t) return;
  const rect = canvasEl.getBoundingClientRect();
  touchX = t.clientX - rect.left;
  touchY = t.clientY - rect.top;
  // console.log('[DEBUG] TOUCH MOVE', { touchX, touchY });
}, { passive: false });
// console.log('[DEBUG] Bound touchmove to canvas');

  document.addEventListener('touchend', () => {
    // console.log('[DEBUG] TOUCH END');
    if (!touchActive) return;

    touchActive = false;

    if (gameState.value === 'PLAYING') {
      // console.log('[DEBUG] Switching state to PAUSED');
      gameState.value = 'PAUSED';
      showOverlay('PAUSED');
      soundManager.muteAll();
      stopGameLoop();
    }
  }, { passive: false });
  }

function updatePlayerToTouch() {
  // Provide override position for main game loop to apply
  player.overridePosition = {
    x: touchX - player.width / 2,
    y: touchY - player.height / 2
  };
  player.dx = 0;
  player.dy = 0;

  // console.log('[DEBUG] player.overridePosition set', player.overridePosition);
}
