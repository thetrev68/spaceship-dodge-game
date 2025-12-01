// entities/bullet.js
/*
    entities/bullet.js
    Updated: 2025-06-06
    Author: ChatGPT + Trevor Clark
    Refactored: Phase 4 (Entities)

    Adds object pooling to optimize bullet memory reuse.
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

// Old getBullet function, now using object pool
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

// Old releaseBullet function, now using object pool
function releaseBullet(bullet) {
  bulletPool.release(bullet);
}

// Public API: Remove bullet from array and return to pool
export function despawnBullet(index) {
  if (index >= 0 && index < bullets.length) {
    const bullet = bullets.splice(index, 1)[0];
    releaseBullet(bullet);
  }
}

// Public API: Clear all bullets and return them to pool
export function clearAllBullets() {
  bullets.forEach(bullet => releaseBullet(bullet));
  bullets.length = 0;
}

export function fireBullet(x, y) {
  if (gameState.value !== 'PLAYING') return;

  const bullet = acquireBullet(x, y);
  bullets.push(bullet);

  // Throttle fire sound to match mobileControls.js
  const now = Date.now();
  const delay = isMobile ? 250 : 30; // 250ms on mobile to match fireCooldown
  if (now - lastFireSoundTime > delay) {
    playSound('fire');
    lastFireSoundTime = now;
  }
}

export function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y += b.dy;

    if (b.y + b.radius < 0) {
      bullets.splice(i, 1);
      releaseBullet(b);
    }
  }
}

export function drawBullets(ctx) {
  bullets.forEach(b => {
    ctx.drawImage(bulletSprite, b.x - bulletRadius, b.y - bulletRadius);
  });
}
