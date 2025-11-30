/*
    asteroid.js
    Updated: 2025-06-06
    Author: ChatGPT + Trevor Clark

    Adds object pooling to optimize asteroid memory reuse.
*/

import { 
    GAME_CONFIG,
    ASTEROID_CONFIG,
    LEVEL_CONFIG,
    MOBILE_CONFIG
} from './constants.js';

import {
    obstacles,
    isMobile
} from './state.js';

import { addScorePopup } from './scorePopups.js';
import { playSound } from './soundManager.js';

let obstacleMinSpeed = ASTEROID_CONFIG.BASE_MIN_SPEED;
let nextAsteroidId = 1;
// TODO: Currently exported but only used internally - consider making private
export const fragmentTracker = {};
let obstacleMaxSpeed = ASTEROID_CONFIG.BASE_MAX_SPEED;

const obstaclePool = []; // ♻️ Object pool

export let newAsteroidsSpawned = 0;

export function resetNewAsteroidsSpawned() {
  newAsteroidsSpawned = 0;
}

function easeInCubic(t) {
  return t * t * t;
}

// TODO: Currently unused - could be called from flowManager for progressive difficulty
export function updateDifficulty(level) {
  if (level <= LEVEL_CONFIG.DIFFICULTY_SCALE_THRESHOLD) {
    const normalizedLevel = level / LEVEL_CONFIG.DIFFICULTY_SCALE_THRESHOLD;
    const scale = easeInCubic(normalizedLevel);
    obstacleMinSpeed = ASTEROID_CONFIG.BASE_MIN_SPEED + scale * ASTEROID_CONFIG.SPEED_INCREASE_PER_LEVEL * 0.5;
    obstacleMaxSpeed = Math.min(ASTEROID_CONFIG.BASE_MAX_SPEED + scale * ASTEROID_CONFIG.SPEED_INCREASE_PER_LEVEL * 0.5, ASTEROID_CONFIG.MAX_SPEED);
  } else {
    const scale = Math.log(level + 1);
    obstacleMinSpeed = ASTEROID_CONFIG.BASE_MIN_SPEED + scale * ASTEROID_CONFIG.SPEED_INCREASE_PER_LEVEL * 0.7;
    obstacleMaxSpeed = Math.min(ASTEROID_CONFIG.BASE_MAX_SPEED + scale * ASTEROID_CONFIG.SPEED_INCREASE_PER_LEVEL * 0.7, ASTEROID_CONFIG.MAX_SPEED);
  }
}

// TODO: Currently used internally only - consider making private or exposing for custom shapes
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

// TODO: Used internally by updateObstacles - consider making private
export function createObstacle(x, y, levelIndex, initialDx = 0, initialDy = 0, parentId = null) {
  const radius = ASTEROID_CONFIG.LEVEL_SIZES[levelIndex];
  const scoreValue = ASTEROID_CONFIG.SCORE_VALUES[levelIndex];
  const basePoints = Math.floor(Math.random() * (ASTEROID_CONFIG.SHAPE_POINTS_MAX - ASTEROID_CONFIG.SHAPE_POINTS_MIN + 1)) + ASTEROID_CONFIG.SHAPE_POINTS_MIN;
  const numPoints = isMobile ? Math.min(basePoints, MOBILE_CONFIG.MAX_SHAPE_POINTS) : basePoints;
  const shape = generateAsteroidShape(radius, numPoints);

  const id = nextAsteroidId++;
  if (parentId === null) {
    fragmentTracker[id] = 0;
  }
  const assignedParentId = parentId ?? id;
  if (typeof fragmentTracker[assignedParentId] === 'undefined') {
    fragmentTracker[assignedParentId] = 0;
  }
  if (levelIndex === ASTEROID_CONFIG.LEVEL_SIZES.length - 1) {
    fragmentTracker[assignedParentId]++;
  }

  const baseSpeed = Math.random() * (obstacleMaxSpeed - obstacleMinSpeed) + obstacleMinSpeed;
  const speed = parentId === null ? baseSpeed : baseSpeed * ASTEROID_CONFIG.FRAGMENT_SPEED_MULTIPLIER;
  const rotation = Math.random() * 2 * Math.PI;
  const rotationSpeed = (Math.random() * (ASTEROID_CONFIG.ROTATION_SPEED_MAX - ASTEROID_CONFIG.ROTATION_SPEED_MIN)) + ASTEROID_CONFIG.ROTATION_SPEED_MIN;
  const now = Date.now();

  const obstacle = obstaclePool.length > 0 ? obstaclePool.pop() : {};

  Object.assign(obstacle, {
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
    creationTime: now,
  });

  obstacles.push(obstacle);

  if (levelIndex === 0) {
    newAsteroidsSpawned++;
  }
}

