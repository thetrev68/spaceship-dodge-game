/**
 * @fileoverview Mobile touch input controls.
 */

import { gameState } from '@core/state.js';
import { setPlayerPosition, firePlayerBullets, getPlayerDimensions } from '@entities/player.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import * as soundManager from '@systems/soundManager.js';
import { stopGameLoop } from '@game/gameLoop.js';
import { debug, warn } from '@core/logger.js';

/**
 * Flag for active touch.
 * @type {boolean}
 */
let touchActive = false;

/**
 * Current touch X position.
 * @type {number}
 */
let touchX = 0;

/**
 * Current touch Y position.
 * @type {number}
 */
let touchY = 0;

/**
 * Canvas element reference.
 * @type {HTMLCanvasElement|null}
 */
let canvasEl = null;

/**
 * Last fire time for cooldown.
 * @type {number}
 */
let lastFireTime = 0;

/**
 * Fire cooldown in milliseconds.
 * @const {number}
 */
const fireCooldown = 250;
let fireIntervalId = null;

function startFiringLoop() {
  if (fireIntervalId || gameState.value !== 'PLAYING') return;
  fireIntervalId = setInterval(() => {
    if (!touchActive || gameState.value !== 'PLAYING') return;
    const now = performance.now();
    if (now - lastFireTime >= fireCooldown) {
      firePlayerBullets();
      lastFireTime = now;
    }
  }, fireCooldown);
}

function stopFiringLoop() {
  if (fireIntervalId) {
    clearInterval(fireIntervalId);
    fireIntervalId = null;
  }
}

/**
 * Sets up mobile touch input for the canvas.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 */
export function setupMobileInput(canvas) {
  canvasEl = canvas;
  debug('input', 'setupMobileInput called', { canvasId: canvas.id });

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
    updatePlayerToTouch();
    startFiringLoop();

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
    updatePlayerToTouch();
    // debug('input', 'TOUCH MOVE', { touchX, touchY });
  }, { passive: false });

  document.addEventListener('touchend', () => {
    // debug('input', 'TOUCH END');
    if (!touchActive) return;

    touchActive = false;
    stopFiringLoop();

    if (gameState.value === 'PLAYING') {
      debug('input', 'Switching state to PAUSED');
      gameState.value = 'PAUSED';
      showOverlay('PAUSED');
      soundManager.muteAll();
      stopGameLoop();
    }
  }, { passive: false });

  document.addEventListener('gameStateChange', () => {
    if (gameState.value !== 'PLAYING') {
      stopFiringLoop();
    }
  });
}

/**
 * Updates player position to current touch position.
 */
function updatePlayerToTouch() {
  const { width, height } = getPlayerDimensions();
  setPlayerPosition(
    touchX - width / 2,
    touchY - height / 2
  );
}
