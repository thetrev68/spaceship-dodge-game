// collisionHandler.js
/*
  Handles all collision detection and response logic:
  - Player & obstacles (including shield effect)
  - Bullets & obstacles
  - Powerup & player (if needed here)
*/

import { player, bullets, obstacles, powerUps, score } from '@core/state';
import { destroyObstacle } from './asteroid.js';
import { handlePlayerHit } from '@game/gameStateManager';

// Circle-rectangle collision helper
function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

// Check if player collides with any obstacle, returns the obstacle or null
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

// Optimized collision detection with spatial partitioning
class SpatialGrid {
  constructor(cellSize = 50) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  _getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

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

  clear() {
    this.grid.clear();
  }

  insertObstacle(obstacle) {
    const centerX = obstacle.x + obstacle.radius;
    const centerY = obstacle.y + obstacle.radius;
    const key = this._getCellKey(centerX, centerY);
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(obstacle);
  }

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

// Check bullet-obstacle collisions with spatial optimization
function checkBulletObstacleCollisions() {
  // Build spatial grid for obstacles
  spatialGrid.clear();
  obstacles.forEach(obstacle => spatialGrid.insertObstacle(obstacle));

  // Calculate safe search radius based on max obstacle size
  const maxObstacleRadius = Math.max(...obstacles.map(o => o.radius), 0);
  const searchRadius = bullets[0]?.radius ? bullets[0].radius + maxObstacleRadius : 100;

  // Track destroyed obstacles by identity to avoid double-processing
  const destroyedObstacles = new Set();
  const bulletsToRemove = new Set();

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
        bulletsToRemove.add(i);
        destroyedObstacles.add(obstacle);
        destroyObstacle(obstacle, score); // Handles obstacle removal from array
        break; // Exit inner loop to avoid multiple collisions for same bullet
      }
    }
  }

  // Remove bullets in reverse order to maintain correct indices
  const bulletsArray = Array.from(bulletsToRemove).sort((a, b) => b - a);
  bulletsArray.forEach(index => {
    if (index >= 0 && index < bullets.length) {
      bullets.splice(index, 1);
    }
  });
}

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
