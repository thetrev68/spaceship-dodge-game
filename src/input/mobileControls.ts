/**
 * @fileoverview Mobile touch input controls.
 */

import { gameState } from '@core/state.js';
import { setPlayerPosition, firePlayerBullets, getPlayerDimensions } from '@entities/player.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import { stopGameLoop } from '@game/gameLoop.js';
import { debug, warn } from '@core/logger.js';
import { services } from '@services/ServiceProvider.js';
import { eventBus } from '@core/events/EventBus.js';
import { GameEvent } from '@core/events/GameEvents.js';

let touchActive = false;
let touchX = 0;
let touchY = 0;
let canvasEl: HTMLCanvasElement | null = null;
let lastFireTime = 0;

const fireCooldown = 250;
let fireIntervalId: ReturnType<typeof setInterval> | null = null;

function startFiringLoop(): void {
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

function stopFiringLoop(): void {
  if (fireIntervalId) {
    clearInterval(fireIntervalId);
    fireIntervalId = null;
  }
}

export function setupMobileInput(canvas: HTMLCanvasElement): void {
  canvasEl = canvas;
  debug('input', 'setupMobileInput called', { canvasId: canvas.id });

  const handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();

    const activeOverlay = document.querySelector('.game-overlay.visible');
    const target = event.target;
    if (activeOverlay && target instanceof Node && activeOverlay.contains(target)) {
      debug('input', 'Touch blocked - inside active overlay');
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      warn('input', 'No touch object found');
      return;
    }

    if (!canvasEl) return;

    const rect = canvasEl.getBoundingClientRect();
    touchX = touch.clientX - rect.left;
    touchY = touch.clientY - rect.top;
    touchActive = true;
    updatePlayerToTouch();
    startFiringLoop();

    debug('input', 'TOUCH START', {
      touchX,
      touchY,
      state: gameState.value,
    });
  };

  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

  canvas.addEventListener('touchmove', (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (!touch || !canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    touchX = touch.clientX - rect.left;
    touchY = touch.clientY - rect.top;
    updatePlayerToTouch();
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!touchActive) return;

    touchActive = false;
    stopFiringLoop();

    if (gameState.value === 'PLAYING') {
      debug('input', 'Switching state to PAUSED');
      gameState.value = 'PAUSED';
      showOverlay('PAUSED');
      services.audioService.muteAll();
      stopGameLoop();
      eventBus.emit(GameEvent.GAME_PAUSED, undefined);
    }
  }, { passive: false });

  document.addEventListener('gameStateChange', () => {
    if (gameState.value !== 'PLAYING') {
      stopFiringLoop();
    }
  });
}

function updatePlayerToTouch(): void {
  const { width, height } = getPlayerDimensions();
  setPlayerPosition(
    touchX - width / 2,
    touchY - height / 2,
  );
}
