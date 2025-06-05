// js/bullet.js
// Bullet management module 

import { bullets, bulletSpeed, bulletRadius, gameState } from './state.js';
import { playSound } from './soundManager.js';

// Accept x,y parameters for bullet spawn position
export function fireBullet(x, y) {
  if (gameState.value !== 'PLAYING') return;

  bullets.push({
    x,
    y,
    radius: bulletRadius,
    dy: -bulletSpeed,
  });

  playSound('fire');
}

export function updateBullets(canvasHeight) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y += b.dy;

    if (b.y + b.radius < 0) {
      bullets.splice(i, 1); // Remove bullet off screen
    }
  }
}

export function drawBullets(ctx) {
  ctx.fillStyle = '#ffff88'; // Light yellow color for bullets
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}
