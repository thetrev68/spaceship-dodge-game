/*
    asteroid.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Handles asteroid creation, updates, rendering, and splitting upon bullet impact.
*/

import {
    obstacles,
    ASTEROID_LEVEL_SIZES,
    ASTEROID_SCORE_VALUES,
    BASE_OBSTACLE_MIN_SPEED,
    BASE_OBSTACLE_MAX_SPEED,
    SPEED_INCREASE_PER_LEVEL,
    gameLevel
} from './state.js';

let obstacleMinSpeed = BASE_OBSTACLE_MIN_SPEED;
let obstacleMaxSpeed = BASE_OBSTACLE_MAX_SPEED;

export function updateDifficulty(level) {
    obstacleMinSpeed = BASE_OBSTACLE_MIN_SPEED + (level * SPEED_INCREASE_PER_LEVEL);
    obstacleMaxSpeed = BASE_OBSTACLE_MAX_SPEED + (level * SPEED_INCREASE_PER_LEVEL);
}

export function generateAsteroidShape(radius, numPoints) {
    const points = [];
    const angleIncrement = (Math.PI * 2) / numPoints;
    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleIncrement;
        const r = radius * (0.8 + Math.random() * 0.4);
        points.push({
            x: r * Math.cos(angle),
            y: r * Math.sin(angle)
        });
    }
    return points;
}

export function createObstacle(x, y, levelIndex, initialDx = 0, initialDy = 0) {
    const radius = ASTEROID_LEVEL_SIZES[levelIndex];
    const scoreValue = ASTEROID_SCORE_VALUES[levelIndex];
    const numPoints = Math.floor(Math.random() * 6) + 5;
    const shape = generateAsteroidShape(radius, numPoints);

    obstacles.push({
        x, y, radius, scoreValue, shape,
        dx: initialDx,
        dy: initialDy,
        speed: Math.random() * (obstacleMaxSpeed - obstacleMinSpeed) + obstacleMinSpeed,
        level: levelIndex
    });
}

export function updateObstacles(canvasWidth, canvasHeight, spawnInterval, lastSpawnTimeRef) {
    const now = Date.now();
    for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i];
        o.y += o.speed + o.dy;
        o.x += o.dx;
        if (o.y > canvasHeight || o.x + o.radius * 2 < 0 || o.x > canvasWidth) {
            obstacles.splice(i, 1);
            i--;
        }
    }

    if (now - lastSpawnTimeRef.value > spawnInterval) {
        createObstacle(Math.random() * (canvasWidth - ASTEROID_LEVEL_SIZES[0] * 2), -ASTEROID_LEVEL_SIZES[0] * 2, 0);
        lastSpawnTimeRef.value = now;
    }
}

export function drawObstacles(ctx) {
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    obstacles.forEach(o => {
        ctx.beginPath();
        ctx.moveTo(o.x + o.radius + o.shape[0].x, o.y + o.radius + o.shape[0].y);
        for (let i = 1; i < o.shape.length; i++) {
            ctx.lineTo(o.x + o.radius + o.shape[i].x, o.y + o.radius + o.shape[i].y);
        }
        ctx.closePath();
        ctx.stroke();
    });
}