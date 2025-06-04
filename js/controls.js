/*
    controls.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Added pause toggle lock to prevent flickering.
        Mute/unmute tied to pause state.
*/

import { fireBullet } from './bullet.js';
import { gameState, player } from './state.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { restartGameLoop } from './loop.js';

let firing = false;
let mobileTouching = false;
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

let pauseLocked = false;

export function setupInput(canvas) {
  if (isMobile) {
    let lastTouchFire = 0;
    let fireCooldown = 200; // faster fire rate on mobile
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
    });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', () => { mobileTouching = false; }, { passive: false });
    canvas.addEventListener('touchcancel', () => { mobileTouching = false; }, { passive: false });
    document.addEventListener('touchend', () => { mobileTouching = false; });
    document.addEventListener('touchcancel', () => { mobileTouching = false; });
  } else {
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
          firing = false;
        } else if (nextState === 'PLAYING') {
          soundManager.unmuteAll();
          restartGameLoop();
        }

        setTimeout(() => pauseLocked = false, 300); // debounce toggle
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

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (gameState.value === 'PLAYING' || gameState.value === 'PAUSED') {
        if (pauseLocked) return;
        pauseLocked = true;
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

        setTimeout(() => pauseLocked = false, 300);
      }
    });
  }
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