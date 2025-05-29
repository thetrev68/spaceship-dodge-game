/*
    loop.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Main game loop and control functions (start, continue, end).
*/

import { player, gameState, score as scoreVal, gameLevel as levelVal, lastObstacleSpawnTime, bullets, obstacles, BASE_SPAWN_INTERVAL, SPAWN_INTERVAL_DECREASE_PER_LEVEL, LEVEL_UP_SCORE_THRESHOLD } from './state.js';
import { updateBullets, drawBullets } from './bullet.js';
import { updateObstacles, drawObstacles, updateDifficulty as updateAsteroids } from './asteroid.js';
import { checkBulletObstacleCollisions, checkPlayerObstacleCollisions } from './collisions.js';
import { showOverlay } from './ui.js';
import { updatePlayer, drawPlayer } from './player.js';
import { createAudioControls } from './audioControls.js';
import { drawScore } from './scoreDisplay.js';
import { startMusic, stopMusic } from './soundManager.js';

let animationId;
let score = { value: scoreVal };
let gameLevel = levelVal;
let obstacleSpawnInterval = BASE_SPAWN_INTERVAL;

export function gameLoop(canvas) {
    const ctx = canvas.getContext('2d');

    if (gameState.value !== 'PLAYING') {
        animationId = requestAnimationFrame(() => gameLoop(canvas));
        return;
    }

    const newLevel = Math.floor(score.value / LEVEL_UP_SCORE_THRESHOLD);
    if (newLevel > gameLevel) {
        gameLevel = newLevel;
        updateAsteroids(gameLevel);
        obstacleSpawnInterval = Math.max(100, BASE_SPAWN_INTERVAL - (gameLevel * SPAWN_INTERVAL_DECREASE_PER_LEVEL));
        gameState.value = 'LEVEL_TRANSITION';
        cancelAnimationFrame(animationId);
        bullets.length = 0;
        obstacles.length = 0;
        stopMusic();
        showOverlay('LEVEL_TRANSITION', score.value, gameLevel);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw
    updatePlayer();
    updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime);
    updateBullets(canvas.height);
    drawPlayer(ctx);
    drawObstacles(ctx);
    drawBullets(ctx);
    drawScore(ctx);

    // Collision checks
    checkPlayerObstacleCollisions();
    checkBulletObstacleCollisions(score);

    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function startGame(canvas) {
    gameState.value = 'PLAYING';
    score.value = 0;
    gameLevel = 0;
    updateAsteroids(gameLevel);
    obstacleSpawnInterval = BASE_SPAWN_INTERVAL;
    bullets.length = 0;
    obstacles.length = 0;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 50;
    player.dx = 0;
    player.dy = 0;
    lastObstacleSpawnTime.value = Date.now();

    startMusic();
    showOverlay('PLAYING');
    createAudioControls();
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function continueGame(canvas) {
    gameState.value = 'PLAYING';
    lastObstacleSpawnTime.value = Date.now();
    startMusic();
    showOverlay('PLAYING');
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function endGame() {
    gameState.value = 'GAME_OVER';
    cancelAnimationFrame(animationId);
    stopMusic();
    showOverlay('GAME_OVER', score.value, gameLevel);
}