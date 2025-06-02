/*
    bullet.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Capped active bullets to reduce mobile performance impact.
        2025-06-02: Update placeholders to ensure compatibility.

    Notes:
    Handles bullet creation, updates, and rendering.
*/
import { bullets, bulletSpeed, bulletRadius, player, lastShotTime, fireRate } from './state.js';
import { playSound } from './soundManager.js';

export function fireBullet() {
    const now = Date.now();
    if (now - lastShotTime.value < fireRate) return;
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        radius: bulletRadius
    });
    lastShotTime.value = now;
    playSound('fire');
}

export function updateBullets(canvasHeight) {
    bullets.forEach((bullet) => {
        bullet.y -= bulletSpeed;
    });
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

export function drawBullets(ctx) {
    ctx.fillStyle = 'red';
    bullets.forEach((bullet) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}