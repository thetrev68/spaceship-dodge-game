/*
    flowManager.js
    Created: 2025-06-01
    Author: ChatGPT + Trevor Clark

    Updates:
        Added max wait time to avoid infinite level-up delay.
        Maintains smooth level flow with spawn gating.
*/

import { gameLevel, gameState, levelStartTime, bullets, obstacles } from './state.js';

let allowSpawning = true;
let pendingLevelUp = false;
let levelClearTime = null;

const MAX_WAIT = 5000; // Max wait 5 seconds before forcing level-up

export function resetLevelFlow() {
    allowSpawning = true;
    pendingLevelUp = false;
    levelClearTime = null;
    levelStartTime.value = Date.now();
}

export function updateLevelFlow(onLevelUpCallback) {
    const now = Date.now();
    const elapsed = (now - levelStartTime.value) / 1000;

    if (elapsed >= 15) allowSpawning = false;

    if (!allowSpawning && !pendingLevelUp && obstacles.length === 0) {
        pendingLevelUp = true;
        levelClearTime = now;
    }

    if (pendingLevelUp && levelClearTime && 
        (now - levelClearTime >= 1500 || now - levelStartTime.value >= MAX_WAIT)) {
        gameLevel.value++;
        gameState.value = 'LEVEL_TRANSITION';
        bullets.length = 0;
        allowSpawning = true;
        pendingLevelUp = false;
        levelClearTime = null;

        import('./soundManager.js').then(m => m.playSound('levelup'));
        import('./soundManager.js').then(m => m.stopMusic());

        onLevelUpCallback();
    }
}

export function canSpawnAsteroids() {
    return allowSpawning;
}