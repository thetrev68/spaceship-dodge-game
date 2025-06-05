/*
    mobileControls.js
    Created: 2025-06-04
    Author: ChatGPT + Trevor Clark

    Updates:
        Updated firing loop to use power-up aware firePlayerBullets.
        Fixed firing queue with proper loop management.
        Maintains pause toggle lock and pause button visibility.
*/

import { gameState, player } from './state.js';
import { firePlayerBullets } from './player.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { restartGameLoop } from './loop.js';

const mobilePauseBtn = document.getElementById('mobilePauseBtn');
let mobileTouching = false;
let firing = false;
let fireTimeoutId = null;
let pauseLocked = false;

export function setupMobileInput(canvas) {
  let lastTouchFire = 0;
  const fireCooldown = 200; // ms between shots

  function touchFireLoop() {
    const now = Date.now();
    if (gameState.value === 'PLAYING' && mobileTouching && now - lastTouchFire > fireCooldown) {
      firePlayerBullets();
      lastTouchFire = now;
    }
    requestAnimationFrame(touchFireLoop);
  }
  requestAnimationFrame(touchFireLoop);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mobileTouching = true;
    handleTouch(e);
  }, { passive: false });

  canvas.addEventListener('touchmove', handleTouch, { passive: false });

  canvas.addEventListener('touchend', () => {
    mobileTouching = false;
    stopFiring();
  }, { passive: false });

  canvas.addEventListener('touchcancel', () => {
    mobileTouching = false;
    stopFiring();
  }, { passive: false });

  document.addEventListener('touchend', () => {
    mobileTouching = false;
    stopFiring();
  });
  document.addEventListener('touchcancel', () => {
    mobileTouching = false;
    stopFiring();
  });

  // Pause button logic
  function updatePauseButtonVisibility() {
    const playing = gameState.value === 'PLAYING';
    const overlaysVisible = document.querySelectorAll('.game-overlay:not(.hidden)').length > 0;
    if (playing && !overlaysVisible) {
      mobilePauseBtn.classList.remove('hidden');
    } else {
      mobilePauseBtn.classList.add('hidden');
    }
  }

  mobilePauseBtn.addEventListener('click', () => {
    if (pauseLocked) return;
    pauseLocked = true;
    if (gameState.value === 'PLAYING') {
      gameState.value = 'PAUSED';
      showOverlay('PAUSED');
      soundManager.muteAll();
      stopFiring();
    } else if (gameState.value === 'PAUSED') {
      gameState.value = 'PLAYING';
      showOverlay('PLAYING');
      soundManager.unmuteAll();
      restartGameLoop();
    }
    updatePauseButtonVisibility();
    setTimeout(() => pauseLocked = false, 300);
  });

  document.addEventListener('gameStateChange', updatePauseButtonVisibility);
  document.addEventListener('DOMContentLoaded', updatePauseButtonVisibility);
}

function handleTouch(e) {
  if (gameState.value !== 'PLAYING') return;
  const rect = e.target.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  player.x = x - player.width / 2;
  player.y = y - player.height / 2;
}

function stopFiring() {
  firing = false;
  if (fireTimeoutId) {
    clearTimeout(fireTimeoutId);
    fireTimeoutId = null;
  }
}