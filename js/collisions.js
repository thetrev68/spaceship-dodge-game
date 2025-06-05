/*
    collisions.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Improved collision detection accuracy.
        Modular obstacle destruction.
*/

import { bullets, obstacles, ASTEROID_LEVEL_SIZES, player } from './state.js';
import { createObstacle, fragmentTracker } from './asteroid.js';
import { addScorePopup } from './scorePopups.js';
import { playSound } from './soundManager.js';

// Helper: Circle-rectangle collision test
function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

export function checkPlayerObstacleCollisions() {
  const px = player.x;
  const py = player.y;
  const pw = player.width;
  const ph = player.height;

  for (const obstacle of obstacles) {
    const cx = obstacle.x + obstacle.radius;
    const cy = obstacle.y + obstacle.radius;
    const r = obstacle.radius;

    if (circleRectCollision(cx, cy, r, px, py, pw, ph)) {
      return true;
    }
  }
  return false;
}

export function destroyObstacle(obstacle, scoreRef) {
  const idx = obstacles.indexOf(obstacle);
  if (idx === -1) return;

  obstacles.splice(idx, 1);
  playSound('break');

  if (obstacle.level < ASTEROID_LEVEL_SIZES.length - 1) {
    const nextLevel = obstacle.level + 1;
    const numNew = Math.floor(Math.random() * 2) + 2;
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

  if (obstacle.parentId !== null && obstacle.level === ASTEROID_LEVEL_SIZES.length - 1) {
    fragmentTracker[obstacle.parentId]--;
    if (fragmentTracker[obstacle.parentId] === 0) {
      scoreRef.value += 150;
      addScorePopup('+150 (All Fragments)', obstacle.x, obstacle.y - 10, '#00ff00');
      delete fragmentTracker[obstacle.parentId];
    }
  }
}

export function checkBulletObstacleCollisions(scoreRef) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    for (let j = obstacles.length - 1; j >= 0; j--) {
      if (!obstacles[j]) continue;
      const obstacle = obstacles[j];

      const dx = bullet.x - (obstacle.x + obstacle.radius);
      const dy = bullet.y - (obstacle.y + obstacle.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bullet.radius + obstacle.radius) {
        bullets.splice(i, 1);
        destroyObstacle(obstacle, scoreRef);
        break;
      }
    }
  }
}