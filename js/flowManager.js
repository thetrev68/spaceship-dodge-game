/*
    flowManager.js
    Created: 2025-06-01
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Added 1.5s delay before level transition for smoother flow.

    Notes:
    Extracted level progression and game flow control logic from loop.js.
*/

import { gameLevel, gameState, levelStartTime, bullets, obstacles } from './state.js';

let allowSpawning = true;
let pendingLevelUp = false;
let levelClearTime = null;

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
        console.log('All obstacles cleared, beginning level-up delay');
        pendingLevelUp = true;
        levelClearTime = now;
    }

    if (pendingLevelUp && levelClearTime && now - levelClearTime >= 1500) {
        console.log('Level-up delay complete, transitioning levels');
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