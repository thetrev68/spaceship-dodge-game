// collisionHandler.js
/*
  Handles all collision detection and response logic:
  - Player & obstacles (including shield effect)
  - Bullets & obstacles
  - Powerup & player (if needed here)
*/

import { player, bullets, obstacles, powerUps, score } from './state.js';
import { destroyObstacle } from './asteroid.js'; // assumes modular export
import { addScorePopup } from './scorePopups.js';
import { playSound } from './soundManager.js';

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

// Check bullet-obstacle collisions and destroy obstacle + bullet on hit
function checkBulletObstacleCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    for (let j = obstacles.length - 1; j >= 0; j--) {
      const obstacle = obstacles[j];
      const dx = bullet.x - (obstacle.x + obstacle.radius);
      const dy = bullet.y - (obstacle.y + obstacle.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bullet.radius + obstacle.radius) {
        bullets.splice(i, 1);
        destroyObstacle(obstacle, score);
        break;
      }
    }
  }
}

export function checkCollisions() {
  const hitObstacle = checkPlayerObstacleCollision();
  if (hitObstacle) {
    if (!powerUps.shield.active) {
      // Player takes damage
      import('./gameStateManager.js').then(m => m.handlePlayerHit());
    } else {
      // Phase shield active: ignore collision, player passes through
      // Optionally, add subtle visual or sound feedback here
    }
  }

  checkBulletObstacleCollisions();

  // Powerup-player collision handled in powerups.js updatePowerups()
}
