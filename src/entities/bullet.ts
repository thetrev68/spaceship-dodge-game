/**
 * @module entities/bullet
 * Bullet entity management with object pooling.
 * Adds object pooling to optimize bullet memory reuse.
 */

import type { Bullet } from '@types';
import { entityState, gameState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { BULLET_CONFIG } from '@core/constants.js';
import { ObjectPool } from '@systems/poolManager.js';
import { services } from '@services/ServiceProvider.js';
import { getCurrentTheme } from '@core/themes';

const bulletSpeed = BULLET_CONFIG.SPEED;
const bulletRadius = BULLET_CONFIG.RADIUS;

let lastFireSoundTime = 0;

// Pre-rendered bullet sprite canvas (will be regenerated when theme changes)
let bulletSprite: HTMLCanvasElement | null = null;
let currentBulletColor: string | null = null;

/**
 * Creates or updates the pre-rendered bullet sprite based on current theme.
 * Called lazily on first render or when theme changes.
 */
function ensureBulletSprite(): HTMLCanvasElement {
  const theme = getCurrentTheme();
  const bulletColor = theme.colors.bullet;

  // Regenerate sprite if theme changed
  if (!bulletSprite || currentBulletColor !== bulletColor) {
    if (!bulletSprite) {
      bulletSprite = document.createElement('canvas');
      bulletSprite.width = bulletRadius * 2;
      bulletSprite.height = bulletRadius * 2;
    }

    const bctx = bulletSprite.getContext('2d');
    if (bctx) {
      // Clear previous sprite
      bctx.clearRect(0, 0, bulletSprite.width, bulletSprite.height);

      // Render new sprite with theme color
      bctx.fillStyle = bulletColor;
      bctx.beginPath();
      bctx.arc(bulletRadius, bulletRadius, bulletRadius, 0, 2 * Math.PI);
      bctx.fill();

      currentBulletColor = bulletColor;
    }
  }

  return bulletSprite;
}

// Initialize object pool for bullets
const bulletPool = new ObjectPool<Bullet>(() => ({
  x: 0,
  y: 0,
  radius: bulletRadius,
  dy: 0,
  parentId: null,
}));
const bullets = entityState.getMutableBullets();

/**
 * Acquires a bullet from the pool.
 */
function acquireBullet(x: number, y: number): Bullet {
  const bullet = bulletPool.acquire();
  Object.assign(bullet, {
    x,
    y,
    radius: bulletRadius,
    dy: -bulletSpeed,
  });
  return bullet;
}

/**
 */
function releaseBullet(bullet: Bullet): void {
  bulletPool.release(bullet);
}

/**
 * Removes a bullet from the bullets array and returns it to the object pool.
 *
 * ## Performance
 * - Uses swap-and-pop for O(1) removal (swaps with last element, then pops)
 * - Returns bullet to pool for reuse (reduces GC pressure)
 * - Bounds checking prevents array access errors
 *
 * ## Usage
 * Called when bullet collides with asteroid or goes off-screen.
 * Typically called from collision handler, not directly.
 *
 * @param index - Index of bullet to remove from bullets array
 *
 * @example
 * ```typescript
 * // In collision handler
 * for (let i = bullets.length - 1; i >= 0; i--) {
 *   if (bulletHitAsteroid(bullets[i], asteroid)) {
 *     despawnBullet(i); // Remove and return to pool
 *     destroyAsteroid(asteroid);
 *     break;
 *   }
 * }
 * ```
 *
 * @see bulletPool - Object pool for bullet reuse
 */
export function despawnBullet(index: number): void {
  if (index >= 0 && index < bullets.length) {
    const bullet = bullets[index];
    if (!bullet) return;
    const last = bullets[bullets.length - 1];
    if (last) {
      bullets[index] = last;
    }
    bullets.pop();
    releaseBullet(bullet);
  }
}

/**
 * Clears all active bullets and returns them to the object pool.
 * Called on game reset or state transitions.
 *
 * ## Behavior
 * - Returns every bullet to pool for reuse
 * - Empties bullets array
 * - Prevents memory leaks by ensuring all bullets are pooled
 *
 * @example
 * ```typescript
 * // On game over
 * function resetGameState() {
 *   clearAllBullets();
 *   clearAllAsteroids();
 *   resetPlayer(canvas.width, canvas.height);
 *   gameState.value = 'START';
 * }
 * ```
 */
export function clearAllBullets(): void {
  bullets.forEach((bullet) => releaseBullet(bullet));
  bullets.length = 0;
}

/**
 * Fires a bullet from the specified position with sound effect.
 *
 * ## Behavior
 * - Acquires bullet from object pool (reuses if available)
 * - Sets initial position and upward velocity
 * - Plays fire sound effect (throttled to prevent audio spam)
 * - Only fires during PLAYING game state
 * - Enforces MAX_BULLETS cap to prevent DoS attacks
 *
 * ## Sound Throttling
 * - **Desktop:** Max 1 sound per 30ms (prevents overlap)
 * - **Mobile:** Disabled (saves audio processing overhead)
 * - Prevents audio channel exhaustion during rapid fire
 *
 * ## Object Pooling
 * Uses `bulletPool` to reuse bullet objects instead of creating new ones.
 * Dramatically reduces GC pressure during high fire rates (5-10 bullets/second).
 *
 * ## DoS Prevention
 * - Hard cap of MAX_BULLETS (500) prevents memory exhaustion
 * - Silently discards bullets beyond cap (no error thrown)
 * - Prevents attack via holding fire button continuously
 *
 * @param x - Horizontal spawn position (typically player center X)
 * @param y - Vertical spawn position (typically player top Y)
 *
 * @example
 * ```typescript
 * // Single bullet fire
 * fireBullet(player.x + player.width / 2, player.y);
 *
 * // Double blaster powerup
 * if (hasDoubleBlaster) {
 *   const spread = 10; // pixels
 *   fireBullet(player.x + player.width / 2 - spread, player.y);
 *   fireBullet(player.x + player.width / 2 + spread, player.y);
 * }
 * ```
 *
 * @see BULLET_CONFIG.SPEED - Bullet velocity (-8 pixels/frame)
 * @see BULLET_CONFIG.MAX_BULLETS - Maximum bullet count (500)
 * @see bulletPool - Object pool for bullet reuse
 */
export function fireBullet(x: number, y: number): void {
  if (gameState.value !== 'PLAYING') return;

  // DoS prevention: enforce hard cap on bullet count
  if (bullets.length >= BULLET_CONFIG.MAX_BULLETS) return;

  const bullet = acquireBullet(x, y);
  bullets.push(bullet);

  // Throttle fire sound; skip on mobile to avoid audio overhead
  const now = Date.now();
  const delay = isMobile() ? 400 : 30; // slower cadence on mobile
  if (!isMobile() && now - lastFireSoundTime > delay) {
    services.audioService.playSound('fire');
    lastFireSoundTime = now;
  }
}

/**
 * Updates all bullet positions and removes off-screen bullets.
 * Called every frame during PLAYING game state.
 *
 * ## Update Logic
 * 1. Apply velocity to bullet Y position (upward movement)
 * 2. Check if bullet is off-screen (Y + radius < 0)
 * 3. If off-screen: Remove using swap-and-pop, return to pool
 *
 * ## Performance
 * - Iterates backwards to safely remove during iteration
 * - Swap-and-pop for O(1) removal
 * - Returns bullets to pool (reduces GC)
 *
 * ## Off-Screen Detection
 * Bullet is considered off-screen when its bottom edge (`y + radius`) is above
 * the top of the canvas (< 0). This ensures bullet is fully offscreen before removal.
 *
 * @example
 * ```typescript
 * // In game loop
 * function gameLoop() {
 *   if (gameState.value === 'PLAYING') {
 *     updatePlayer();
 *     updateBullets(); // Move and remove off-screen
 *     updateObstacles();
 *     checkCollisions();
 *     renderAll();
 *   }
 *   requestAnimationFrame(gameLoop);
 * }
 * ```
 */
export function updateBullets(): void {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b) continue;
    b.y += b.dy;

    if (b.y + b.radius < 0) {
      // Swap and pop
      const last = bullets[bullets.length - 1];
      if (last) {
        bullets[i] = last;
      }
      bullets.pop();
      releaseBullet(b);
    }
  }
}

