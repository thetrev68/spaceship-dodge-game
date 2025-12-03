import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { checkCollisions } from '@systems/collisionHandler';
import { createTestAsteroid, createTestBullet } from '../helpers/gameStateFactory';
import { player, bullets, obstacles, powerUps } from '@core/state';

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
    // Create overlapping player and asteroid
    const asteroid = createTestAsteroid({
      x: player.x + 10,
      y: player.y + 10,
      radius: 30
    });
    obstacles.push(asteroid);

    // Mock player hit handler
    const mockHandlePlayerHit = vi.fn();
    vi.mock('@game/gameStateManager', () => ({
      handlePlayerHit: mockHandlePlayerHit
    }));

    // Check collisions
    checkCollisions();

    // Verify player hit was handled (no shield active)
    expect(mockHandlePlayerHit).toHaveBeenCalled();
  });

  it('should ignore player-asteroid collisions when shield is active', () => {
    // Activate shield
    powerUps.shield.active = true;

    // Create overlapping player and asteroid
    const asteroid = createTestAsteroid({
      x: player.x + 10,
      y: player.y + 10,
      radius: 30
    });
    obstacles.push(asteroid);

    // Mock player hit handler
    const mockHandlePlayerHit = vi.fn();
    vi.mock('@game/gameStateManager', () => ({
      handlePlayerHit: mockHandlePlayerHit
    }));

    // Check collisions
    checkCollisions();

    // Verify player hit was NOT handled (shield active)
    expect(mockHandlePlayerHit).not.toHaveBeenCalled();
  });

  it('should detect and handle bullet-asteroid collisions with fragmentation', () => {
    // Create a large asteroid
    const asteroid = createTestAsteroid({
      x: 400,
      y: 200,
      radius: 50,
      level: 0 // Large asteroid
    });
    obstacles.push(asteroid);

    // Create a bullet that will hit the asteroid
    const bullet = createTestBullet({
      x: asteroid.x + asteroid.radius,
      y: asteroid.y + asteroid.radius,
      radius: 5
    });
    bullets.push(bullet);

    // Mock the destroy function to track calls
    const mockDestroy = vi.fn();
    vi.mock('@entities/asteroid', () => ({
      destroyObstacle: mockDestroy
    }));

    // Check collisions
    checkCollisions();

    // Verify destroy was called (indicating collision)
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('should handle player-powerup collisions', () => {
    // Create a powerup that overlaps with player
    const powerup = {
      x: player.x + 10,
      y: player.y + 10,
      size: 30,
      type: 'shield' as const,
      active: true,
      dy: 1
    };

    // Mock the powerup array
    const activePowerups = [powerup];
    vi.mock('@entities/powerup', () => ({
      activePowerups
    }));

    // Check collisions
    checkCollisions();

    // Verify powerup was activated
    expect(powerUps.shield.active).toBe(true);
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