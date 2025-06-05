/*
    flowManager.js
    Created: 2025-06-01
    Author: ChatGPT + Trevor Clark

    Updates:
        Level progression based on asteroidsSpawned count.
        Maintains max wait time and spawn gating.
        Added debug logs to troubleshoot level progression.
*/

import { gameLevel, gameState, levelStartTime, bullets, obstacles } from './state.js';
import { asteroidsSpawned } from './asteroid.js';

let allowSpawning = true;
let pendingLevelUp = false;
let levelClearTime = null;

const MAX_WAIT = 5000; // 5 seconds max wait before forcing level-up
const ASTEROIDS_PER_LEVEL = 50; // threshold per level

export function resetLevelFlow() {
    allowSpawning = true;
    pendingLevelUp = false;
    levelClearTime = null;
    levelStartTime.value = Date.now();
    console.log('[FlowManager] Level flow reset');
}

export function updateLevelFlow(onLevelUpCallback) {
    const now = Date.now();
    const elapsed = (now - levelStartTime.value) / 1000;

    console.log('[FlowManager] elapsed:', elapsed.toFixed(2), 'allowSpawning:', allowSpawning);
    console.log('[FlowManager] asteroidsSpawned:', asteroidsSpawned);
    console.log('[FlowManager] gameLevel:', gameLevel.value);
    console.log('[FlowManager] obstacles:', obstacles.length);
    console.log('[FlowManager] pendingLevelUp:', pendingLevelUp);

    if (elapsed >= 15) {
        allowSpawning = false;
        console.log('[FlowManager] Stopped spawning due to elapsed time');
    }

    if (asteroidsSpawned >= (gameLevel.value + 1) * ASTEROIDS_PER_LEVEL) {
        allowSpawning = false;
        console.log('[FlowManager] Stopped spawning due to asteroids spawned threshold');
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
        allowSpawning = true;
        pendingLevelUp = false;
        levelClearTime = null;

        import('./soundManager.js').then(m => m.playSound('levelup'));
        import('./soundManager.js').then(m => m.stopMusic());

        // Reset spawn count for next level
        asteroidsSpawned = 0;

        onLevelUpCallback();
    }
}

export function canSpawnAsteroids() {
    return allowSpawning;
}