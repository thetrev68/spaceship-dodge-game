/*
    flowManager.js
    Created: 2025-06-01
    Author: ChatGPT + Trevor Clark

    Updates:
        Level progression based on newAsteroidsSpawned count.
        Maintains max wait time and spawn gating.
        Added debug logs to troubleshoot level progression.
*/

import { allowSpawning, gameLevel, gameState, levelStartTime, bullets, obstacles } from './state.js';
import { newAsteroidsSpawned } from './asteroid.js';

let pendingLevelUp = false;
let levelClearTime = null;

const MAX_WAIT = 5000; // 5 seconds max wait before forcing level-up
const ASTEROIDS_PER_LEVEL = 20; // threshold per level

export function resetLevelFlow() {
    allowSpawning.value = true;
    pendingLevelUp = false;
    levelClearTime = null;
    levelStartTime.value = Date.now();
    console.log('[FlowManager] Level flow reset');
}

export function updateLevelFlow(onLevelUpCallback) {
    const now = Date.now();
    const elapsed = (now - levelStartTime.value) / 1000;

    console.log('[FlowManager] elapsed:', elapsed.toFixed(2), 'allowSpawning:', allowSpawning);
    console.log('[FlowManager] newAsteroidsSpawned:', newAsteroidsSpawned);
    console.log('[FlowManager] gameLevel:', gameLevel.value);
    console.log('[FlowManager] obstacles:', obstacles.length);
    console.log('[FlowManager] pendingLevelUp:', pendingLevelUp);

    if (newAsteroidsSpawned >= (gameLevel.value + 1) * ASTEROIDS_PER_LEVEL) {
        allowSpawning.value = false;
    }

    if (elapsed >= 15) allowSpawning.value = false;

    if (newAsteroidsSpawned >= (gameLevel.value + 1) * ASTEROIDS_PER_LEVEL) {
      allowSpawning.value = false;
    }

    if (!allowSpawning && !pendingLevelUp && obstacles.length === 0) {
        pendingLevelUp = true;
        levelClearTime = now;
        console.log('[FlowManager] Pending level up started');
    }

    if (pendingLevelUp && levelClearTime &&
        (now - levelClearTime >= 1500 || now - levelStartTime.value >= MAX_WAIT)) {
        console.log('[FlowManager] Level up triggered');
        gameLevel.value++;
        gameState.value = 'LEVEL_TRANSITION';
        bullets.length = 0;
        allowSpawning.value = true;
        pendingLevelUp = false;
        levelClearTime = null;

        import('./soundManager.js').then(m => m.playSound('levelup'));
        import('./soundManager.js').then(m => m.stopMusic());

        newAsteroidsSpawned = 0;

        onLevelUpCallback();
    }
}

export function canSpawnAsteroids() {
    return allowSpawning;
}