/*
    collisions.js
    Created: 2025-05-28
    Author: ChatGPT + [Your Name Here]

    Notes:
    Collision detection for bullets vs. asteroids and player vs. asteroids.
*/

import { bullets, obstacles, ASTEROID_LEVEL_SIZES } from './state.js';
import { createObstacle } from './asteroid.js';
import { player } from './state.js';
import { gameState } from './state.js';
import { endGame } from './loop.js';

export function checkPlayerObstacleCollisions() {
    obstacles.forEach(obstacle => {
        const left = obstacle.x;
        const right = obstacle.x + obstacle.radius * 2;
        const top = obstacle.y;
        const bottom = obstacle.y + obstacle.radius * 2;

        if (
            player.x < right &&
            player.x + player.width > left &&
            player.y < bottom &&
            player.y + player.height > top
        ) {
            endGame();
        }
    });
}

export function checkBulletObstacleCollisions(scoreRef) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (let j = obstacles.length - 1; j >= 0; j--) {
            const obstacle = obstacles[j];
            const distX = Math.abs(bullet.x - (obstacle.x + obstacle.radius));
            const distY = Math.abs(bullet.y - (obstacle.y + obstacle.radius));

            if (distX > (obstacle.radius + bullet.radius)) continue;
            if (distY > (obstacle.radius + bullet.radius)) continue;

            if (distX <= obstacle.radius || distY <= obstacle.radius) {
                bullets.splice(i, 1);
                if (obstacle.level < ASTEROID_LEVEL_SIZES.length - 1) {
                    const nextLevel = obstacle.level + 1;
                    const numNew = Math.floor(Math.random() * 2) + 2;
                    for (let k = 0; k < numNew; k++) {
                        const angle = Math.random() * Math.PI * 2;
                        const scatterSpeed = (Math.random() * 1.5) + 0.5;
                        const dx = Math.cos(angle) * scatterSpeed;
                        const dy = Math.sin(angle) * scatterSpeed;
                        createObstacle(obstacle.x + obstacle.radius, obstacle.y + obstacle.radius, nextLevel, dx, dy);
                    }
                }
                scoreRef.value += obstacle.scoreValue;
                obstacles.splice(j, 1);
                break;
            }
        }
    }
}