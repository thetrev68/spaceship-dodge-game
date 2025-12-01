/*
    flowManager.js
    Created: 2025-06-01
    Author: ChatGPT + Trevor Clark

    This file controls when the game level should move to the next one.
    It uses a count of new asteroids spawned (not fragments) to decide when to stop spawning,
    and waits for the player to clear the screen before advancing.

    The comments explain each part in simple terms.
*/

import { allowSpawning, gameLevel, gameState, levelStartTime, bullets, obstacles } from '@core/state.js';
import { newAsteroidsSpawned } from '@entities/asteroid.js';
import { playSound, stopMusic } from '@systems/soundManager.js';
import { debug } from '@core/logger.js';
import { clearAllBullets } from '@entities/bullet.js';

// Variables to keep track of spawning permission and level up status
let pendingLevelUp = false;    // Have we started the process of moving to the next level?
let levelClearTime = null;     // When did the screen become empty after stopping spawn?

const MAX_WAIT = 5000;         // Max time (in ms) to wait before forcing level up anyway
const ASTEROIDS_PER_LEVEL = 20; // How many new asteroids to spawn per level before stopping

// Call this when a level starts or restarts to reset flow state
export function resetLevelFlow() {
    allowSpawning.value = true;  // Allow new asteroids to spawn again
    pendingLevelUp = false;      // Not yet moving to next level
    levelClearTime = null;       // Reset clear timer
    levelStartTime.value = Date.now(); // Remember when this level started
    debug('level', 'Level flow reset');
}

// This is called every frame (or frequently) to check if conditions are met to advance level
// onLevelUpCallback is a function to call when level actually advances
export function updateLevelFlow(onLevelUpCallback) {
    const now = Date.now(); // current time in milliseconds

    // Step 1: Decide when to stop spawning new asteroids
    // We stop spawning either if too many seconds have passed (15s), or
    // if we have spawned the required number of new asteroids for this level.
    if (newAsteroidsSpawned >= (gameLevel.value + 1) * ASTEROIDS_PER_LEVEL) {
        allowSpawning.value = false;  // Stop spawning due to count limit reached
        debug('level', 'Stopping spawning: asteroid count limit reached');
    }

    // Step 2: If spawning stopped, and we haven't started level-up process,
    // and the screen is clear of asteroids, start the countdown to next level
    if (!allowSpawning.value && !pendingLevelUp && obstacles.length === 0) {
        pendingLevelUp = true;       // Flag we are about to move levels
        levelClearTime = now;        // Remember when the screen became clear
        debug('level', 'Screen clear, pending level up started');
    }

    // Step 3: If level-up pending, wait 1.5 seconds or max wait time,
    // then actually advance the level
    if (pendingLevelUp && levelClearTime) {
        const timeSinceClear = now - levelClearTime;
        const timeSinceLevelStart = now - levelStartTime.value;

        if (timeSinceClear >= 1500 || timeSinceLevelStart >= MAX_WAIT) {
            // Advance the level
            gameLevel.value++;
            gameState.value = 'LEVEL_TRANSITION';
            clearAllBullets();        // Clear bullets
            allowSpawning.value = true; // Reset spawning flag for next level
            pendingLevelUp = false;    // Reset flag
            levelClearTime = null;     // Reset timer

            // Play sounds
            playSound('levelup');
            stopMusic();

            // Call the provided callback for any additional level-up logic
            onLevelUpCallback();

            debug('level', 'Level up triggered!');
        }
    }
}
