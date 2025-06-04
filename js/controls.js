/*
    controls.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Removed mobile touch input (moved to mobileControls.js).
        Handles desktop keyboard and mouse controls only.
*/

import { fireBullet } from './bullet.js';
import { gameState, player } from './state.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { restartGameLoop } from './loop.js';

let firing = false;

export function setupInput(canvas) {
  // Keyboard input
  document.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
      if (gameState.value !== 'PLAYING' && gameState.value !== 'PAUSED') return;
      const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
      gameState.value = nextState;
      showOverlay(nextState);

      if (nextState === 'PAUSED') {
        soundManager.muteAll();
        firing = false;
      } else if (nextState === 'PLAYING') {
        soundManager.unmuteAll();
        restartGameLoop();
      }
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
        fireBullet();
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

  // Mouse input
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
    firing = true;
    const fire = () => {
      if (!firing || gameState.value !== 'PLAYING') return;
      fireBullet();
      setTimeout(fire, 100);
    };
    fire();
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) firing = false;
  });

  // Right-click pause toggle
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (gameState.value === 'PLAYING' || gameState.value === 'PAUSED') {
      const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
      gameState.value = nextState;
      showOverlay(nextState);

      if (nextState === 'PAUSED') {
        soundManager.muteAll();
        firing = false;
      } else if (nextState === 'PLAYING') {
        soundManager.unmuteAll();
        restartGameLoop();
      }
    }
  });
}