/**
 * Renders all bullets to the canvas using pre-rendered sprite.
 *
 * ## Rendering Technique
 * - Uses pre-rendered canvas sprite for maximum performance
 * - Single `drawImage()` call per bullet (faster than arc/fill)
 * - Sprite created once at module initialization
 *
 * ## Performance
 * - `drawImage()` is ~3x faster than `arc() + fill()` for circles
 * - Pre-rendering eliminates repeated drawing operations
 * - Ideal for high-frequency entities (10-20 bullets on screen)
 *
 * ## Sprite Details
 * - Yellow filled circle (#ffff88)
 * - Radius from BULLET_CONFIG.RADIUS (typically 3px)
 * - Canvas size: 2 * radius (6x6px)
 *
 * @param ctx - Canvas 2D rendering context
 *
 * @example
 * ```typescript
 * // In render loop
 * function renderAll(ctx: CanvasRenderingContext2D) {
 *   ctx.clearRect(0, 0, canvas.width, canvas.height);
 *   drawStarfield(ctx);
 *   drawObstacles(ctx);
 *   drawPlayer(ctx);
 *   drawBullets(ctx); // Render bullets with sprite
 *   drawHUD(ctx);
 * }
 * ```
 */
export function drawBullets(ctx: CanvasRenderingContext2D): void {
  const sprite = ensureBulletSprite();
  bullets.forEach((b) => {
    ctx.drawImage(sprite, b.x - bulletRadius, b.y - bulletRadius);
  });
}