export function updateObstacles(canvasWidth, canvasHeight, spawnInterval, lastSpawnTimeRef, allowSpawning = true) {
  const now = Date.now();

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];

    if (!o.creationTime) o.creationTime = now;

    o.y += o.speed + o.dy;
    o.x += o.dx;
    o.rotation = (o.rotation + o.rotationSpeed) % (2 * Math.PI);

    const outOfBounds =
      o.y > canvasHeight + GAME_CONFIG.SPAWN_MARGIN ||
      o.x + o.radius * 2 < -GAME_CONFIG.SPAWN_MARGIN ||
      o.x > canvasWidth + GAME_CONFIG.SPAWN_MARGIN;

    const tooOld = now - o.creationTime > GAME_CONFIG.MAX_LIFETIME;

    if (outOfBounds || tooOld) {
      const [removed] = obstacles.splice(i, 1);
      obstaclePool.push(removed); // ♻️ Return to pool
      i--;
    }
  }

  if (allowSpawning && now - lastSpawnTimeRef.value > spawnInterval) {
    createObstacle(
      Math.random() * (canvasWidth - ASTEROID_CONFIG.LEVEL_SIZES[0] * 2),
      -ASTEROID_CONFIG.LEVEL_SIZES[0] * 2,
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

export function destroyObstacle(obstacle, scoreRef) {
  const idx = obstacles.indexOf(obstacle);
  if (idx === -1) return;

  obstacles.splice(idx, 1);
  obstaclePool.push(obstacle); // ♻️ Return to pool
  playSound('break');

  if (obstacle.level < ASTEROID_CONFIG.LEVEL_SIZES.length - 1) {
    const nextLevel = obstacle.level + 1;
    const numNew = Math.floor(Math.random() * (ASTEROID_CONFIG.FRAGMENTS_MAX - ASTEROID_CONFIG.FRAGMENTS_MIN + 1)) + ASTEROID_CONFIG.FRAGMENTS_MIN;
    for (let k = 0; k < numNew; k++) {
      const angle = Math.random() * Math.PI * 2;
      const scatterSpeed = Math.random() < 0.8
        ? (Math.random() * 0.7) + 0.3
        : (Math.random() * 1.5) + 1.0;
      const dx = Math.cos(angle) * scatterSpeed;
      const dy = Math.sin(angle) * scatterSpeed;
      createObstacle(
        obstacle.x + obstacle.radius,
        obstacle.y + obstacle.radius,
        nextLevel,
        dx,
        dy,
        obstacle.parentId ?? obstacle.id
      );
    }
  }

  scoreRef.value += obstacle.scoreValue;
  addScorePopup(`+${obstacle.scoreValue}`, obstacle.x + obstacle.radius, obstacle.y);

  if (obstacle.parentId !== null && obstacle.level === ASTEROID_CONFIG.LEVEL_SIZES.length - 1) {
    fragmentTracker[obstacle.parentId]--;
    if (fragmentTracker[obstacle.parentId] === 0) {
      scoreRef.value += ASTEROID_CONFIG.FRAGMENT_BONUS;
      addScorePopup(`+${ASTEROID_CONFIG.FRAGMENT_BONUS} (All Fragments)`, obstacle.x, obstacle.y - 10, '#00ff00');
      delete fragmentTracker[obstacle.parentId];
    }
  }
}