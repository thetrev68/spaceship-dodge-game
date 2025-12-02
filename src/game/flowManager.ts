/**
 * @fileoverview Manages game level progression and flow.
 */

import { allowSpawning, gameLevel, gameState, levelStartTime, obstacles } from '@core/state.js';
import { newAsteroidsSpawned } from '@entities/asteroid.js';
import { playSound, stopMusic } from '@systems/soundManager.js';
import { debug } from '@core/logger.js';
import { clearAllBullets } from '@entities/bullet.js';

let pendingLevelUp = false;
let levelClearTime: number | null = null;

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

      playSound('levelup');
      stopMusic();

      onLevelUpCallback();

      debug('level', 'Level up triggered!');
    }
  }
}
