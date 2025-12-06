/**
 * @module game/gameLoop
 * Fixed Timestep Game Loop with Accumulator Pattern
 *
 * Implements a deterministic game loop with fixed update intervals (16.67ms = 60 FPS desktop,
 * 33.33ms = 30 FPS mobile) while allowing variable render rates. The accumulator pattern
 * tracks "leftover" time between frames to ensure consistent physics behavior.
 *
 * ## Why Fixed Timestep?
 *
 * **Problem with variable timestep:**
 * ```typescript
 * // BAD: Physics depend on frame rate
 * player.x += player.velocity * deltaTime;
 * // On 30 FPS frame (33ms): moves 2x distance vs 60 FPS frame (16ms)
 * // Result: Non-deterministic gameplay, different behavior on each device
 * ```
 *
 * **Solution: Fixed timestep with accumulator:**
 * ```typescript
 * // GOOD: Physics always use same TIME_STEP (16.67ms)
 * accumulator += deltaTime;
 * while (accumulator >= TIME_STEP) {
 *   update(TIME_STEP);  // Always same delta
 *   accumulator -= TIME_STEP;
 * }
 * render();  // Can render at different rate than updates
 * ```
 *
 * ## Benefits
 * 1. **Deterministic physics:** Same inputs -> same outputs (predictable gameplay)
 * 2. **Prevents spiral of death:** Delta capped at 250ms prevents infinite catch-up
 * 3. **Smooth rendering:** Independent of update rate
 * 4. **Cross-device consistency:** Same gameplay speed on all devices
 *
 * ## Mobile Optimization
 * - 30 FPS update rate (TIME_STEP = 33.33ms) reduces CPU load by 50%
 * - Render skipping (every 2nd frame) saves GPU bandwidth
 * - Trade-off: Slightly less responsive input, but maintains stable FPS on budget devices
 *
 * ## Performance Budget (60 FPS desktop)
 * - Total frame budget: 16.67ms
 * - Update (logic): 2-4ms
 * - Collision: 0.5-2ms
 * - Render: 6-8ms
 * - Overhead: 4-6ms (safety buffer)
 *
 * @see https://gafferongames.com/post/fix_your_timestep/
 * @see https://gameprogrammingpatterns.com/game-loop.html
 * @see docs/architecture/decisions/ADR-004-fixed-timestep-game-loop.md
 */

import { gameState, lastObstacleSpawnTime, gameLevel, allowSpawning, score } from '@core/state.js';
import { GAME_CONFIG, LEVEL_CONFIG, POWERUP_CONFIG, ASTEROID_CONFIG } from '@core/constants.js';
import { updatePlayer } from '@entities/player.js';
import {
  updateObstacles,
  resetNewAsteroidsSpawned,
  updateDebris,
  drawDebris,
} from '@entities/asteroid.js';
import { updateBullets } from '@entities/bullet.js';
import { updatePowerups, spawnPowerup } from '@entities/powerup.js';
import { updateScorePopups } from '@ui/hud/scorePopups.js';
import { updateLevelFlow, resetLevelFlow } from '@game/flowManager.js';
import { renderAll } from '@systems/renderManager.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import { isMobile } from '@utils/platform.js';
import { updatePerfHud } from '@ui/hud/perfHUD.js';
import { services } from '@services/ServiceProvider.js';
import { performanceBudget } from '@utils/performanceBudget.js';

// Frame timing state
let lastFrameTime = 0;
let animationId: number | null = null;

// Canvas context
let gameCanvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

// Game-specific timers
let lastPowerupSpawnTime = 0;
let obstacleSpawnInterval = ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;

// Performance monitoring
let perfSampleStart = performance.now();
let perfFrameCounter = 0;
let hasReportedPerfSample = false;

/**
 * Fixed timestep duration in milliseconds
 * - Desktop: 16.67ms (60 FPS)
 * - Mobile: 33.33ms (30 FPS) for reduced CPU load
 *
 * This is the delta time passed to all update functions, ensuring
 * deterministic physics regardless of actual frame rate.
 */
const TIME_STEP = isMobile() ? 1000 / 30 : GAME_CONFIG.FRAME_DURATION;

/**
 * Accumulator tracks "leftover" time between frames
 *
 * ## How it works:
 * ```
 * Frame 1: deltaTime = 20ms
 *   accumulator = 20ms
 *   update(16.67ms) runs once
 *   accumulator = 3.33ms (leftover)
 *
 * Frame 2: deltaTime = 15ms
 *   accumulator = 3.33ms + 15ms = 18.33ms
 *   update(16.67ms) runs once
 *   accumulator = 1.66ms (leftover)
 *
 * Frame 3: deltaTime = 25ms (lag spike!)
 *   accumulator = 1.66ms + 25ms = 26.66ms
 *   update(16.67ms) runs once
 *   accumulator = 9.99ms (leftover)
 * ```
 */
let accumulator = 0;

/**
 * Mobile render skipping flag
 * Toggles each frame to skip every other render (30 FPS visual rate)
 */
let skipMobileRender = false;

