/*
    bullet.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Capped active bullets to reduce mobile performance impact.

    Notes:
    Handles bullet creation, updates, and rendering.
*/

import { bullets, bulletSpeed, bulletRadius, lastShotTime, player } from './state.js';
import { playSound } from './soundManager.js';

const MAX_BULLETS = 25;

export function fireBullet() {
    console.log(`fireBullet called: bullets = ${bullets.length}`);
    const currentTime = Date.now();
    if (currentTime - lastShotTime.value > 100 && bullets.length < MAX_BULLETS) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y,
            radius: bulletRadius,
            speed: bulletSpeed
        });
        lastShotTime.value = currentTime;
        playSound('fire');
    }
}

export function updateBullets(canvasHeight) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y + bullets[i].radius < 0) {
            bullets.splice(i, 1);
        }
    }
}

export function drawBullets(ctx) {
    ctx.fillStyle = bullets.length > 25 ? '#ff0000' : '#00ff00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}