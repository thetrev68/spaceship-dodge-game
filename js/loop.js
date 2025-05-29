/*
    loop.js
    Created: 2025-05-28
    Author: ChatGPT + [Your Name Here]

    Notes:
    Main game loop and control functions (start, continue, end).
*/

import { player, gameState, score as scoreVal, gameLevel as levelVal, lastObstacleSpawnTime, bullets, obstacles, BASE_SPAWN_INTERVAL, SPAWN_INTERVAL_DECREASE_PER_LEVEL, LEVEL_UP_SCORE_THRESHOLD } from './state.js';
import { updateBullets, drawBullets } from './bullet.js';
import { updateObstacles, drawObstacles, updateDifficulty as updateAsteroids } from './asteroid.js';
import { checkBulletObstacleCollisions, checkPlayerObstacleCollisions } from './collisions.js';
import { showOverlay } from './ui.js';

let animationId;
let score = { value: scoreVal };
let gameLevel = levelVal;
let obstacleSpawnInterval = BASE_SPAWN_INTERVAL;

function drawScore(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score.value}`, 20, 40);
    ctx.fillText(`Level: ${gameLevel + 1}`, 20, 70);
}

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

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > innerWidth * 0.9) player.x = innerWidth * 0.9 - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > innerHeight * 0.8) player.y = innerHeight * 0.8 - player.height;
}

function drawPlayer(ctx) {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.stroke();
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

    showOverlay('PLAYING');
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function continueGame(canvas) {
    gameState.value = 'PLAYING';
    lastObstacleSpawnTime.value = Date.now();
    showOverlay('PLAYING');
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function endGame() {
    gameState.value = 'GAME_OVER';
    cancelAnimationFrame(animationId);
    showOverlay('GAME_OVER', score.value, gameLevel);
}