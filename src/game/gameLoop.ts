/**
 * @fileoverview Main game loop management.
 */

import {
  gameState,
  lastObstacleSpawnTime,
  gameLevel,
  allowSpawning,
  score,
} from '@core/state.js';
import {
  GAME_CONFIG,
  LEVEL_CONFIG,
  POWERUP_CONFIG,
  ASTEROID_CONFIG,
} from '@core/constants.js';
import { updatePlayer } from '@entities/player.js';
import { updateObstacles, resetNewAsteroidsSpawned } from '@entities/asteroid.js';
import { updateBullets } from '@entities/bullet.js';
import { updatePowerups, spawnPowerup } from '@entities/powerup.js';
import { updateScorePopups } from '@ui/hud/scorePopups.js';
import { updateLevelFlow, resetLevelFlow } from '@game/flowManager.js';
import { renderAll } from '@systems/renderManager.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import { isMobile } from '@utils/platform.js';
import { updatePerfHud } from '@ui/hud/perfHUD.js';
import { services } from '@services/ServiceProvider.js';

let lastFrameTime = 0;
let animationId: number | null = null;
let gameCanvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let lastPowerupSpawnTime = 0;
let perfSampleStart = performance.now();
let perfFrameCounter = 0;

const TIME_STEP = isMobile() ? 1000 / 30 : GAME_CONFIG.FRAME_DURATION;
let accumulator = 0;
let skipMobileRender = false;
let obstacleSpawnInterval = ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;

function getSpawnInterval(level: number): number {
  const baseInterval = isMobile()
    ? LEVEL_CONFIG.BASE_SPAWN_INTERVAL_MOBILE
    : LEVEL_CONFIG.BASE_SPAWN_INTERVAL_DESKTOP;
  const interval = baseInterval - level * LEVEL_CONFIG.SPAWN_INTERVAL_DECREASE_PER_LEVEL;
  const minInterval = isMobile() ? Math.max(ASTEROID_CONFIG.MIN_SPAWN_INTERVAL, 500) : ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;
  return Math.max(interval, minInterval);
}

export function setCanvas(canvas: HTMLCanvasElement): void {
  gameCanvas = canvas;
  ctx = gameCanvas.getContext('2d');
}

export function restartGameLoop(): void {
  const canvas = gameCanvas;
  if (!canvas) return;
  animationId = requestAnimationFrame((timestamp) => gameLoop(canvas, timestamp));
}

function gameLoop(canvas: HTMLCanvasElement, timestamp = 0): void {
  const frameStart = performance.now();
  if (!lastFrameTime) lastFrameTime = timestamp;

  let deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (gameState.value !== 'PLAYING') {
    stopGameLoop();
    return;
  }

  if (deltaTime > 250) deltaTime = 250;
  accumulator += deltaTime;

  while (accumulator >= TIME_STEP) {
    obstacleSpawnInterval = getSpawnInterval(gameLevel.value);

    if (!lastPowerupSpawnTime || Date.now() - lastPowerupSpawnTime > POWERUP_CONFIG.SPAWN_INTERVAL) {
      spawnPowerup(canvas.width);
      lastPowerupSpawnTime = Date.now();
    }

    updatePlayer();
    updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, allowSpawning.value);
    updateBullets();
    updatePowerups(canvas.height);
    updateScorePopups();

    services.collisionService.checkCollisions();

    updateLevelFlow(() => {
      resetNewAsteroidsSpawned();
      resetLevelFlow();
      showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
    });

    accumulator -= TIME_STEP;
  }
  const logicEnd = performance.now();

  if (isMobile()) {
    skipMobileRender = !skipMobileRender;
    if (skipMobileRender) {
      animationId = requestAnimationFrame((time) => gameLoop(canvas, time));
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
      logicMs: logicEnd - frameStart,
    });
    perfSampleStart = frameEnd;
    perfFrameCounter = 0;
  }

  animationId = requestAnimationFrame((time) => gameLoop(canvas, time));
}

export function stopGameLoop(): void {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}
