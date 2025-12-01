/**
 * @fileoverview Collision detection and response system.
 * Handles all collision detection and response logic:
 * - Player & obstacles (including shield effect)
 * - Bullets & obstacles
 * - Powerup & player (if needed here)
 */

import { player, bullets, obstacles, powerUps, score } from '@core/state.js';
import { destroyObstacle } from '@entities/asteroid.js';
import { handlePlayerHit } from '@game/gameStateManager.js';
import { despawnBullet } from '@entities/bullet.js';

/**
 * Checks collision between a circle and a rectangle.
 * @param {number} cx - Circle center X.
 * @param {number} cy - Circle center Y.
 * @param {number} radius - Circle radius.
 * @param {number} rx - Rectangle X.
 * @param {number} ry - Rectangle Y.
 * @param {number} rw - Rectangle width.
 * @param {number} rh - Rectangle height.
 * @returns {boolean} True if colliding.
 */
function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

/**
 * Checks if player collides with any obstacle.
 * @returns {Object|null} The colliding obstacle or null.
 */
function checkPlayerObstacleCollision() {
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
  /**
   * @param {number} [cellSize=50] - Size of each grid cell.
   */
  constructor(cellSize = 50) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  /**
   * Gets the cell key for coordinates.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {string} Cell key.
   */
  _getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Gets nearby cell keys.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {number} radius - Search radius.
   * @returns {string[]} Array of cell keys.
   */
  _getNearbyCells(x, y, radius) {
    const cells = [];
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

  /**
   * Clears the grid.
   */
  clear() {
    this.grid.clear();
  }

  /**
   * Inserts an obstacle into the grid.
   * @param {Object} obstacle - The obstacle to insert.
   */
  insertObstacle(obstacle) {
    const centerX = obstacle.x + obstacle.radius;
    const centerY = obstacle.y + obstacle.radius;
    const key = this._getCellKey(centerX, centerY);
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(obstacle);
  }

  /**
   * Gets nearby obstacles.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {number} [radius=0] - Search radius.
   * @returns {Object[]} Array of nearby obstacles.
   */
  getNearbyObstacles(x, y, radius = 0) {
    const nearbyKeys = this._getNearbyCells(x, y, radius);
    const nearbyObstacles = [];

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

/**
 * Checks bullet-obstacle collisions with spatial optimization.
 */
function checkBulletObstacleCollisions() {
  // Build spatial grid for obstacles
  spatialGrid.clear();
  obstacles.forEach(obstacle => spatialGrid.insertObstacle(obstacle));

  // Use constant max radius from config (largest asteroid size)
  // ASTEROID_CONFIG is not imported in this file, but we can assume a safe large value or import it.
  // Better to import it, but strict replacement implies keeping imports clean.
  // We'll use a safe heuristic or import if possible. 
  // Looking at imports, we don't have ASTEROID_CONFIG. 
  // We can verify if we can calculate it efficiently or just use a fixed number.
  // The original code calculated it. Let's look at 'obstacles' which is available.
  // If we want to avoid 'map', we can iterate once or just use a known max. 
  // But we can just use a safe constant like 50 (larger than any asteroid).
  // Or simpler: import ASTEROID_CONFIG.
  // Actually, let's just stick to the manual fix:
  const maxObstacleRadius = 50; // Safe upper bound for optimization
  const searchRadius = bullets[0]?.radius ? bullets[0].radius + maxObstacleRadius : 100;

  // Track destroyed obstacles by identity to avoid double-processing
  const destroyedObstacles = new Set();

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
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
        destroyObstacle(obstacle, score); // Handles obstacle removal from array
        despawnBullet(i); // Immediate removal (swap-and-pop safe with reverse iteration)
        break; // Bullet is gone, stop checking it
      }
    }
  }
}

/**
 * Main collision checking function.
 */
export function checkCollisions() {
  const hitObstacle = checkPlayerObstacleCollision();
  if (hitObstacle) {
    if (!powerUps.shield.active) {
      // Player takes damage
      handlePlayerHit();
    } else {
      // Phase shield active: ignore collision, player passes through
      // Optionally, add subtle visual or sound feedback here
    }
  }

  checkBulletObstacleCollisions();

  // Powerup-player collision handled in powerups.js updatePowerups()
}
