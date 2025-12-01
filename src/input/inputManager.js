/**
 * @fileoverview Input management for keyboard and mouse.
 * Sets up keyboard and mouse/touch input handlers.
 * Calls player movement and firing functions.
 */

import { gameState } from '@core/state.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import * as soundManager from '@systems/soundManager.js';
import { restartGameLoop } from '@game/gameLoop.js';
import { firePlayerBullets, getPlayerSpeed, setPlayerMovement, setPlayerPosition, getPlayerDimensions, getPlayerVelocity } from '@entities/player.js';
import { togglePerfHud } from '@ui/hud/perfHUD.js';

/**
 * Flag for continuous firing.
 * @type {boolean}
 */
let firing = false;

/**
 * Timeout ID for firing loop.
 * @type {ReturnType<typeof setTimeout>|null}
 */
let fireTimeoutId = null;

/**
 * Flag to prevent rapid pause toggling.
 * @type {boolean}
 */
let pauseLocked = false;

/**
 * Last fire time for cooldown.
 * @type {number}
 */
let lastFireTime = 0;

/**
 * Fire cooldown in milliseconds.
 * @const {number}
 */
const FIRE_COOLDOWN_MS = 150;

/**
 * Sets up input handlers for the canvas.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 */
export function setupInput(canvas) {
  document.addEventListener('keydown', (e) => {
    if (e.key && e.key.toLowerCase() === 'f') {
      togglePerfHud();
      return;
    }

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
        restartGameLoop();
      }
      setTimeout(() => pauseLocked = false, 300);
      return;
    }
    if (gameState.value !== 'PLAYING') return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        setPlayerMovement(getPlayerVelocity().dx, -getPlayerSpeed());
        break;
      case 'ArrowDown':
      case 's':
        setPlayerMovement(getPlayerVelocity().dx, getPlayerSpeed());
        break;
      case 'ArrowLeft':
      case 'a':
        setPlayerMovement(-getPlayerSpeed(), getPlayerVelocity().dy);
        break;
      case 'ArrowRight':
      case 'd':
        setPlayerMovement(getPlayerSpeed(), getPlayerVelocity().dy);
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
        setPlayerMovement(getPlayerVelocity().dx, 0);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'ArrowRight':
      case 'd':
        setPlayerMovement(0, getPlayerVelocity().dy);
        break;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (gameState.value !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { width, height } = getPlayerDimensions();
    setPlayerPosition(mouseX - width / 2, mouseY - height / 2);
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
        restartGameLoop();
      }
      setTimeout(() => pauseLocked = false, 300);
    }
  });
}

/**
 * Stops continuous firing.
 */
function stopFiring() {
  firing = false;
  if (fireTimeoutId) {
    clearTimeout(fireTimeoutId);
    fireTimeoutId = null;
  }
}
