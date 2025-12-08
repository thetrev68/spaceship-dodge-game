/**
 * @module game/gameStateManager
 * Game state management.
 */

import { entityState, gameState, playerLives, score, gameLevel, playerState } from '@core/state.js';
import { resetLevelFlow } from '@game/flowManager.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import { resetPlayer } from '@entities/player.js';
import { clearAllBullets } from '@entities/bullet.js';
import { services } from '@services/ServiceProvider.js';
import { eventBus } from '@core/events/EventBus.js';
import { GameEvent, type PlayerDiedEvent } from '@core/events/GameEvents.js';
import { analytics } from '@utils/analytics.js';
import { announcer } from '@ui/accessibility/announcer.js';
import { gameMetrics } from '@utils/gameMetrics.js';

const powerUps = playerState.powerUps;

export function handlePlayerHit(): void {
  playerLives.value -= 1;
  services.audioService.playSound('player_hit');
  analytics.trackGameplay('player-hit', undefined, playerLives.value);
  gameMetrics.recordHit();

  const livesRemaining = playerLives.value;
  announcer.announceUrgent(
    `Player hit! ${livesRemaining} ${livesRemaining === 1 ? 'life' : 'lives'} remaining.`
  );

  if (playerLives.value <= 0) {
    gameState.value = 'GAME_OVER';
    services.audioService.playSound('gameover');
    services.audioService.stopMusic();
    showOverlay('GAME_OVER', score.value, gameLevel.value);
    analytics.trackGameplay('game-over', `level-${gameLevel.value}`, score.value);
    gameMetrics.endSession(score.value, gameLevel.value);
    announcer.announceUrgent(`Game over! Final score: ${score.value}, Level: ${gameLevel.value}`);
    eventBus.emit<PlayerDiedEvent>(GameEvent.GAME_OVER, {
      finalScore: score.value,
      level: gameLevel.value,
    });
  } else {
    gameState.value = 'DEATH';
    resetForNextLevel();
    showOverlay('DEATH', score.value, gameLevel.value);
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

  services.audioService.unmuteAll();
  services.audioService.startMusic();

  const canvasContext = canvas.getContext('2d');
  if (canvasContext) {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }

  gameMetrics.startSession();
  analytics.trackGameplay('game-started', `level-${gameLevel.value}`);
  announcer.announce('Game started. Use arrow keys or WASD to move, spacebar to fire.');
  eventBus.emit(GameEvent.GAME_STARTED, undefined);
}

export function continueGame(): void {
  gameState.value = 'PLAYING';
  resetLevelFlow();
  showOverlay('PLAYING');
  services.audioService.startMusic();
  eventBus.emit(GameEvent.GAME_RESUMED, undefined);
}
