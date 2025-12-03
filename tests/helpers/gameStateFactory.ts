import type { Asteroid, Bullet } from '@types';

export function createTestAsteroid(overrides: Partial<Asteroid> = {}): Asteroid {
  return {
    x: 100,
    y: 100,
    radius: 40,
    dx: 1,
    dy: 1,
    id: 1,
    level: 2,
    parentId: null,
    scoreValue: 100,
    creationTime: Date.now(),
    rotation: 0,
    rotationSpeed: 0.02,
    speed: 2,
    shape: [{ x: 40, y: 0 }, { x: 0, y: 40 }, { x: -40, y: 0 }, { x: 0, y: -40 }],
    ...overrides
  };
}

export function createTestBullet(overrides: Partial<Bullet> = {}): Bullet {
  return {
    x: 400,
    y: 300,
    radius: 5,
    dy: -5,
    parentId: null,
    ...overrides
  };
}

export function createTestPowerup(overrides: Partial<{
  x: number;
  y: number;
  size: number;
  type: 'shield' | 'doubleBlaster';
  active: boolean;
  dy: number;
}> = {}): {
  x: number;
  y: number;
  size: number;
  type: 'shield' | 'doubleBlaster';
  active: boolean;
  dy: number;
} {
  return {
    x: 400,
    y: 100,
    size: 50,
    type: 'shield',
    active: true,
    dy: 2,
    ...overrides
  };
}