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
import { getCurrentTheme } from '@core/themes';

const obstacleMinSpeed = ASTEROID_CONFIG.BASE_MIN_SPEED;
let nextAsteroidId = 1;
const fragmentTracker: Record<number, number> = {};
const obstacleMaxSpeed = ASTEROID_CONFIG.BASE_MAX_SPEED;

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

// Add to the top of entities/asteroid.ts
export type Debris = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  creationTime: number;
};

const debrisList: Debris[] = [];

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
): Asteroid | null {
  // DoS prevention: enforce hard cap on asteroid count
  const maxAsteroids = isMobile()
    ? ASTEROID_CONFIG.MAX_ASTEROIDS_MOBILE
    : ASTEROID_CONFIG.MAX_ASTEROIDS_DESKTOP;
  if (obstacles.length >= maxAsteroids) {
    return null;
  }

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

  // DoS prevention: check asteroid cap before spawning
  const maxAsteroids = isMobile()
    ? ASTEROID_CONFIG.MAX_ASTEROIDS_MOBILE
    : ASTEROID_CONFIG.MAX_ASTEROIDS_DESKTOP;

  if (
    allowSpawning &&
    now - lastSpawnTimeRef.value > spawnInterval &&
    obstacles.length < maxAsteroids
  ) {
    const spawnRadius = ASTEROID_CONFIG.LEVEL_SIZES[0] ?? 0;
    createObstacle(Math.random() * (canvasWidth - spawnRadius * 2), -spawnRadius * 2, 0);
    lastSpawnTimeRef.value = now;
  }
}

/**
 * Renders all asteroids to the canvas as rotated polygon shapes with added internal vector details.
 * * ## Enhancements
 * - **Internal Facets/Cracks:** Connects the first point (P0) to the halfway point (P[mid]) for internal structure.
 * - **Diagonal Detail:** Connects P1 to the last point (P[n-1]) for added visual complexity/dimension.
 * - **Batch Rendering:** Maintains a single ctx.stroke() call for high performance.
 * * @param ctx - Canvas 2D rendering context
 */
export function drawObstacles(ctx: CanvasRenderingContext2D): void {
  // Get mutable reference to obstacles array
  const obstacles = entityState.getMutableObstacles();

  // Exit early if nothing to draw
  if (obstacles.length === 0) return;

  const theme = getCurrentTheme();

  // Light source direction (from top-left in screen coordinates)
  const lightAngle = -Math.PI * 0.75; // -135 degrees (top-left, accounting for canvas Y-down)
  const lightDx = Math.cos(lightAngle);
  const lightDy = Math.sin(lightAngle);

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (!o) continue;
    const cx = o.x + o.radius;
    const cy = o.y + o.radius;
    const cos = Math.cos(o.rotation);
    const sin = Math.sin(o.rotation);
    const shapeLength = o.shape.length;

    // --- A. Draw Outer Shape with Variable Line Weight Based on Lighting ---
    const p0 = o.shape[0];
    if (!p0) continue;

    // Transform P0 to get starting coordinates
    const startX = p0.x * cos - p0.y * sin + cx;
    const startY = p0.x * sin + p0.y * cos + cy;

    ctx.strokeStyle = theme.colors.asteroid;

    for (let j = 0; j < shapeLength; j++) {
      const p1 = o.shape[j];
      const p2 = o.shape[(j + 1) % shapeLength];
      if (!p1 || !p2) continue;

      // Transform both points
      const x1 = p1.x * cos - p1.y * sin + cx;
      const y1 = p1.x * sin + p1.y * cos + cy;
      const x2 = p2.x * cos - p2.y * sin + cx;
      const y2 = p2.x * sin + p2.y * cos + cy;

      // Calculate edge normal (perpendicular to edge)
      const edgeDx = x2 - x1;
      const edgeDy = y2 - y1;
      const edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);

      if (edgeLen > 0) {
        // Normal points outward (perpendicular to edge, rotated 90° CCW)
        const normalX = edgeDy / edgeLen;
        const normalY = -edgeDx / edgeLen;

        // Dot product: how much this edge faces the light
        // 1.0 = directly facing light, -1.0 = facing away
        const lightDot = normalX * lightDx + normalY * lightDy;

        // Map to line width: facing light = thick (3.5), facing away = thin (1.0)
        const lineWidth = 1.0 + (lightDot * 0.5 + 0.5) * 2.5;

        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // --- B. Add Internal "Cracks" with thin lines ---
    ctx.lineWidth = 1.0;
    ctx.beginPath();

    if (shapeLength > 4) {
      const pMidIndex = Math.floor(shapeLength / 2);
      const pMid = o.shape[pMidIndex];

      if (pMid) {
        // Transform and draw crack from P0 to PMid
        const px = pMid.x * cos - pMid.y * sin + cx;
        const py = pMid.x * sin + pMid.y * cos + cy;
        ctx.moveTo(startX, startY);
        ctx.lineTo(px, py);
      }
    }

    // --- C. Add Simple Diagonal Detail ---
    if (shapeLength > 2) {
      const p1 = o.shape[1];
      const pLast = o.shape[shapeLength - 1];

      if (p1 && pLast) {
        const x1 = p1.x * cos - p1.y * sin + cx;
        const y1 = p1.x * sin + p1.y * cos + cy;
        const xLast = pLast.x * cos - pLast.y * sin + cx;
        const yLast = pLast.x * sin + pLast.y * cos + cy;

        ctx.moveTo(x1, y1);
        ctx.lineTo(xLast, yLast);
      }
    }

    ctx.stroke();
  }
}

