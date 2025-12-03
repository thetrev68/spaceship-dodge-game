/**
 * @fileoverview Game state management.
 */

import { entityState, gameState, playerLives, score, gameLevel, playerState } from '@core/state.js';
import { resetLevelFlow } from '@game/flowManager.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import { createAudioControls } from '@ui/controls/audioControls.js';
import { resetPlayer } from '@entities/player.js';
import { clearAllBullets } from '@entities/bullet.js';
import { services } from '@services/ServiceProvider.js';
import { eventBus } from '@core/events/EventBus.js';
import { GameEvent, type PlayerDiedEvent } from '@core/events/GameEvents.js';

const powerUps = playerState.powerUps;

export function handlePlayerHit(): void {
  playerLives.value -= 1;
  services.audioService.playSound('gameover');

  if (playerLives.value <= 0) {
    gameState.value = 'GAME_OVER';
    services.audioService.stopMusic();
    showOverlay('GAME_OVER', score.value, gameLevel.value);
    eventBus.emit<PlayerDiedEvent>(GameEvent.GAME_OVER, {
      finalScore: score.value,
      level: gameLevel.value,
    });
  } else {
    gameState.value = 'LEVEL_TRANSITION';
    resetForNextLevel();
    showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
  }
}

function resetForNextLevel(): void {
  resetPlayer(window.innerWidth, window.innerHeight);
  clearAllBullets();
  entityState.clearObstacles();
  resetLevelFlow();
  services.audioService.stopMusic();
}

export function startGame(canvas: HTMLCanvasElement): void {
  gameState.value = 'PLAYING';
  score.value = 0;
  gameLevel.value = 0;
  playerLives.value = 3;

  powerUps.shield.active = false;
  powerUps.shield.timer = 0;
  powerUps.doubleBlaster.active = false;
  powerUps.doubleBlaster.timer = 0;

  clearAllBullets();
  entityState.clearObstacles();

  resetPlayer(canvas.width, canvas.height);
  resetLevelFlow();
  showOverlay('PLAYING');

  createAudioControls();

  services.audioService.unmuteAll();
  services.audioService.startMusic();

  const canvasContext = canvas.getContext('2d');
  if (canvasContext) {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }

  eventBus.emit(GameEvent.GAME_STARTED, undefined);
}

export function continueGame(): void {
  gameState.value = 'PLAYING';
  resetLevelFlow();
  showOverlay('PLAYING');
  services.audioService.startMusic();
  eventBus.emit(GameEvent.GAME_RESUMED, undefined);
}
