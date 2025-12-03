import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { obstacles } from '@core/state';
import { updateObstacles, destroyObstacle } from '@entities/asteroid';
import { createTestAsteroid } from '../helpers/gameStateFactory';

describe('Asteroid Entity', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    // Clear obstacles
    obstacles.length = 0;
  });

  afterEach(() => {
    cleanup();
  });

  it('should update asteroid positions', () => {
    // Create test asteroid
    const asteroid = createTestAsteroid({
      x: 100,
      y: 100,
      dx: 1,
      dy: 2,
      speed: 1
    });
    obstacles.push(asteroid);

    // Mock canvas dimensions
    const canvasWidth = 800;
    const canvasHeight = 600;

    // Update obstacles
    updateObstacles(canvasWidth, canvasHeight, 1000, { value: 0 }, true);

    // Verify asteroid moved
    const firstObstacle = obstacles[0];
    if (firstObstacle) {
      expect(firstObstacle.x).toBeGreaterThan(100);
      expect(firstObstacle.y).toBeGreaterThan(100);
    }
  });

  it('should remove out-of-bounds asteroids', () => {
    // Create asteroid far below canvas
    const asteroid = createTestAsteroid({
      x: 100,
      y: 1000, // Below canvas
      dx: 0,
      dy: 0,
      speed: 0
    });
    obstacles.push(asteroid);

    // Update obstacles
    updateObstacles(800, 600, 1000, { value: 0 }, true);

    // Verify asteroid was removed
    expect(obstacles.length).toBe(0);
  });

  it('should fragment large asteroids when destroyed', () => {
    // Create large asteroid
    const largeAsteroid = createTestAsteroid({
      x: 400,
      y: 300,
      radius: 50,
      level: 0, // Large asteroid
      speed: 1
    });
    obstacles.push(largeAsteroid);

    // Mock the score object
    const score = { value: 0 };

    // Destroy asteroid
    destroyObstacle(largeAsteroid, score);

    // Verify fragments were created
    expect(obstacles.length).toBeGreaterThan(0);

    // Verify score was updated
    expect(score.value).toBeGreaterThan(0);
  });

  it('should handle asteroid movement', () => {
    // Create asteroid at edge
    const asteroid = createTestAsteroid({
      x: 100,
      y: 100,
      dx: 1,
      dy: 0,
      speed: 1
    });
    obstacles.push(asteroid);

    // Update obstacles
    updateObstacles(800, 600, 1000, { value: 0 }, true);

    // Verify asteroid position was updated
    const firstObstacle = obstacles[0];
    if (firstObstacle) {
      expect(firstObstacle.x).toBeGreaterThan(100);
    }
  });
});