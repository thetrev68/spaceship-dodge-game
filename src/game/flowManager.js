/**
 * @fileoverview Manages game level progression and flow.
 * Created: 2025-06-01
 * Author: ChatGPT + Trevor Clark
 * This file controls when the game level should move to the next one.
 * It uses a count of new asteroids spawned (not fragments) to decide when to stop spawning,
 * and waits for the player to clear the screen before advancing.
 * The comments explain each part in simple terms.
 */

import { allowSpawning, gameLevel, gameState, levelStartTime, obstacles } from '@core/state.js';
import { newAsteroidsSpawned } from '@entities/asteroid.js';
import { playSound, stopMusic } from '@systems/soundManager.js';
import { debug } from '@core/logger.js';
import { clearAllBullets } from '@entities/bullet.js';

/**
 * Flag for pending level up.
 * @type {boolean}
 */
let pendingLevelUp = false;

/**
 * Time when screen became clear.
 * @type {number|null}
 */
let levelClearTime = null;

/**
 * Maximum wait time before forcing level up.
 * @const {number}
 */
const MAX_WAIT = 5000;

/**
 * Number of asteroids per level.
 * @const {number}
 */
const ASTEROIDS_PER_LEVEL = 20;

/**
 * Resets the level flow state.
 */
export function resetLevelFlow() {
    allowSpawning.value = true;
    pendingLevelUp = false;
    levelClearTime = null;
    levelStartTime.value = Date.now();
    debug('level', 'Level flow reset');
}

/**
 * Updates the level flow and checks for level advancement.
 * @param {Function} onLevelUpCallback - Callback to call on level up.
 */
export function updateLevelFlow(onLevelUpCallback) {
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
            gameLevel.value++;
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
