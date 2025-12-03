/**
 * @fileoverview Asteroid entity management with object pooling.
 * Adds object pooling to optimize asteroid memory reuse.
 */

import type { Asteroid, Vector2 } from '@types';
import {
  GAME_CONFIG,
  ASTEROID_CONFIG,
  MOBILE_CONFIG,
} from '@core/constants.js';

import { entityState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { randomInt, randomFloat } from '@utils/mathUtils.js';
import { ObjectPool } from '@systems/poolManager.js';
import { addScorePopup } from '@ui/hud/scorePopups.js';
import { playSound } from '@systems/soundManager.js';

const obstacleMinSpeed = ASTEROID_CONFIG.BASE_MIN_SPEED;
let nextAsteroidId = 1;
const fragmentTracker: Record<number, number> = {};
const obstacleMaxSpeed = ASTEROID_CONFIG.BASE_MAX_SPEED;
const MOBILE_OBSTACLE_CAP = 14;

// Initialize object pool
const obstaclePool = new ObjectPool<Asteroid>(() => ({
  x: 0,
  y: 0,
  radius: 0,
  dx: 0,
  dy: 0,
  id: 0,
  level: 0,
  parentId: null,
  scoreValue: 0,
  creationTime: 0,
  rotation: 0,
  rotationSpeed: 0,
  speed: 0,
  shape: [],
}));
const obstacles = entityState.getMutableObstacles();

/**
 * Count of new asteroids spawned.
 * @type {number}
 */
export let newAsteroidsSpawned = 0;

/**
 * Resets the count of new asteroids spawned.
 */
export function resetNewAsteroidsSpawned(): void {
  newAsteroidsSpawned = 0;
}

function generateAsteroidShape(radius: number, numPoints: number): Vector2[] {
  const points: Vector2[] = [];
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

function createObstacle(
  x: number,
  y: number,
  levelIndex: number,
  initialDx = 0,
  initialDy = 0,
  parentId: number | null = null
): Asteroid {
  const radius = ASTEROID_CONFIG.LEVEL_SIZES[levelIndex] ?? 0;
  const scoreValue = ASTEROID_CONFIG.SCORE_VALUES[levelIndex] ?? 0;
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

  return obstacle;
}

export function updateObstacles(
  canvasWidth: number,
  canvasHeight: number,
  spawnInterval: number,
  lastSpawnTimeRef: { value: number },
  allowSpawning = true
): void {
  const now = Date.now();

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (!o) continue;

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
      // Swap and pop for O(1) removal
      const removed = obstacles[i];
      if (!removed) {
        continue;
      }
      const last = obstacles.pop();
      if (last && last !== removed) {
        obstacles[i] = last;
        i--; // Process the swapped element in the next iteration
      } else {
        i--; // Removed last element, adjust for loop increment
      }

      // Decrement fragmentTracker for expired fragments
      const parentId = removed.parentId;
      if (
        parentId != null &&
        removed.level === ASTEROID_CONFIG.LEVEL_SIZES.length - 1 &&
        typeof fragmentTracker[parentId] === 'number'
      ) {
        fragmentTracker[parentId]--;
        if ((fragmentTracker[parentId] ?? 0) <= 0) {
          delete fragmentTracker[parentId];
        }
      }

      obstaclePool.release(removed);
    }
  }

  if (
    allowSpawning &&
    now - lastSpawnTimeRef.value > spawnInterval &&
    (!isMobile() || obstacles.length < MOBILE_OBSTACLE_CAP)
  ) {
    const spawnRadius = ASTEROID_CONFIG.LEVEL_SIZES[0] ?? 0;
    createObstacle(Math.random() * (canvasWidth - spawnRadius * 2), -spawnRadius * 2, 0);
    lastSpawnTimeRef.value = now;
  }
}

export function drawObstacles(ctx: CanvasRenderingContext2D): void {
  if (obstacles.length === 0) return;

  ctx.strokeStyle = '#ff4500';
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (!o) continue;
    const cx = o.x + o.radius;
    const cy = o.y + o.radius;
    const cos = Math.cos(o.rotation);
    const sin = Math.sin(o.rotation);

    // Transform first point
    const p0 = o.shape[0];
    if (!p0) continue;
    const startX = p0.x * cos - p0.y * sin + cx;
    const startY = p0.x * sin + p0.y * cos + cy;

    ctx.moveTo(startX, startY);

    for (let j = 1; j < o.shape.length; j++) {
      const p = o.shape[j];
      if (!p) continue;
      const px = p.x * cos - p.y * sin + cx;
      const py = p.x * sin + p.y * cos + cy;
      ctx.lineTo(px, py);
    }
    
    // Close the shape
    ctx.lineTo(startX, startY);
  }

  ctx.stroke();
}

export function destroyObstacle(obstacle: Asteroid, scoreRef: { value: number }): void {
  const idx = obstacles.indexOf(obstacle);
  if (idx === -1) return;

  // Swap and pop for O(1) removal
  const last = obstacles.pop();
  if (last && last !== obstacle) {
    obstacles[idx] = last;
  }

  obstaclePool.release(obstacle);
  playSound('break');

  if (obstacle.level < ASTEROID_CONFIG.LEVEL_SIZES.length - 1) {
    const nextLevel = obstacle.level + 1;
    const fragmentsMin = isMobile() ? 1 : ASTEROID_CONFIG.FRAGMENTS_MIN;
    const fragmentsMax = isMobile() ? 2 : ASTEROID_CONFIG.FRAGMENTS_MAX;
    const numNew = randomInt(fragmentsMin, fragmentsMax);
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
    const parentId = obstacle.parentId;
    const count = fragmentTracker[parentId];
    if (typeof count === 'number') {
      const nextCount = count - 1;
      if (nextCount <= 0) {
        scoreRef.value += ASTEROID_CONFIG.FRAGMENT_BONUS;
        addScorePopup(`+${ASTEROID_CONFIG.FRAGMENT_BONUS} (All Fragments)`, obstacle.x, obstacle.y - 10, '#00ff00');
        delete fragmentTracker[parentId];
      } else {
        fragmentTracker[parentId] = nextCount;
      }
    }
  }
}
