import { describe, it, expect, beforeEach } from 'vitest';
import { entityState } from '@core/state';

describe('entity state management', () => {
  beforeEach(() => {
    entityState.clearAll();
  });

  it('adds and removes bullets with guard rails', () => {
    // Ignore invalid bullet
    // @ts-expect-error testing guard
    entityState.addBullet(null);
    expect(entityState.bullets.length).toBe(0);

    const bullet = { x: 1, y: 2, dx: 0, dy: 0, width: 1, height: 1 };
    entityState.addBullet(bullet as any);
    expect(entityState.bullets.length).toBe(1);

    // Remove with invalid index should not throw
    entityState.removeBullet(5);
    expect(entityState.bullets.length).toBe(1);

    // Remove with empty last bullet path
    const mutable = entityState.getMutableBullets();
    mutable[0] = undefined as any;
    entityState.removeBullet(0);
    expect(entityState.bullets.length).toBe(0);
  });

  it('adds and removes obstacles with guard rails', () => {
    // @ts-expect-error guard
    entityState.addObstacle(undefined);
    expect(entityState.obstacles.length).toBe(0);

    const obstacle = { x: 0, y: 0, dx: 0, dy: 0, size: 1 };
    entityState.addObstacle(obstacle as any);
    expect(entityState.obstacles.length).toBe(1);

    entityState.removeObstacle(9);
    expect(entityState.obstacles.length).toBe(1);

    const mutable = entityState.getMutableObstacles();
    mutable[0] = undefined as any;
    entityState.removeObstacle(0);
    expect(entityState.obstacles.length).toBe(0);
  });
});
