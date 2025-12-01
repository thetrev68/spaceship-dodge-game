// js/mobileControls.js

import { gameState } from '@core/state.js';
import { setPlayerPosition, firePlayerBullets, getPlayerDimensions } from '@entities/player.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import * as soundManager from '@systems/soundManager.js';
import { stopGameLoop } from '@game/gameLoop.js';
import { debug, warn } from '@core/logger.js';

let touchActive = false;
let touchX = 0;
let touchY = 0;
let canvasEl = null;
let lastFireTime = 0;
const fireCooldown = 250; // milliseconds

export function setupMobileInput(canvas) {
  canvasEl = canvas;
  debug('input', 'setupMobileInput called', { canvasId: canvas.id });

  // Mobile-specific input/gameplay loop
  function mobileLoop() {
    if (touchActive && gameState.value === 'PLAYING') {
      updatePlayerToTouch();
      const now = performance.now();
      if (now - lastFireTime >= fireCooldown) {
        firePlayerBullets();
        lastFireTime = now;
        debug('input', 'Autofire triggered');
      }
    }
    requestAnimationFrame(mobileLoop);
  }

  requestAnimationFrame(mobileLoop);

  function handleTouchStart(e) {
    // debug('input', 'handleTouchStart triggered', e.target);
    e.preventDefault();

    // Only block the touch if it's inside a currently visible overlay
    const activeOverlay = document.querySelector('.game-overlay.visible');
    if (activeOverlay && activeOverlay.contains(e.target)) {
      debug('input', 'Touch blocked — inside active overlay');
      return;
    }

    const t = e.touches[0];
    if (!t) {
      warn('input', 'No touch object found');
      return;
    }

    const rect = canvasEl.getBoundingClientRect();
    touchX = t.clientX - rect.left;
    touchY = t.clientY - rect.top;
    touchActive = true;

    debug('input', 'TOUCH START', {
      touchX,
      touchY,
      state: gameState.value
    });
  }

  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;
    const rect = canvasEl.getBoundingClientRect();
    touchX = t.clientX - rect.left;
    touchY = t.clientY - rect.top;
    // debug('input', 'TOUCH MOVE', { touchX, touchY });
  }, { passive: false });

  document.addEventListener('touchend', () => {
    // debug('input', 'TOUCH END');
    if (!touchActive) return;

    touchActive = false;

    if (gameState.value === 'PLAYING') {
      debug('input', 'Switching state to PAUSED');
      gameState.value = 'PAUSED';
      showOverlay('PAUSED');
      soundManager.muteAll();
      stopGameLoop();
    }
  }, { passive: false });
}

function updatePlayerToTouch() {
  const { width, height } = getPlayerDimensions(); // Get dimensions
  setPlayerPosition(
    touchX - width / 2,
    touchY - height / 2
  );
  // player.dx and player.dy no longer needed here as setPlayerPosition handles position directly
}
