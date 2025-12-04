import { describe, it, expect, beforeEach } from 'vitest';
import { entityState, playerState, addScore, playerLives, gameLevel } from '@core/state';

describe('State modules', () => {
  beforeEach(() => {
    entityState.clearAll();
    playerState.reset();
    playerLives.value = 3;
    gameLevel.value = 0;
  });

  it('swap-and-pop removes bullets safely', () => {
    const bullets = entityState.getMutableBullets();
    entityState.addBullet({ x: 0, y: 0, radius: 1, dy: 0, parentId: null });
    entityState.addBullet({ x: 1, y: 1, radius: 1, dy: 0, parentId: null });

    entityState.removeBullet(0);
    expect(bullets.length).toBe(1);
  });

  it('swap-and-pop removes obstacles safely', () => {
    const obstacles = entityState.getMutableObstacles();
    entityState.addObstacle({
      x: 0,
      y: 0,
      radius: 1,
      dx: 0,
      dy: 0,
      id: 1,
      level: 0,
      parentId: null,
      scoreValue: 0,
      creationTime: 0,
      rotation: 0,
      rotationSpeed: 0,
      speed: 0,
      shape: [],
    });
    entityState.addObstacle({
      x: 1,
      y: 1,
      radius: 1,
      dx: 0,
      dy: 0,
      id: 2,
      level: 0,
      parentId: null,
      scoreValue: 0,
      creationTime: 0,
      rotation: 0,
      rotationSpeed: 0,
      speed: 0,
      shape: [],
    });

    entityState.removeObstacle(0);
    expect(obstacles.length).toBe(1);
  });

  it('increments score via helper', () => {
    const next = addScore(10);
    expect(next).toBe(10);
  });

  it('ticks and expires player powerups', () => {
    playerState.activatePowerup('shield', 2);
    expect(playerState.powerUps.shield.active).toBe(true);
    playerState.tickPowerups();
    playerState.tickPowerups();
    expect(playerState.powerUps.shield.active).toBe(false);
  });
});
