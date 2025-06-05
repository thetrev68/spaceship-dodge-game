// gameLoop.js
/*
  Complete game loop with spawn-count-based leveling integration,
  canvas sizing, and centralized rendering.
*/

import { 
  gameState, 
  lastObstacleSpawnTime, 
  BASE_SPAWN_INTERVAL, 
  SPAWN_INTERVAL_DECREASE_PER_LEVEL, 
  gameLevel 
} from './state.js';

import { newAsteroidsSpawned } from './asteroid.js';
import { updatePlayer } from './player.js';
import { updateObstacles } from './asteroid.js';
import { updateBullets } from './bullet.js';
import { updatePowerups, spawnPowerup } from './powerups.js';
import { updateScorePopups } from './scorePopups.js';
import { checkCollisions } from './collisionHandler.js';
import { updateLevelFlow, resetLevelFlow } from './flowManager.js';
import { renderAll } from './renderManager.js';

const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;

let lastFrameTime = 0;
let animationId;
let gameCanvas;
let ctx;
let lastPowerupSpawnTime = 0;
const POWERUP_SPAWN_INTERVAL = 10000;
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
    animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  obstacleSpawnInterval = getSpawnInterval(gameLevel.value);

  if (!lastPowerupSpawnTime || timestamp - lastPowerupSpawnTime > POWERUP_SPAWN_INTERVAL) {
    spawnPowerup(canvas.width);
    lastPowerupSpawnTime = timestamp;
  }

  updatePlayer();
  updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, true);
  updateBullets(canvas.height);
  updatePowerups(canvas.height);
  updateScorePopups();

  checkCollisions();

  renderAll(ctx);

  updateLevelFlow(() => {
    console.log('Level up! Current level:', gameLevel.value);
    newAsteroidsSpawned = 0; // reset on level up
    resetLevelFlow();
  });

  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}

export function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}