/*
    mobileControls.js
    Created: 2025-06-04
    Author: ChatGPT + Trevor Clark

    Updates:
        Added pause toggle lock to prevent flickering on mobile.
        Handles touch input and floating pause button.
*/

import { gameState, player } from './state.js';
import { fireBullet } from './bullet.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { restartGameLoop } from './loop.js';

const mobilePauseBtn = document.getElementById('mobilePauseBtn');
let mobileTouching = false;
let firing = false;
let pauseLocked = false;

export function setupMobileInput(canvas) {
  let lastTouchFire = 0;
  const fireCooldown = 200; // Adjust as needed

  function touchFireLoop() {
    const now = Date.now();
    if (gameState.value === 'PLAYING' && mobileTouching && now - lastTouchFire > fireCooldown) {
      fireBullet();
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
  }, { passive: false });

  canvas.addEventListener('touchcancel', () => {
    mobileTouching = false;
  }, { passive: false });

  document.addEventListener('touchend', () => { mobileTouching = false; });
  document.addEventListener('touchcancel', () => { mobileTouching = false; });

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
      firing = false;
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