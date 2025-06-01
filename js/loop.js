/*
    loop.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Converted level-up system from score-based to time-based.
        2025-06-01: Adjusted level-up timing to 15s and ensured obstacles keep moving post-spawn.
        2025-06-01: Fixed bug where asteroid speed did not reset when starting a new game.
        2025-06-01: Replaced null spawn interval with explicit spawn gating flag for asteroid control.

    Notes:
    Main game loop and control functions (start, continue, end).
*/

import { player, gameState, score as scoreVal, gameLevel as levelVal, lastObstacleSpawnTime, bullets, obstacles, BASE_SPAWN_INTERVAL, SPAWN_INTERVAL_DECREASE_PER_LEVEL, levelStartTime } from './state.js';
import { updateBullets, drawBullets } from './bullet.js';
import { updateObstacles, drawObstacles, updateDifficulty as updateAsteroids } from './asteroid.js';
import { checkBulletObstacleCollisions, checkPlayerObstacleCollisions } from './collisions.js';
import { showOverlay } from './ui.js';
import { updatePlayer, drawPlayer } from './player.js';
import { createAudioControls } from './audioControls.js';
import { drawScore } from './scoreDisplay.js';

let animationId;
let score = scoreVal;
let gameLevel = levelVal;
let obstacleSpawnInterval = BASE_SPAWN_INTERVAL;
let pendingLevelUp = false;
const scorePopups = [];

let firing = false;
let allowSpawning = true; // Replaces spawnAsteroids logic

function drawScorePopups(ctx) {
    scorePopups.forEach(popup => {
        ctx.globalAlpha = popup.opacity;
        ctx.fillStyle = popup.color;
        ctx.font = '16px Inter';
        ctx.fillText(popup.text, popup.x, popup.y);
        ctx.globalAlpha = 1.0;
    });
}

function setupMouseControls(canvas) {
    canvas.addEventListener('mousemove', (e) => {
        if (gameState.value !== 'PLAYING') return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        player.x = mouseX - player.width / 2;
        player.y = mouseY - player.height / 2;
    });

    canvas.addEventListener('mousedown', (e) => {
        if (gameState.value !== 'PLAYING' || e.button !== 0) return;
        firing = true;
        const fire = () => {
            if (!firing) return;
            import('./bullet.js').then(m => m.fireBullet());
            setTimeout(fire, 100);
        };
        fire();
    });

    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) firing = false;
    });

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (gameState.value === 'PLAYING' || gameState.value === 'PAUSED') {
            gameState.value = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
            import('./ui.js').then(m => m.showOverlay(gameState.value));
            if (gameState.value === 'PAUSED') firing = false;
        }
    });
}

function updateScorePopups() {
    for (let i = scorePopups.length - 1; i >= 0; i--) {
        scorePopups[i].y -= 0.5;
        scorePopups[i].opacity -= 0.02;
        if (scorePopups[i].opacity <= 0) {
            scorePopups.splice(i, 1);
        }
    }
}

export function addScorePopup(text, x, y, color = '#ffffff') {
    scorePopups.push({ text, x, y, opacity: 1.0, color });
}

export function gameLoop(canvas) {
    const ctx = canvas.getContext('2d');

    if (gameState.value !== 'PLAYING') {
        animationId = requestAnimationFrame(() => gameLoop(canvas));
        return;
    }

    const now = Date.now();
    const levelElapsedTime = (now - levelStartTime.value) / 1000; // in seconds

    // Stop spawning new asteroids after 15 seconds
    if (levelElapsedTime >= 15) allowSpawning = false;

    if (!allowSpawning && !pendingLevelUp && obstacles.length === 0) {
        pendingLevelUp = true; // Transition after clearing field
    }

    if (pendingLevelUp) {
        gameLevel.value++;
        gameState.value = 'LEVEL_TRANSITION';
        firing = false;
        cancelAnimationFrame(animationId);
        import('./soundManager.js').then(m => m.playSound('levelup'));
        import('./soundManager.js').then(m => m.stopMusic());
        bullets.length = 0;
        pendingLevelUp = false;
        allowSpawning = true; // reset for next level
        showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, allowSpawning);
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
    setupMouseControls(canvas);
    gameState.value = 'PLAYING';
    score.value = 0;
    gameLevel.value = 0;
    pendingLevelUp = false;
    updateAsteroids(0); // Reset asteroid difficulty to level 0
    obstacleSpawnInterval = BASE_SPAWN_INTERVAL;
    bullets.length = 0;
    obstacles.length = 0;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 50;
    player.dx = 0;
    player.dy = 0;
    lastObstacleSpawnTime.value = Date.now();
    levelStartTime.value = Date.now();
    allowSpawning = true;
    pendingLevelUp = false;

    showOverlay('PLAYING');
    createAudioControls();
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function continueGame(canvas) {
    setupMouseControls(canvas);
    gameState.value = 'PLAYING';
    updateAsteroids(gameLevel.value); // Ensure correct difficulty on resume
    lastObstacleSpawnTime.value = Date.now();
    levelStartTime.value = Date.now();
    allowSpawning = true;
    showOverlay('PLAYING');
    animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function endGame() {
    firing = false;
    gameState.value = 'GAME_OVER';
    cancelAnimationFrame(animationId);
    showOverlay('GAME_OVER', score.value, gameLevel.value);
}