function getSpawnInterval(level: number): number {
  const baseInterval = isMobile()
    ? LEVEL_CONFIG.BASE_SPAWN_INTERVAL_MOBILE
    : LEVEL_CONFIG.BASE_SPAWN_INTERVAL_DESKTOP;
  const interval = baseInterval - level * LEVEL_CONFIG.SPAWN_INTERVAL_DECREASE_PER_LEVEL;
  const minInterval = isMobile()
    ? Math.max(ASTEROID_CONFIG.MIN_SPAWN_INTERVAL, 500)
    : ASTEROID_CONFIG.MIN_SPAWN_INTERVAL;
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

/**
 * Main game loop using requestAnimationFrame
 *
 * ## Fixed Timestep Algorithm
 * 1. Calculate deltaTime since last frame
 * 2. Add deltaTime to accumulator
 * 3. Run updates in TIME_STEP increments until accumulator depleted
 * 4. Render once per frame (independent of update rate)
 *
 * ## Spiral of Death Prevention
 * Delta time is capped at 250ms to prevent infinite catch-up loops.
 * If game lags severely (e.g., tab backgrounded), it won't try to run
 * hundreds of updates to "catch up" - it just skips forward.
 *
 * ## Performance Monitoring
 * Tracks FPS and frame timing (logic vs render) for performance HUD display.
 *
 * @param canvas - Game canvas element
 * @param timestamp - High-resolution timestamp from requestAnimationFrame (in milliseconds)
 */
function gameLoop(canvas: HTMLCanvasElement, timestamp = 0): void {
  const frameStart = performance.now();

  // Initialize lastFrameTime on first frame
  if (!lastFrameTime) lastFrameTime = timestamp;

  // Calculate time since last frame
  let deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  // Stop loop if game is not playing (paused, game over, etc.)
  if (gameState.value !== 'PLAYING') {
    stopGameLoop();
    return;
  }

  // Cap delta to prevent "spiral of death" (infinite catch-up)
  // If tab is backgrounded for 10 seconds, we don't run 600 updates!
  if (deltaTime > 250) deltaTime = 250;

  // Add elapsed time to accumulator
  accumulator += deltaTime;

  // ===== UPDATE PHASE =====
  // Run fixed timestep updates until accumulator depleted
  // Multiple updates can run in a single frame if we're behind
  while (accumulator >= TIME_STEP) {
    // Update spawn interval based on current level
    obstacleSpawnInterval = getSpawnInterval(gameLevel.value);

    // Powerup spawning logic (time-based, every ~15 seconds)
    if (
      !lastPowerupSpawnTime ||
      Date.now() - lastPowerupSpawnTime > POWERUP_CONFIG.SPAWN_INTERVAL
    ) {
      spawnPowerup(canvas.width);
      lastPowerupSpawnTime = Date.now();
    }

    // Update all game entities
    // Note: These functions don't take deltaTime because they use fixed TIME_STEP internally
    updatePlayer();
    updateObstacles(
      canvas.width,
      canvas.height,
      obstacleSpawnInterval,
      lastObstacleSpawnTime,
      allowSpawning.value
    );
    updateDebris();
    updateBullets();
    updatePowerups(canvas.height);
    updateScorePopups();

    // Check collisions (player-obstacle, bullet-obstacle, powerup-player)
    services.collisionService.checkCollisions();

    // Level progression logic (shows level-up overlay when all obstacles cleared)
    updateLevelFlow(() => {
      resetNewAsteroidsSpawned();
      resetLevelFlow();
      showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
    });

    // Deduct one TIME_STEP from accumulator
    accumulator -= TIME_STEP;
  }
  const logicEnd = performance.now();

  // ===== RENDER PHASE =====
  // Mobile optimization: Skip every other render to save GPU bandwidth
  if (isMobile()) {
    skipMobileRender = !skipMobileRender;
    if (skipMobileRender) {
      // Skip render, but continue game loop
      animationId = requestAnimationFrame((time) => gameLoop(canvas, time));
      return;
    }
  }

  // Render current game state
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAll(ctx);
    drawDebris(ctx);
  }
  const frameEnd = performance.now();

  // ===== PERFORMANCE MONITORING =====
  // Track frame time for performance budget
  const frameDuration = frameEnd - frameStart;
  performanceBudget.recordFrame(frameDuration);

  // Sample FPS every 500ms for performance HUD (first frame always reports for visibility in tests/dev)
  perfFrameCounter += 1;
  const perfWindowMs = frameEnd - perfSampleStart;
  if (!hasReportedPerfSample || perfWindowMs >= 500) {
    const fps = (perfFrameCounter / perfWindowMs) * 1000;
    updatePerfHud({
      fps,
      frameMs: frameEnd - frameStart, // Total frame time (update + render)
      logicMs: logicEnd - frameStart, // Update time only
    });
    perfSampleStart = frameEnd;
    perfFrameCounter = 0;
    hasReportedPerfSample = true;
  }

  // Schedule next frame
  animationId = requestAnimationFrame((time) => gameLoop(canvas, time));
}

export function stopGameLoop(): void {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}
