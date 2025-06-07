/*
    controls.js
    Updated to use firePlayerBullets for power-ups and maintain existing features.
*/

import { gameState, player } from './state.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { restartGameLoop } from './gameLoop.js';
import { firePlayerBullets } from './player.js';

let firing = false;
let fireTimeoutId = null;
let pauseLocked = false;
let lastFireTime = 0;
const FIRE_COOLDOWN_MS = 75;

export function setupInput(canvas) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'p' && !pauseLocked) {
      pauseLocked = true;
      if (gameState.value !== 'PLAYING' && gameState.value !== 'PAUSED') {
        pauseLocked = false;
        return;
      }
      const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
      gameState.value = nextState;
      showOverlay(nextState);

      if (nextState === 'PAUSED') {
        soundManager.muteAll();
        stopFiring();
      } else if (nextState === 'PLAYING') {
        soundManager.unmuteAll();
        soundManager.startMusic(); // ✅ resume music
        restartGameLoop();
      }
      setTimeout(() => pauseLocked = false, 300);
      return;
    }
    if (gameState.value !== 'PLAYING') return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        player.dy = -player.speed;
        break;
      case 'ArrowDown':
      case 's':
        player.dy = player.speed;
        break;
      case 'ArrowLeft':
      case 'a':
        player.dx = -player.speed;
        break;
      case 'ArrowRight':
      case 'd':
        player.dx = player.speed;
        break;
      case ' ':
        const now = Date.now();
        if (now - lastFireTime > FIRE_COOLDOWN_MS) {
          firePlayerBullets();
          lastFireTime = now;
        }
        break;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (gameState.value !== 'PLAYING') return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'ArrowDown':
      case 's':
        player.dy = 0;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'ArrowRight':
      case 'd':
        player.dx = 0;
        break;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (gameState.value !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.x = mouseX - player.width / 2;
    player.y = mouseY - player.height / 2;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (gameState.value !== 'PLAYING' || e.button !== 0) return;
    if (firing) return;
    firing = true;

    function fireLoop() {
      if (!firing || gameState.value !== 'PLAYING') return;
      const now = Date.now();
      if (now - lastFireTime > FIRE_COOLDOWN_MS) {
        firePlayerBullets();
        lastFireTime = now;
      }
      fireTimeoutId = setTimeout(fireLoop, 100);
    }

    fireLoop();
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) stopFiring();
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (pauseLocked) return;
    if (gameState.value === 'PLAYING' || gameState.value === 'PAUSED') {
      pauseLocked = true;
      const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
      gameState.value = nextState;
      showOverlay(nextState);

      if (nextState === 'PAUSED') {
        soundManager.muteAll();
        stopFiring();
      } else if (nextState === 'PLAYING') {
        soundManager.unmuteAll();
        soundManager.startMusic(); // ✅ resume music
        restartGameLoop();
      }
      setTimeout(() => pauseLocked = false, 300);
    }
  });
}

function stopFiring() {
  firing = false;
  if (fireTimeoutId) {
    clearTimeout(fireTimeoutId);
    fireTimeoutId = null;
  }
}