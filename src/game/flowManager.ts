/**
 * @module game/flowManager
 * Manages game level progression and flow.
 */

import { allowSpawning, entityState, gameLevel, gameState, levelStartTime } from '@core/state.js';
import { newAsteroidsSpawned } from '@entities/asteroid.js';
import { debug } from '@core/logger.js';
import { clearAllBullets } from '@entities/bullet.js';
import { services } from '@services/ServiceProvider.js';
import { eventBus } from '@core/events/EventBus.js';
import { GameEvent, type LevelUpEvent } from '@core/events/GameEvents.js';

let pendingLevelUp = false;
let levelClearTime: number | null = null;
const obstacles = entityState.getMutableObstacles();

const MAX_WAIT = 5000;
const ASTEROIDS_PER_LEVEL = 20;

export function resetLevelFlow(): void {
  allowSpawning.value = true;
  pendingLevelUp = false;
  levelClearTime = null;
  levelStartTime.value = Date.now();
  debug('level', 'Level flow reset');
}

export function updateLevelFlow(onLevelUpCallback: () => void): void {
  const now = Date.now();

  if (newAsteroidsSpawned >= (gameLevel.value + 1) * ASTEROIDS_PER_LEVEL) {
    allowSpawning.value = false;
    debug('level', 'Stopping spawning: asteroid count limit reached');
  }

  if (!allowSpawning.value && !pendingLevelUp && obstacles.length === 0) {
    pendingLevelUp = true;
    levelClearTime = now;
    debug('level', 'Screen clear, pending level up started');
  }

  if (pendingLevelUp && levelClearTime) {
    const timeSinceClear = now - levelClearTime;
    const timeSinceLevelStart = now - levelStartTime.value;

    if (timeSinceClear >= 1500 || timeSinceLevelStart >= MAX_WAIT) {
      gameLevel.value += 1;
      gameState.value = 'LEVEL_TRANSITION';
      clearAllBullets();
      allowSpawning.value = true;
      pendingLevelUp = false;
      levelClearTime = null;

      services.audioService.playSound('levelup');
      services.audioService.stopMusic();

      eventBus.emit(GameEvent.LEVEL_TRANSITION_START, undefined);
      eventBus.emit<LevelUpEvent>(GameEvent.LEVEL_UP, {
        newLevel: gameLevel.value,
        difficulty: gameLevel.value,
      });

      onLevelUpCallback();

      debug('level', 'Level up triggered!');
    }
  }
}
