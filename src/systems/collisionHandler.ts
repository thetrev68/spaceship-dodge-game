/**
 * @fileoverview Collision detection and response system.
 * Handles all collision detection and response logic:
 * - Player & obstacles (including shield effect)
 * - Bullets & obstacles
 * - Powerup & player (if needed here)
 */

import type { Asteroid } from '@types';
import { addScore, entityState, playerLives, playerState } from '@core/state.js';
import { destroyObstacle } from '@entities/asteroid.js';
import { handlePlayerHit } from '@game/gameStateManager.js';
import { despawnBullet } from '@entities/bullet.js';
import { eventBus } from '@core/events/EventBus.js';
import { GameEvent, type AsteroidDestroyedEvent, type BonusAwardedEvent, type PlayerHitEvent } from '@core/events/GameEvents.js';

/**
 * Checks collision between a circle and a rectangle.
 */
export function circleRectCollision(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

/**
 * Checks if player collides with any obstacle.
 */
function checkPlayerObstacleCollision(): Asteroid | null {
  const px = player.x;
  const py = player.y;
  const pw = player.width;
  const ph = player.height;

  for (const obstacle of obstacles) {
    const cx = obstacle.x + obstacle.radius;
    const cy = obstacle.y + obstacle.radius;
    if (circleRectCollision(cx, cy, obstacle.radius, px, py, pw, ph)) {
      return obstacle;
    }
  }
  return null;
}

/**
 * Optimized collision detection with spatial partitioning.
 */
class SpatialGrid {
  private readonly grid = new Map<string, Asteroid[]>();

  constructor(private readonly cellSize = 50) {}

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  private getNearbyCells(x: number, y: number, radius: number): string[] {
    const cells: string[] = [];
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellY = Math.floor((y - radius) / this.cellSize);
    const maxCellY = Math.floor((y + radius) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        cells.push(`${cx},${cy}`);
      }
    }
    return cells;
  }

  clear(): void {
    this.grid.clear();
  }

  insertObstacle(obstacle: Asteroid): void {
    const centerX = obstacle.x + obstacle.radius;
    const centerY = obstacle.y + obstacle.radius;
    const key = this.getCellKey(centerX, centerY);

    let bucket = this.grid.get(key);
    if (!bucket) {
      bucket = [];
      this.grid.set(key, bucket);
    }
    bucket.push(obstacle);
  }

  getNearbyObstacles(x: number, y: number, radius: number): Asteroid[] {
    const nearbyKeys = this.getNearbyCells(x, y, radius);
    const nearbyObstacles: Asteroid[] = [];

    nearbyKeys.forEach(key => {
      const cellObstacles = this.grid.get(key);
      if (cellObstacles) {
        nearbyObstacles.push(...cellObstacles);
      }
    });

    return nearbyObstacles;
  }
}

// Create spatial grid instance
const spatialGrid = new SpatialGrid(60);
const player = playerState.player;
const powerUps = playerState.powerUps;
const bullets = entityState.getMutableBullets();
const obstacles = entityState.getMutableObstacles();

/**
 */
function checkBulletObstacleCollisions(): void {
  if (bullets.length === 0 || obstacles.length === 0) {
    return;
  }

  // Build spatial grid for obstacles
  spatialGrid.clear();
  obstacles.forEach(obstacle => spatialGrid.insertObstacle(obstacle));

  const maxObstacleRadius = 50; // Safe upper bound for optimization
  const searchRadius = bullets[0]?.radius ? bullets[0].radius + maxObstacleRadius : 100;

  // Track destroyed obstacles by identity to avoid double-processing
  const destroyedObstacles = new Set<Asteroid>();

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    if (!bullet) continue;
    const nearbyObstacles = spatialGrid.getNearbyObstacles(bullet.x, bullet.y, searchRadius);

    for (const obstacle of nearbyObstacles) {
      // Skip if already destroyed this frame
      if (destroyedObstacles.has(obstacle)) {
        continue;
      }

      const dx = bullet.x - (obstacle.x + obstacle.radius);
      const dy = bullet.y - (obstacle.y + obstacle.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bullet.radius + obstacle.radius) {
        destroyedObstacles.add(obstacle);
        const centerX = obstacle.x + obstacle.radius;
        const centerY = obstacle.y + obstacle.radius;
        const { bonusAwarded, bonusAmount, bonusPosition } = destroyObstacle(obstacle);
        addScore(obstacle.scoreValue);
        eventBus.emit<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, {
          position: { x: centerX, y: centerY },
          score: obstacle.scoreValue,
          size: obstacle.radius,
          sizeLevel: obstacle.level,
        });

        if (bonusAwarded && bonusAmount > 0 && bonusPosition) {
          addScore(bonusAmount);
          eventBus.emit<BonusAwardedEvent>(GameEvent.BONUS_AWARDED, {
            bonusType: 'fragment',
            bonusAmount,
            position: bonusPosition,
          });
        }
        despawnBullet(i); // Immediate removal (swap-and-pop safe with reverse iteration)
        break; // Bullet is gone, stop checking it
      }
    }
  }
}

/**
 */
export function checkCollisions(): void {
  if (obstacles.length === 0) {
    return;
  }

  const hitObstacle = checkPlayerObstacleCollision();
  if (hitObstacle) {
    if (!powerUps.shield.active) {
      // Player takes damage
      handlePlayerHit();
      eventBus.emit<PlayerHitEvent>(GameEvent.PLAYER_HIT, {
        livesRemaining: playerLives.value,
        invulnerable: false,
      });
    } else {
      // Phase shield active: ignore collision, player passes through
      // Optionally, add subtle visual or sound feedback here
    }
  }

  checkBulletObstacleCollisions();

  // Powerup-player collision handled in powerups.js updatePowerups()
}

export function resetCollisionState(): void {
  spatialGrid.clear();
}
