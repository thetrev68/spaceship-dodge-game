// gameLoop.js
/*
  Complete game loop module with proper obstacle spawn timing,
  canvas sizing, and update/draw orchestration using renderManager.
*/

import { 
  gameState, 
  lastObstacleSpawnTime, 
  BASE_SPAWN_INTERVAL, 
  SPAWN_INTERVAL_DECREASE_PER_LEVEL, 
  gameLevel,
  allowSpawning
} from './state.js';

import { updatePlayer } from './player.js';
import { updateObstacles } from './asteroid.js';
import * as asteroid from './asteroid.js';
import { updateBullets } from './bullet.js';
import { updatePowerups, spawnPowerup } from './powerups.js';
import { updateScorePopups } from './scorePopups.js';
import { checkCollisions } from './collisionHandler.js';
import { updateLevelFlow, resetLevelFlow } from './flowManager.js';
import { renderAll } from './renderManager.js';
import { score } from './state.js';

const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;

let lastFrameTime = 0;
let animationId;
let gameCanvas;
let ctx;
let lastPowerupSpawnTime = 0;
const POWERUP_SPAWN_INTERVAL = 10000; // 10 seconds
const MIN_SPAWN_INTERVAL = 300;

function getSpawnInterval(level) {
  const interval = BASE_SPAWN_INTERVAL - level * SPAWN_INTERVAL_DECREASE_PER_LEVEL;
  return Math.max(interval, MIN_SPAWN_INTERVAL);
}

let obstacleSpawnInterval = MIN_SPAWN_INTERVAL;

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

export function gameLoop(canvas, timestamp = 0) {
  if (timestamp - lastFrameTime < FRAME_DURATION) {
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

  if (!lastPowerupSpawnTime || timestamp - lastPowerupSpawnTime > POWERUP_SPAWN_INTERVAL) {
    spawnPowerup(canvas.width);
    lastPowerupSpawnTime = timestamp;
  }

  updatePlayer();
  // Pass reactive allowSpawning.value here to gate spawning
  updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, allowSpawning.value);
  updateBullets(canvas.height);
  updatePowerups(canvas.height);
  updateScorePopups();

  checkCollisions();

  renderAll(ctx);

  updateLevelFlow(() => {
    // Reset spawn count and level flow on level up
    asteroid.resetNewAsteroidsSpawned();
    resetLevelFlow();

    import('./ui.js').then(ui => {
      ui.showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
    });
  });

  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}

export function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}