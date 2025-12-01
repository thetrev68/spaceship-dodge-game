// gameLoop.js
/*
  Complete game loop module with proper obstacle spawn timing,
  canvas sizing, and update/draw orchestration using renderManager.
  Updated: 2025-11-30 for performance improvements and error handling
*/

import {
  gameState,
  lastObstacleSpawnTime,
  gameLevel,
  allowSpawning
} from '@core/state';

import {
  GAME_CONFIG,
  LEVEL_CONFIG,
  POWERUP_CONFIG,
  ASTEROID_CONFIG
} from '@core/constants';

import { updatePlayer } from '@entities/player';
import { updateObstacles, resetNewAsteroidsSpawned } from '@entities/asteroid';
import { updateBullets } from '@entities/bullet';
import { updatePowerups, spawnPowerup } from '@entities/powerup';
import { updateScorePopups } from '../scorePopups.js';
import { checkCollisions } from '@systems/collisionHandler.js';
import { updateLevelFlow, resetLevelFlow } from './flowManager.js';
import { renderAll } from '@systems/renderManager.js';
import { score } from '@core/state';
import { showOverlay } from '../ui.js';

let lastFrameTime = 0;
let animationId;
let gameCanvas;
let ctx;
let lastPowerupSpawnTime = 0;

function getSpawnInterval(level) {
  const baseInterval = LEVEL_CONFIG.BASE_SPAWN_INTERVAL_DESKTOP;
  const interval = baseInterval - level * LEVEL_CONFIG.SPAWN_INTERVAL_DECREASE_PER_LEVEL;
  return Math.max(interval, ASTEROID_CONFIG.MIN_SPAWN_INTERVAL);
}

let obstacleSpawnInterval = ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;

export function setCanvas(canvas) {
  gameCanvas = canvas;
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
  ctx = gameCanvas.getContext('2d');
}

export function restartGameLoop() {
  if (gameCanvas) {
    animationId = requestAnimationFrame((t) => gameLoop(gameCanvas, t));
  }
}

// TODO: Currently exported but only called internally - consider making private
function gameLoop(canvas, timestamp = 0) {
  if (timestamp - lastFrameTime < GAME_CONFIG.FRAME_DURATION) {
    animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
    return;
  }
  lastFrameTime = timestamp;

  if (gameState.value !== 'PLAYING') {
    stopGameLoop(); // fully pause game loop
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  obstacleSpawnInterval = getSpawnInterval(gameLevel.value);

  if (!lastPowerupSpawnTime || timestamp - lastPowerupSpawnTime > POWERUP_CONFIG.SPAWN_INTERVAL) {
    spawnPowerup(canvas.width);
    lastPowerupSpawnTime = timestamp;
  }

  updatePlayer();
  // Pass reactive allowSpawning.value here to gate spawning
  updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, allowSpawning.value);
  updateBullets();
  updatePowerups(canvas.height);
  updateScorePopups();

  checkCollisions();

  renderAll(ctx);

  updateLevelFlow(() => {
    // Reset spawn count and level flow on level up
    resetNewAsteroidsSpawned();
    resetLevelFlow();

    showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
  });

  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}

export function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}