/**
 * @module entities/asteroid
 * Asteroid entity management with object pooling.
 * Adds object pooling to optimize asteroid memory reuse.
 */

import type { Asteroid, Vector2 } from '@types';
import { GAME_CONFIG, ASTEROID_CONFIG, MOBILE_CONFIG } from '@core/constants.js';

import { entityState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { randomInt, randomFloat } from '@utils/mathUtils.js';
import { ObjectPool } from '@systems/poolManager.js';
import { services } from '@services/ServiceProvider.js';

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
 * Counter tracking the number of new (top-level) asteroids spawned this session.
 * Does not include fragments - only asteroids spawned from screen edges.
 * Used for level progression gating (wait until asteroids clear before level-up).
 *
 * @type {number}
 */
export let newAsteroidsSpawned = 0;

/**
 * Resets the new asteroid spawn counter to zero.
 * Called when starting a new game or resetting level progression state.
 *
 * @example
 * ```typescript
 * // On game start
 * resetNewAsteroidsSpawned();
 * startGame();
 * ```
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
      y: r * Math.sin(angle),
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
  const speed =
    parentId === null ? baseSpeed : baseSpeed * ASTEROID_CONFIG.FRAGMENT_SPEED_MULTIPLIER;
  const rotation = Math.random() * 2 * Math.PI;
  const rotationSpeed = randomFloat(
    ASTEROID_CONFIG.ROTATION_SPEED_MIN,
    ASTEROID_CONFIG.ROTATION_SPEED_MAX
  );
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

/**
 * Updates all asteroid positions, handles off-screen removal, and spawns new asteroids.
 *
 * ## Update Logic
 * 1. Move asteroids (apply velocity and rotation)
 * 2. Remove off-screen or expired asteroids
 * 3. Spawn new asteroids from top edge (if spawn conditions met)
 *
 * ## Spawning Conditions
 * - `allowSpawning` flag is true (gates spawning during level transitions)
 * - Enough time elapsed since last spawn (`spawnInterval`)
 * - Mobile cap not exceeded (14 asteroids max on mobile)
 *
 * ## Performance
 * - Uses swap-and-pop for O(1) removal from obstacles array
 * - Returns removed asteroids to object pool for reuse
 * - Mobile cap prevents performance degradation on low-end devices
 *
 * @param canvasWidth - Canvas width for boundary checking
 * @param canvasHeight - Canvas height for boundary checking
 * @param spawnInterval - Milliseconds between asteroid spawns (decreases per level)
 * @param lastSpawnTimeRef - Mutable reference to last spawn timestamp
 * @param allowSpawning - Whether new asteroids can spawn (gates during level transitions)
 *
 * @example
 * ```typescript
 * // In game loop
 * const spawnInterval = Math.max(
 *   BASE_SPAWN_INTERVAL - (level * 70),
 *   MIN_SPAWN_INTERVAL
 * );
 * updateObstacles(canvas.width, canvas.height, spawnInterval, lastSpawnTime, allowSpawning.value);
 * ```
 */
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

/**
 * Renders all asteroids to the canvas as rotated polygon shapes.
 *
 * ## Rendering Technique
 * - Batches all asteroids into a single path for performance
 * - Applies rotation transformation to each asteroid's shape
 * - Uses single stroke call for all asteroids (reduces draw calls)
 *
 * ## Performance
 * - Batched rendering: 1 stroke() call for all asteroids (vs N calls)
 * - Early exit if no asteroids (avoids unnecessary canvas operations)
 * - Manual rotation math (faster than ctx.rotate() for many objects)
 *
 * @param ctx - Canvas 2D rendering context
 *
 * @example
 * ```typescript
 * // In render loop
 * ctx.clearRect(0, 0, canvas.width, canvas.height);
 * drawStarfield(ctx);
 * drawObstacles(ctx); // Render all asteroids
 * drawPlayer(ctx);
 * ```
 */
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

/**
 * Result of destroying an asteroid, including fragment bonus information.
 * @internal
 */
export type DestroyOutcome = {
  /** Whether fragment completion bonus was awarded */
  bonusAwarded: boolean;
  /** Bonus points amount (100 pts for fragment completion) */
  bonusAmount: number;
  /** Position to display floating bonus text (null if no bonus) */
  bonusPosition: { x: number; y: number } | null;
};

/**
 * Destroys an asteroid, spawns fragments if applicable, and awards fragment bonus.
 *
 * ## Destruction Logic
 * 1. Remove asteroid from obstacles array (O(1) swap-and-pop)
 * 2. Return asteroid to object pool for reuse
 * 3. Play destruction sound effect
 * 4. If not smallest size: Spawn 2-3 smaller fragments
 * 5. If smallest fragment: Check for fragment completion bonus
 *
 * ## Fragmentation Rules
 * - **Large (level 0)**: Spawns 2-3 medium fragments (level 1)
 * - **Medium (level 1)**: Spawns 2-3 small fragments (level 2)
 * - **Small (level 2)**: No fragments (destroyed completely)
 * - **Mobile**: Spawns 1-2 fragments (reduced for performance)
 *
 * ## Fragment Bonus System
 * When all fragments from a parent asteroid are destroyed:
 * - Awards +150 points bonus
 * - Displays floating bonus text at last fragment position
 * - Tracked via `fragmentTracker` (parentId → remaining count)
 *
 * ## Fragment Physics
 * Fragments inherit parent velocity plus random scatter:
 * - 80% chance: Slow scatter (0.3-1.0 speed)
 * - 20% chance: Fast scatter (1.0-2.5 speed)
 * - Random angle (0-360°)
 * - Speed multiplier: 0.3x parent speed (30%)
 *
 * @param obstacle - The asteroid to destroy
 * @returns Outcome object with bonus information for score popup display
 *
 * @example
 * ```typescript
 * // On bullet collision
 * const outcome = destroyObstacle(asteroid);
 * addScore(asteroid.scoreValue);
 *
 * if (outcome.bonusAwarded && outcome.bonusPosition) {
 *   addScore(outcome.bonusAmount);
 *   showScorePopup(outcome.bonusPosition, outcome.bonusAmount, 'bonus');
 * }
 * ```
 *
 * @see ASTEROID_CONFIG.FRAGMENT_BONUS - Bonus amount (150 pts)
 * @see ASTEROID_CONFIG.FRAGMENT_SPEED_MULTIPLIER - Fragment speed multiplier (0.3x)
 */
export function destroyObstacle(obstacle: Asteroid): DestroyOutcome {
  const idx = obstacles.indexOf(obstacle);
  if (idx === -1) return { bonusAwarded: false, bonusAmount: 0, bonusPosition: null };

  // Swap and pop for O(1) removal
  const last = obstacles.pop();
  if (last && last !== obstacle) {
    obstacles[idx] = last;
  }

  obstaclePool.release(obstacle);
  services.audioService.playSound('break');

  let bonusAwarded = false;
  let bonusAmount = 0;
  let bonusPosition: { x: number; y: number } | null = null;

  if (obstacle.level < ASTEROID_CONFIG.LEVEL_SIZES.length - 1) {
    const nextLevel = obstacle.level + 1;
    const fragmentsMin = isMobile() ? 1 : ASTEROID_CONFIG.FRAGMENTS_MIN;
    const fragmentsMax = isMobile() ? 2 : ASTEROID_CONFIG.FRAGMENTS_MAX;
    const numNew = randomInt(fragmentsMin, fragmentsMax);
    for (let k = 0; k < numNew; k++) {
      const angle = Math.random() * Math.PI * 2;
      const scatterSpeed = Math.random() < 0.8 ? randomFloat(0.3, 1.0) : randomFloat(1.0, 2.5);
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

  if (obstacle.parentId !== null && obstacle.level === ASTEROID_CONFIG.LEVEL_SIZES.length - 1) {
    const parentId = obstacle.parentId;
    const count = fragmentTracker[parentId];
    if (typeof count === 'number') {
      const nextCount = count - 1;
      if (nextCount <= 0) {
        bonusAwarded = true;
        bonusAmount = ASTEROID_CONFIG.FRAGMENT_BONUS;
        bonusPosition = { x: obstacle.x, y: obstacle.y - 10 };
        delete fragmentTracker[parentId];
      } else {
        fragmentTracker[parentId] = nextCount;
      }
    }
  }

  return { bonusAwarded, bonusAmount, bonusPosition };
}
