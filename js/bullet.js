/*
    bullet.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Handles bullet creation, updating position, drawing, and firing sound.
*/

import { bullets, bulletSpeed, bulletRadius, player, gameState } from './state.js';
import { playSound } from './soundManager.js';

export function fireBullet() {
  if (gameState.value !== 'PLAYING') return;

  bullets.push({
    x: player.x + player.width / 2,
    y: player.y,
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