/**
 * Result of destroying an asteroid, including fragment bonus information.
 * @internal
 */
type DestroyOutcome = {
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

  // --- NEW: Spawn Debris Particles ---
  const debrisCount = isMobile() ? 5 : 10;
  const now = Date.now();

  for (let k = 0; k < debrisCount; k++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomFloat(2, 5);
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;

    debrisList.push({
      x: obstacle.x + obstacle.radius,
      y: obstacle.y + obstacle.radius,
      dx: dx,
      dy: dy,
      size: randomFloat(1, 3),
      creationTime: now,
    });
  }
  // --- END NEW: Debris Spawn ---

  let bonusAwarded = false;
  let bonusAmount = 0;
  let bonusPosition: { x: number; y: number } | null = null;

  // ... (Existing fragment spawning logic follows)
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

  // ... (Existing fragment bonus logic follows)
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

/**
 * Updates debris positions, applies damping, and handles removal after a short lifetime.
 */
export function updateDebris(): void {
  const now = Date.now();
  const maxDebrisLife = 500; // 0.5 seconds lifespan

  for (let i = debrisList.length - 1; i >= 0; i--) {
    const d = debrisList[i];
    if (!d) continue;

    // Move
    d.x += d.dx;
    d.y += d.dy;

    // Slow down (damping/friction)
    d.dx *= 0.95;
    d.dy *= 0.95;

    // Check life
    if (now - d.creationTime > maxDebrisLife) {
      debrisList.splice(i, 1); // Remove expired debris
    }
  }
}

/**
 * Renders debris particles as small vector lines (batched).
 * * @param ctx - Canvas 2D rendering context
 */
export function drawDebris(ctx: CanvasRenderingContext2D): void {
  if (debrisList.length === 0) return;

  const theme = getCurrentTheme();
  ctx.strokeStyle = theme.colors.asteroid;
  ctx.lineWidth = 1;

  ctx.beginPath();

  for (const d of debrisList) {
    // Draw as a short vector line segment to show movement/trail
    const endX = d.x + d.dx * 0.5;
    const endY = d.y + d.dy * 0.5;

    ctx.moveTo(d.x, d.y);
    ctx.lineTo(endX, endY);
  }

  ctx.stroke();
}
