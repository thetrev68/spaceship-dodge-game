/**
 * @fileoverview Main game loop management.
 * Complete game loop module with proper obstacle spawn timing,
 * canvas sizing, and update/draw orchestration using renderManager.
 * Updated: 2025-11-30 for performance improvements and error handling
 */

import {
  gameState,
  lastObstacleSpawnTime,
  gameLevel,
  allowSpawning
} from '@core/state.js';

import {
  GAME_CONFIG,
  LEVEL_CONFIG,
  POWERUP_CONFIG,
  ASTEROID_CONFIG
} from '@core/constants.js';

import { updatePlayer } from '@entities/player.js';
import { updateObstacles, resetNewAsteroidsSpawned } from '@entities/asteroid.js';
import { updateBullets } from '@entities/bullet.js';
import { updatePowerups, spawnPowerup } from '@entities/powerup.js';
import { updateScorePopups } from '@ui/hud/scorePopups.js';
import { checkCollisions } from '@systems/collisionHandler.js';
import { updateLevelFlow, resetLevelFlow } from '@game/flowManager.js';
import { renderAll } from '@systems/renderManager.js';
import { score } from '@core/state.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import { isMobile } from '@utils/platform.js';

let lastFrameTime = 0;
let animationId;
let gameCanvas;
let ctx;
let lastPowerupSpawnTime = 0;

/**
 * Calculates the spawn interval for the given level.
 * @param {number} level - Current game level.
 * @returns {number} Spawn interval in milliseconds.
 */
function getSpawnInterval(level) {
  const baseInterval = isMobile()
    ? LEVEL_CONFIG.BASE_SPAWN_INTERVAL_MOBILE
    : LEVEL_CONFIG.BASE_SPAWN_INTERVAL_DESKTOP;
  const interval = baseInterval - level * LEVEL_CONFIG.SPAWN_INTERVAL_DECREASE_PER_LEVEL;
  return Math.max(interval, ASTEROID_CONFIG.MIN_SPAWN_INTERVAL);
}

let obstacleSpawnInterval = ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;

/**
 * Sets the game canvas.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 */
export function setCanvas(canvas) {
  gameCanvas = canvas;
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
  ctx = gameCanvas.getContext('2d');
}

/**
 * Restarts the game loop.
 */
export function restartGameLoop() {
  if (gameCanvas) {
    animationId = requestAnimationFrame((t) => gameLoop(gameCanvas, t));
  }
}


const TIME_STEP = GAME_CONFIG.FRAME_DURATION; // 16.67ms for 60 FPS logic updates
let accumulator = 0;

/**
 * Main game loop function.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 * @param {number} timestamp - Current timestamp.
 */
function gameLoop(canvas, timestamp = 0) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  
  let deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (gameState.value !== 'PLAYING') {
    stopGameLoop();
    return;
  }

  // Prevent "spiral of death" if tab is backgrounded or extremely slow
  if (deltaTime > 250) deltaTime = 250;

  accumulator += deltaTime;

  // Fixed timestep update loop
  while (accumulator >= TIME_STEP) {
    obstacleSpawnInterval = getSpawnInterval(gameLevel.value);

    if (!lastPowerupSpawnTime || Date.now() - lastPowerupSpawnTime > POWERUP_CONFIG.SPAWN_INTERVAL) {
      spawnPowerup(canvas.width);
      lastPowerupSpawnTime = Date.now();
    }

    updatePlayer();
    // We pass TIME_STEP or similar if the update functions supported variable dt,
    // but here they assume per-frame execution, so we just execute them.
    updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, allowSpawning.value);
    updateBullets();
    updatePowerups(canvas.height);
    updateScorePopups();
    
    checkCollisions();
    
    updateLevelFlow(() => {
        resetNewAsteroidsSpawned();
        resetLevelFlow();
    
        showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
      });
      
    accumulator -= TIME_STEP;
  }

  // Render phase - decoupled from logic updates
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderAll(ctx);

  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}

/**
 * Stops the game loop.
 */
export function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}