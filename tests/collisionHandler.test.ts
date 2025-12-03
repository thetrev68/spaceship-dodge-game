import { describe, expect, it, vi } from 'vitest';

vi.mock('@systems/soundManager.js', () => ({
  playSound: vi.fn(),
  stopMusic: vi.fn(),
  muteAll: vi.fn(),
  unmuteAll: vi.fn(),
}));

vi.mock('@entities/bullet.js', () => ({
  despawnBullet: vi.fn(),
  clearAllBullets: vi.fn(),
}));

vi.mock('@entities/asteroid.js', () => ({
  destroyObstacle: vi.fn(),
}));

vi.mock('@game/gameStateManager.js', () => ({
  handlePlayerHit: vi.fn(),
}));

vi.mock('@core/state.js', () => {
  const player = { x: 0, y: 0, width: 1, height: 1 };
  const bullets: unknown[] = [];
  const obstacles: unknown[] = [];
  const powerUps = { shield: { active: false, timer: 0 }, doubleBlaster: { active: false, timer: 0 } };
  return {
    player,
    bullets,
    obstacles,
    powerUps,
    score: { value: 0 },
    entityState: {
      getMutableBullets: () => bullets,
      getMutableObstacles: () => obstacles,
    },
    playerState: {
      player,
      powerUps,
    },
  };
});

const { circleRectCollision } = await import('@systems/collisionHandler.js');

describe('circleRectCollision', () => {
  it('detects overlap when circle intersects rectangle', () => {
    const result = circleRectCollision(5, 5, 2, 4, 4, 2, 2);
    expect(result).toBe(true);
  });

  it('returns false when shapes are separated', () => {
    const result = circleRectCollision(0, 0, 1, 10, 10, 2, 2);
    expect(result).toBe(false);
  });
});
