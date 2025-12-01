/*
    entities/asteroid.js
    Updated: 2025-06-06
    Author: ChatGPT + Trevor Clark
    Refactored: Phase 4 (Entities)

    Adds object pooling to optimize asteroid memory reuse.
*/

import {

    GAME_CONFIG,

    ASTEROID_CONFIG,

    MOBILE_CONFIG

} from '@core/constants.js';



import { obstacles } from '@core/state.js';

import { isMobile } from '@utils/platform.js';

import { randomInt, randomFloat } from '@utils/mathUtils.js';

import { ObjectPool } from '@systems/poolManager.js';
import { addScorePopup } from '@ui/hud/scorePopups.js';
import { playSound } from '@systems/soundManager.js';

let obstacleMinSpeed = ASTEROID_CONFIG.BASE_MIN_SPEED;
let nextAsteroidId = 1;
const fragmentTracker = {};
let obstacleMaxSpeed = ASTEROID_CONFIG.BASE_MAX_SPEED;

// Initialize object pool
const obstaclePool = new ObjectPool(() => ({}));

export let newAsteroidsSpawned = 0;

export function resetNewAsteroidsSpawned() {
  newAsteroidsSpawned = 0;
}

// Private: Generate asteroid shape
function generateAsteroidShape(radius, numPoints) {
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

// Private: Create and spawn a single obstacle
function createObstacle(x, y, levelIndex, initialDx = 0, initialDy = 0, parentId = null) {
  const radius = ASTEROID_CONFIG.LEVEL_SIZES[levelIndex];
  const scoreValue = ASTEROID_CONFIG.SCORE_VALUES[levelIndex];
  const basePoints = randomInt(ASTEROID_CONFIG.SHAPE_POINTS_MIN, ASTEROID_CONFIG.SHAPE_POINTS_MAX);
  const numPoints = isMobile() ? Math.min(basePoints, MOBILE_CONFIG.MAX_SHAPE_POINTS) : basePoints;
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

  const baseSpeed = randomFloat(obstacleMinSpeed, obstacleMaxSpeed);
  const speed = parentId === null ? baseSpeed : baseSpeed * ASTEROID_CONFIG.FRAGMENT_SPEED_MULTIPLIER;
  const rotation = Math.random() * 2 * Math.PI;
  const rotationSpeed = randomFloat(ASTEROID_CONFIG.ROTATION_SPEED_MIN, ASTEROID_CONFIG.ROTATION_SPEED_MAX);
  const now = Date.now();

  // Use the pool manager
  const obstacle = obstaclePool.acquire();

  // Reset properties
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

      // Decrement fragmentTracker for expired fragments
      if (
        removed.parentId != null &&
        removed.level === ASTEROID_CONFIG.LEVEL_SIZES.length - 1 &&
        typeof fragmentTracker[removed.parentId] === 'number'
      ) {
        fragmentTracker[removed.parentId]--;
        if (fragmentTracker[removed.parentId] <= 0) {
          delete fragmentTracker[removed.parentId];
        }
      }

      obstaclePool.release(removed);
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
  obstaclePool.release(obstacle);
  playSound('break');

  if (obstacle.level < ASTEROID_CONFIG.LEVEL_SIZES.length - 1) {
    const nextLevel = obstacle.level + 1;
    const numNew = randomInt(ASTEROID_CONFIG.FRAGMENTS_MIN, ASTEROID_CONFIG.FRAGMENTS_MAX);
    for (let k = 0; k < numNew; k++) {
      const angle = Math.random() * Math.PI * 2;
      const scatterSpeed = Math.random() < 0.8
        ? randomFloat(0.3, 1.0)
        : randomFloat(1.0, 2.5);
      // Inherit parent velocity plus random scatter
      const dx = obstacle.dx + Math.cos(angle) * scatterSpeed;
      const dy = obstacle.dy + Math.sin(angle) * scatterSpeed;
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
