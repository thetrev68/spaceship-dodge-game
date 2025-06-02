/*
    loop.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Converted level-up system from score-based to time-based.
        2025-06-01: Adjusted level-up timing to 15s and ensured obstacles keep moving post-spawn.
        2025-06-01: Fixed bug where asteroid speed did not reset when starting a new game.
        2025-06-01: Replaced null spawn interval with explicit spawn gating flag for asteroid control.
        2025-06-01: Removed mouse controls and migrated to unified input system in controls.js.
        2025-06-01: Extracted score popup logic to scorePopups.js.
        2025-06-01: Extracted level flow logic to flowManager.js.
        2025-06-02: Reduced obstacleSpawnInterval to BASE_SPAWN_INTERVAL / 2 (750ms). Added console.log for canvas size.

    Notes:
    Main game loop and control functions (start, continue, end).
*/

import { player, gameState, score as scoreVal, gameLevel as levelVal, lastObstacleSpawnTime, bullets, obstacles, BASE_SPAWN_INTERVAL, SPAWN_INTERVAL_DECREASE_PER_LEVEL } from './state.js';
import { updateBullets, drawBullets } from './bullet.js';
import { updateObstacles, drawObstacles, updateDifficulty as updateAsteroids } from './asteroid.js';
import { checkBulletObstacleCollisions, checkPlayerObstacleCollisions } from './collisions.js';
import { showOverlay } from './ui.js';
import { updatePlayer, drawPlayer } from './player.js';
import { createAudioControls } from './audioControls.js';
import { drawScore } from './scoreDisplay.js';
import { setupInput } from './controls.js';
import { addScorePopup, updateScorePopups, drawScorePopups } from './scorePopups.js';
import { canSpawnAsteroids, resetLevelFlow, updateLevelFlow } from './flowManager.js';

let animationId;
let score = scoreVal;
let gameLevel = levelVal;
let obstacleSpawnInterval = BASE_SPAWN_INTERVAL / 2; // Reduced to 750ms

export { addScorePopup };

export function gameLoop(canvas) {
    const ctx = canvas.getContext('2d');
    console.log('Game loop running, canvas size:', canvas.width, canvas.height);

    if (gameState.value !== 'PLAYING') {
        animationId = requestAnimationFrame(() => gameLoop(canvas));
        return;
    }

    updateLevelFlow(() => {
        cancelAnimationFrame(animationId);
        showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, canSpawnAsteroids());
    updateBullets(canvas.height);
    updateScorePopups();

    drawPlayer(ctx);
    drawObstacles(ctx);
    drawBullets(ctx);
    drawScore(ctx);
    drawScorePopups(ctx);

    checkPlayerObstacleCollisions();
    checkBulletObstacleCollisions(scoreVal);

    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function startGame(canvas) {
    setupInput(canvas);
    gameState.value = 'PLAYING';
    score.value = 0;
    gameLevel.value = 0;
    updateAsteroids(0);
    obstacleSpawnInterval = BASE_SPAWN_INTERVAL / 2; // 750ms
    bullets.length = 0;
    obstacles.length = 0;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 50;
    player.dx = 0;
    player.dy = 0;
    lastObstacleSpawnTime.value = Date.now();
    resetLevelFlow();

    showOverlay('PLAYING');
    createAudioControls();
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function continueGame(canvas) {
    setupInput(canvas);
    gameState.value = 'PLAYING';
    updateAsteroids(gameLevel.value);
    lastObstacleSpawnTime.value = Date.now();
    resetLevelFlow();
    showOverlay('PLAYING');
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function endGame() {
    gameState.value = 'GAME_OVER';
    cancelAnimationFrame(animationId);
    showOverlay('GAME_OVER', score.value, gameLevel.value);
}