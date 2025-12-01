/**
 * @fileoverview Bullet entity management with object pooling.
 * Adds object pooling to optimize bullet memory reuse.
 */

import { bullets, gameState } from '@core/state.js';
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
bctx.fillStyle = '#ffff88';
bctx.beginPath();
bctx.arc(bulletRadius, bulletRadius, bulletRadius, 0, 2 * Math.PI);
bctx.fill();

// Initialize object pool for bullets
const bulletPool = new ObjectPool(() => ({}));

/**
 * Acquires a bullet from the pool.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @returns {Object} The bullet object.
 */
function acquireBullet(x, y) {
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
 * Releases a bullet back to the pool.
 * @param {Object} bullet - The bullet to release.
 */
function releaseBullet(bullet) {
  bulletPool.release(bullet);
}

/**
 * Removes a bullet from the array and returns it to the pool.
 * @param {number} index - Index of the bullet to despawn.
 */
export function despawnBullet(index) {
  if (index >= 0 && index < bullets.length) {
    const bullet = bullets[index];
    bullets[index] = bullets[bullets.length - 1];
    bullets.pop();
    releaseBullet(bullet);
  }
}

/**
 * Clears all bullets and returns them to the pool.
 */
export function clearAllBullets() {
  bullets.forEach(bullet => releaseBullet(bullet));
  bullets.length = 0;
}

/**
 * Fires a bullet from the given position.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 */
export function fireBullet(x, y) {
  if (gameState.value !== 'PLAYING') return;

  const bullet = acquireBullet(x, y);
  bullets.push(bullet);

  // Throttle fire sound to match mobileControls.js
  const now = Date.now();
  const delay = isMobile() ? 250 : 30; // 250ms on mobile to match fireCooldown
  if (now - lastFireSoundTime > delay) {
    playSound('fire');
    lastFireSoundTime = now;
  }
}

/**
 * Updates all bullets, removing those off-screen.
 */
export function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y += b.dy;

    if (b.y + b.radius < 0) {
      // Swap and pop
      bullets[i] = bullets[bullets.length - 1];
      bullets.pop();
      releaseBullet(b);
    }
  }
}

/**
 * Draws all bullets on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
export function drawBullets(ctx) {
  bullets.forEach(b => {
    ctx.drawImage(bulletSprite, b.x - bulletRadius, b.y - bulletRadius);
  });
}
