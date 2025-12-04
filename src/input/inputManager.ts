/**
 * @module input/inputManager
 * Input management for keyboard and mouse.
 */

import { gameState } from '@core/state.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import { restartGameLoop } from '@game/gameLoop.js';
import {
  firePlayerBullets,
  getPlayerSpeed,
  setPlayerMovement,
  setPlayerPosition,
  getPlayerDimensions,
  getPlayerVelocity,
} from '@entities/player.js';
import { togglePerfHud } from '@ui/hud/perfHUD.js';
import type { EventKey } from '@utils/dom.js';
import { services } from '@services/ServiceProvider.js';
import { eventBus } from '@core/events/EventBus.js';
import { GameEvent } from '@core/events/GameEvents.js';

let firing = false;
let fireTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pauseLocked = false;
let lastFireTime = 0;

const FIRE_COOLDOWN_MS = 150;

export function setupInput(canvas: HTMLCanvasElement): void {
  const handlePauseToggle = (): void => {
    if (pauseLocked) return;
    if (gameState.value !== 'PLAYING' && gameState.value !== 'PAUSED') {
      pauseLocked = false;
      return;
    }
    pauseLocked = true;
    const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
    gameState.value = nextState;
    showOverlay(nextState);

    if (nextState === 'PAUSED') {
      services.audioService.muteAll();
      stopFiring();
      eventBus.emit(GameEvent.GAME_PAUSED, undefined);
    } else if (nextState === 'PLAYING') {
      services.audioService.unmuteAll();
      restartGameLoop();
      eventBus.emit(GameEvent.GAME_RESUMED, undefined);
    }
    setTimeout(() => {
      pauseLocked = false;
    }, 300);
  };

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key as EventKey;
    if (key && key.toLowerCase() === 'f') {
      togglePerfHud();
      return;
    }

    if ((key === 'p' || key === 'P') && !pauseLocked) {
      handlePauseToggle();
      return;
    }

    if (gameState.value !== 'PLAYING') return;

    switch (key) {
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
      case ' ': {
        const now = Date.now();
        if (now - lastFireTime > FIRE_COOLDOWN_MS) {
          firePlayerBullets();
          lastFireTime = now;
        }
        break;
      }
      default:
        break;
    }
  });

  document.addEventListener('keyup', (event: KeyboardEvent) => {
    if (gameState.value !== 'PLAYING') return;
    const key = event.key as EventKey;

    switch (key) {
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
      default:
        break;
    }
  });

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (gameState.value !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const { width, height } = getPlayerDimensions();
    setPlayerPosition(mouseX - width / 2, mouseY - height / 2);
  });

  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    if (gameState.value !== 'PLAYING' || event.button !== 0) return;
    if (firing) return;
    firing = true;

    const fireLoop = (): void => {
      if (!firing || gameState.value !== 'PLAYING') return;
      const now = Date.now();
      if (now - lastFireTime > FIRE_COOLDOWN_MS) {
        firePlayerBullets();
        lastFireTime = now;
      }
      fireTimeoutId = setTimeout(fireLoop, 100);
    };

    fireLoop();
  });

  canvas.addEventListener('mouseup', (event: MouseEvent) => {
    if (event.button === 0) stopFiring();
  });

  canvas.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    if (pauseLocked) return;
    if (gameState.value === 'PLAYING' || gameState.value === 'PAUSED') {
      handlePauseToggle();
    }
  });
}

function stopFiring(): void {
  firing = false;
  if (fireTimeoutId) {
    clearTimeout(fireTimeoutId);
    fireTimeoutId = null;
  }
}
