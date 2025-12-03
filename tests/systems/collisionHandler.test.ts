import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { checkCollisions } from '@systems/collisionHandler';
import { createTestAsteroid, createTestBullet } from '../helpers/gameStateFactory';
import { player, bullets, obstacles, powerUps, playerLives } from '@core/state';

describe('Collision Handler System', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    // Clear state
    bullets.length = 0;
    obstacles.length = 0;
    player.x = 400;
    player.y = 300;
    player.width = 30;
    player.height = 45;
    powerUps.shield.active = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('should detect and handle player-asteroid collisions', () => {
    // Set known lives
    playerLives.value = 3;

    // Create overlapping player and asteroid
    const asteroid = createTestAsteroid({
      x: player.x,
      y: player.y,
      radius: 30
    });
    obstacles.push(asteroid);

    // Check collisions
    checkCollisions();

    // Verify player was hit by checking if lives decreased or asteroid was removed
    const wasHit = playerLives.value < 3 || obstacles.length === 0;
    expect(wasHit).toBe(true);
  });

  it('should ignore player-asteroid collisions when shield is active', () => {
    // Activate shield
    powerUps.shield.active = true;
    const initialLives = playerLives.value;

    // Create overlapping player and asteroid
    const asteroid = createTestAsteroid({
      x: player.x,
      y: player.y,
      radius: 30
    });
    obstacles.push(asteroid);

    // Check collisions
    checkCollisions();

    // Verify player was NOT hit (lives unchanged)
    expect(playerLives.value).toBe(initialLives);
  });

  it('should detect and handle bullet-asteroid collisions', () => {
    // Create an asteroid
    const asteroid = createTestAsteroid({
      x: 400,
      y: 200,
      radius: 50
    });
    obstacles.push(asteroid);
    const initialObstacleCount = obstacles.length;

    // Create a bullet that overlaps with the asteroid center
    // Note: collision detection uses (obstacle.x + obstacle.radius, obstacle.y + obstacle.radius)
    const bullet = createTestBullet({
      x: asteroid.x + asteroid.radius,
      y: asteroid.y + asteroid.radius,
      radius: 5
    });
    bullets.push(bullet);
    const initialBulletCount = bullets.length;

    // Check collisions
    checkCollisions();

    // Verify collision was detected (bullet or asteroid count changed)
    const collisionDetected =
      bullets.length < initialBulletCount ||
      obstacles.length !== initialObstacleCount;

    expect(collisionDetected).toBe(true);
  });

  it('should handle 100+ entities without performance issues', () => {
    // Create 100 asteroids
    for (let i = 0; i < 100; i++) {
      const asteroid = createTestAsteroid({
        x: Math.random() * 800,
        y: Math.random() * 600,
        radius: 20 + Math.random() * 30
      });
      obstacles.push(asteroid);
    }

    // Measure performance
    const startTime = performance.now();
    checkCollisions();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Verify performance is acceptable (< 16ms frame budget)
    expect(duration).toBeLessThan(16);
  });
});