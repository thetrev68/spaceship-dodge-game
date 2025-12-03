/**
 * @fileoverview Bullet entity management with object pooling.
 * Adds object pooling to optimize bullet memory reuse.
 */

import type { Bullet } from '@types';
import { entityState, gameState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { BULLET_CONFIG } from '@core/constants.js';
import { ObjectPool } from '@systems/poolManager.js';
import { playSound } from '@systems/soundManager.js';

const bulletSpeed = BULLET_CONFIG.SPEED;
const bulletRadius = BULLET_CONFIG.RADIUS;

let lastFireSoundTime = 0;

// Pre-rendered bullet sprite canvas
const bulletSprite = document.createElement('canvas');
bulletSprite.width = bulletRadius * 2;
bulletSprite.height = bulletRadius * 2;
const bctx = bulletSprite.getContext('2d');
if (bctx) {
  bctx.fillStyle = '#ffff88';
  bctx.beginPath();
  bctx.arc(bulletRadius, bulletRadius, bulletRadius, 0, 2 * Math.PI);
  bctx.fill();
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
 * Removes a bullet from the array and returns it to the pool.
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
 * Clears all bullets and returns them to the pool.
 */
export function clearAllBullets(): void {
  bullets.forEach(bullet => releaseBullet(bullet));
  bullets.length = 0;
}

/**
 * Fires a bullet from the given position.
 */
export function fireBullet(x: number, y: number): void {
  if (gameState.value !== 'PLAYING') return;

  const bullet = acquireBullet(x, y);
  bullets.push(bullet);

  // Throttle fire sound; skip on mobile to avoid audio overhead
  const now = Date.now();
  const delay = isMobile() ? 400 : 30; // slower cadence on mobile
  if (!isMobile() && now - lastFireSoundTime > delay) {
    playSound('fire');
    lastFireSoundTime = now;
  }
}

/**
 * Updates all bullets, removing those off-screen.
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
 * Draws all bullets on the canvas.
 */
export function drawBullets(ctx: CanvasRenderingContext2D): void {
  bullets.forEach(b => {
    ctx.drawImage(bulletSprite, b.x - bulletRadius, b.y - bulletRadius);
  });
}
