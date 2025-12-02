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
import { updatePerfHud } from '@ui/hud/perfHUD.js';

let lastFrameTime = 0;
/** @type {number|null} */
let animationId = null;
/** @type {HTMLCanvasElement|null} */
let gameCanvas = null;
/** @type {CanvasRenderingContext2D|null} */
let ctx = null;
let lastPowerupSpawnTime = 0;
let perfSampleStart = performance.now();
let perfFrameCounter = 0;

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
  const minInterval = isMobile() ? Math.max(ASTEROID_CONFIG.MIN_SPAWN_INTERVAL, 500) : ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;
  return Math.max(interval, minInterval);
}

/** @type {number} */
let obstacleSpawnInterval = ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;

/**
 * Sets the game canvas.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 */
export function setCanvas(canvas) {
  gameCanvas = canvas;
  // Canvas dimensions are set in initializeCanvas; don't override here or we lose the low-res mobile buffer.
  ctx = gameCanvas.getContext('2d');
}

/**
 * Restarts the game loop.
 */
export function restartGameLoop() {
  const canvas = gameCanvas;
  if (!canvas) return;
  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}


// Lower fixed timestep on mobile to reduce work per second.
const TIME_STEP = isMobile() ? 1000 / 30 : GAME_CONFIG.FRAME_DURATION;
let accumulator = 0;
let skipMobileRender = false;

/**
 * Main game loop function.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 * @param {number} timestamp - Current timestamp.
 */
function gameLoop(canvas, timestamp = 0) {
  const frameStart = performance.now();
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
  const logicEnd = performance.now();

  // Render phase - decoupled from logic updates
  if (isMobile()) {
    skipMobileRender = !skipMobileRender;
    if (skipMobileRender) {
      animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
      return;
    }
  }

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAll(ctx);
  }
  const frameEnd = performance.now();

  perfFrameCounter += 1;
  const perfWindowMs = frameEnd - perfSampleStart;
  if (perfWindowMs >= 500) {
    const fps = (perfFrameCounter / perfWindowMs) * 1000;
    updatePerfHud({
      fps,
      frameMs: frameEnd - frameStart,
      logicMs: logicEnd - frameStart
    });
    perfSampleStart = frameEnd;
    perfFrameCounter = 0;
  }

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
