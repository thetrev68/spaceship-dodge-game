// js/bullet.js

import { bullets, bulletSpeed, bulletRadius, gameState, isMobile } from './state.js';
import { playSound } from './soundManager.js';

const bulletPool = [];
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

function getBullet(x, y) {
  const bullet = bulletPool.length > 0 ? bulletPool.pop() : {};
  bullet.x = x;
  bullet.y = y;
  bullet.radius = bulletRadius;
  bullet.dy = -bulletSpeed;
  return bullet;
}

function releaseBullet(bullet) {
  bulletPool.push(bullet);
}

export function fireBullet(x, y) {
  if (gameState.value !== 'PLAYING') return;

  const bullet = getBullet(x, y);
  bullets.push(bullet);

  // Throttle fire sound to match mobileControls.js
  const now = Date.now();
  const delay = isMobile ? 250 : 30; // 250ms on mobile to match fireCooldown
  if (now - lastFireSoundTime > delay) {
    playSound('fire');
    lastFireSoundTime = now;
  }
}

export function updateBullets(canvasHeight) {
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