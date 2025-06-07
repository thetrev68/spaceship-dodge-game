import { gameState, player } from './state.js';
import { firePlayerBullets } from './player.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { restartGameLoop, stopGameLoop } from './gameLoop.js';

let touchActive = false;
let touchX = 0;
let touchY = 0;
let canvasEl = null;
let lastFireTime = 0;
const fireCooldown = 250; // ms, increased for balance

export function setupMobileInput(canvas) {
  canvasEl = canvas;

  console.log('[DEBUG] setupMobileInput called', { canvasId: canvas.id });

  // Log game state every second
  setInterval(() => {
    console.log('[DEBUG] gameState:', gameState.value);
  }, 1000);

  // Main mobile control loop
  function mobileLoop() {
    if (touchActive && gameState.value === 'PLAYING') {
      updatePlayerToTouch();
      const now = performance.now();
      if (now - lastFireTime >= fireCooldown) {
        firePlayerBullets();
        lastFireTime = now;
      }
    }

    requestAnimationFrame(mobileLoop);
  }

  requestAnimationFrame(mobileLoop);

  // Touch start: Handle gameplay movement and firing
  function handleTouchStart(e) {
    e.preventDefault();
    console.log('[DEBUG] handleTouchStart triggered', { targetId: e.target.id, touches: e.touches.length });
    // Skip if target is an overlay or button
    if (e.target.closest('.game-overlay') || e.target.tagName === 'BUTTON') return;

    const t = e.touches[0];
    if (!t) return;

    const rect = canvasEl.getBoundingClientRect();
    touchX = t.clientX - rect.left;
    touchY = t.clientY - rect.top;
    touchActive = true;

    console.log('[DEBUG] TOUCH START', { touchX, touchY, state: gameState.value });
  }

  // Canvas listeners
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;

    const rect = canvasEl.getBoundingClientRect();
    touchX = t.clientX - rect.left;
    touchY = t.clientY - rect.top;
    console.log('[DEBUG] TOUCH MOVE', { touchX, touchY });
  }, { passive: false });

  // Document fallbacks with debug
  document.addEventListener('touchstart', (e) => {
    console.log('[DEBUG] Document touchstart raw', { target: e.target.id || e.target.tagName });
    const t = e.touches[0];
    if (!t) return;
    const rect = canvasEl.getBoundingClientRect();
    const x = t.clientX;
    const y = t.clientY;
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      console.log('[DEBUG] Document touchstart fallback triggered', { x, y });
      handleTouchStart(e);
    }
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    console.log('[DEBUG] Document touchmove raw', { target: e.target.id || e.target.tagName });
    const t = e.touches[0];
    if (!t) return;
    const rect = canvasEl.getBoundingClientRect();
    const x = t.clientX;
    const y = t.clientY;
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      touchX = t.clientX - rect.left;
      touchY = t.clientY - rect.top;
      console.log('[DEBUG] Document touchmove fallback', { touchX, touchY });
    }
  }, { passive: false });

  // Touch end: Pause game if playing
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
  // Reset dx, dy to prevent updatePlayer() interference
  player.dx = 0;
  player.dy = 0;
  console.log('[DEBUG] Player updated to', { x: player.x, y: player.y });
}