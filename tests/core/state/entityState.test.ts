import { describe, it, expect, beforeEach } from 'vitest';
import { entityState } from '@core/state';
import type { Bullet, Asteroid } from '@types';

describe('entity state management', () => {
  beforeEach(() => {
    entityState.clearAll();
  });

  it('adds and removes bullets with guard rails', () => {
    // Ignore invalid bullet
    // @ts-expect-error testing guard
    entityState.addBullet(null);
    expect(entityState.bullets.length).toBe(0);

    const bullet: Bullet = { x: 1, y: 2, radius: 2, dy: 0, parentId: null };
    entityState.addBullet(bullet);
    expect(entityState.bullets.length).toBe(1);

    // Remove with invalid index should not throw
    entityState.removeBullet(5);
    expect(entityState.bullets.length).toBe(1);

    // Remove with empty last bullet path
    const mutable = entityState.getMutableBullets();
    mutable[0] = undefined as unknown as Bullet;
    entityState.removeBullet(0);
    expect(entityState.bullets.length).toBe(0);
  });

  it('adds and removes obstacles with guard rails', () => {
    // @ts-expect-error guard
    entityState.addObstacle(undefined);
    expect(entityState.obstacles.length).toBe(0);

    const obstacle: Asteroid = {
      x: 0,
      y: 0,
      radius: 1,
      dx: 0,
      dy: 0,
      id: 1,
      level: 0,
      parentId: null,
      scoreValue: 0,
      creationTime: Date.now(),
      rotation: 0,
      rotationSpeed: 0,
      speed: 0,
      shape: [{ x: 0, y: 0 }],
    };
    entityState.addObstacle(obstacle);
    expect(entityState.obstacles.length).toBe(1);

    entityState.removeObstacle(9);
    expect(entityState.obstacles.length).toBe(1);

    const mutable = entityState.getMutableObstacles();
    mutable[0] = undefined as unknown as Asteroid;
    entityState.removeObstacle(0);
    expect(entityState.obstacles.length).toBe(0);
  });
});
