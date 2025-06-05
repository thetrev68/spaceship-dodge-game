/*
    asteroid.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Added spinning rotation to asteroids.
        Maintains off-screen margin and lifetime cleanup to prevent stuck asteroids.
        Eased speed scaling with fragment speed adjustment.
*/

import {
    obstacles,
    ASTEROID_LEVEL_SIZES,
    ASTEROID_SCORE_VALUES,
    BASE_OBSTACLE_MIN_SPEED,
    BASE_OBSTACLE_MAX_SPEED,
    SPEED_INCREASE_PER_LEVEL,
    isMobile
} from './state.js';

let obstacleMinSpeed = BASE_OBSTACLE_MIN_SPEED;
let nextAsteroidId = 1;
export const fragmentTracker = {};
let obstacleMaxSpeed = BASE_OBSTACLE_MAX_SPEED;

const MAX_OBSTACLE_SPEED = 3;

function easeInCubic(t) {
  return t * t * t;
}

export function updateDifficulty(level) {
  if (level <= 5) {
    const normalizedLevel = level / 5;
    const scale = easeInCubic(normalizedLevel);
    obstacleMinSpeed = BASE_OBSTACLE_MIN_SPEED + scale * SPEED_INCREASE_PER_LEVEL * 0.5;
    obstacleMaxSpeed = Math.min(BASE_OBSTACLE_MAX_SPEED + scale * SPEED_INCREASE_PER_LEVEL * 0.5, MAX_OBSTACLE_SPEED);
  } else {
    const scale = Math.log(level + 1);
    obstacleMinSpeed = BASE_OBSTACLE_MIN_SPEED + scale * SPEED_INCREASE_PER_LEVEL * 0.7;
    obstacleMaxSpeed = Math.min(BASE_OBSTACLE_MAX_SPEED + scale * SPEED_INCREASE_PER_LEVEL * 0.7, MAX_OBSTACLE_SPEED);
  }
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

export function createObstacle(x, y, levelIndex, initialDx = 0, initialDy = 0, parentId = null) {
  const radius = ASTEROID_LEVEL_SIZES[levelIndex];
  const scoreValue = ASTEROID_SCORE_VALUES[levelIndex];
  const basePoints = Math.floor(Math.random() * 6) + 5;
  const numPoints = isMobile ? Math.min(basePoints, 5) : basePoints;

  const shape = generateAsteroidShape(radius, numPoints);

  const id = nextAsteroidId++;
  if (parentId === null) {
    fragmentTracker[id] = 0;
  }
  const assignedParentId = parentId ?? id;
  if (typeof fragmentTracker[assignedParentId] === 'undefined') {
    fragmentTracker[assignedParentId] = 0;
  }
  if (levelIndex === ASTEROID_LEVEL_SIZES.length - 1) {
    fragmentTracker[assignedParentId]++;
  }

  const baseSpeed = Math.random() * (obstacleMaxSpeed - obstacleMinSpeed) + obstacleMinSpeed;
  const speed = parentId === null ? baseSpeed : baseSpeed * 0.3;

  const rotation = Math.random() * 2 * Math.PI;
  const rotationSpeed = (Math.random() * 0.01) - 0.05; // Faster spin: -0.05 to +0.05 radians/frame
  const now = Date.now();

  obstacles.push({
    x,
    y,
    radius,
    speed,
    dx: initialDx,
    dy: initialDy,
    shape,
    level: levelIndex,
    scoreValue,
    id,
    parentId: assignedParentId,
    rotation,
    rotationSpeed,
    creationTime: now,  // Added creationTime here
  });
}

export function updateObstacles(canvasWidth, canvasHeight, spawnInterval, lastSpawnTimeRef, allowSpawning = true) {
  const now = Date.now();
  const margin = 100;         // Margin beyond canvas for removal
  const maxLifetime = 30000; // 30 seconds max lifetime

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];

    if (!o.creationTime) {
      o.creationTime = now;
    }

    o.y += o.speed + o.dy;
    o.x += o.dx;

    // Update rotation for spinning
    o.rotation = (o.rotation + o.rotationSpeed) % (2 * Math.PI);

    const outOfBounds =
      o.y > canvasHeight + margin ||
      o.x + o.radius * 2 < -margin ||
      o.x > canvasWidth + margin;

    const tooOld = now - o.creationTime > maxLifetime;

    if (outOfBounds || tooOld) {
      obstacles.splice(i, 1);
      i--;
    }
  }

  if (allowSpawning && now - lastSpawnTimeRef.value > spawnInterval) {
    createObstacle(
      Math.random() * (canvasWidth - ASTEROID_LEVEL_SIZES[0] * 2),
      -ASTEROID_LEVEL_SIZES[0] * 2,
      0
    );
    lastSpawnTimeRef.value = now;
  }
}

export function drawObstacles(ctx) {
  ctx.strokeStyle = '#ff4500';
  ctx.lineWidth = 2;
  obstacles.forEach(o => {
    ctx.save();
    ctx.translate(o.x + o.radius, o.y + o.radius);
    ctx.rotate(o.rotation);
    ctx.beginPath();
    ctx.moveTo(o.shape[0].x, o.shape[0].y);
    for (let i = 1; i < o.shape.length; i++) {
      ctx.lineTo(o.shape[i].x, o.shape[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  });
}