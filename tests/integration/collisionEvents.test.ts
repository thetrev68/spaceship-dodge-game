import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from '@core/events/EventBus.js';
import {
  GameEvent,
  type AsteroidDestroyedEvent,
  type BonusAwardedEvent,
} from '@core/events/GameEvents.js';
import { entityState, addScore } from '@core/state.js';
import { checkCollisions } from '@systems/collisionHandler.js';

vi.mock('@services/ServiceProvider.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services/ServiceProvider.js')>();
  return {
    ...actual,
    services: {
      ...actual.services,
      audioService: {
        playSound: vi.fn(),
        startMusic: vi.fn(),
        stopMusic: vi.fn(),
        unlock: vi.fn(),
        setBackgroundMusicVolume: vi.fn(),
        setSoundEffectsVolume: vi.fn(),
        muteAll: vi.fn(),
        unmuteAll: vi.fn(),
        isMuted: vi.fn(() => false),
      },
      collisionService: actual.services.collisionService,
    },
  };
});

describe('Collision events integration', () => {
  const emittedDestroyed: AsteroidDestroyedEvent[] = [];
  const emittedBonus: BonusAwardedEvent[] = [];

  beforeEach(() => {
    entityState.clearAll();
    emittedDestroyed.length = 0;
    emittedBonus.length = 0;
    addScore(-addScore(0)); // reset score to 0

    eventBus.clearAll();
    eventBus.on<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, (payload) =>
      emittedDestroyed.push(payload)
    );
    eventBus.on<BonusAwardedEvent>(GameEvent.BONUS_AWARDED, (payload) =>
      emittedBonus.push(payload)
    );
  });

  it('emits ASTEROID_DESTROYED with position and score', () => {
    const bullets = entityState.getMutableBullets();
    const obstacles = entityState.getMutableObstacles();

    bullets.push({ x: 0, y: 0, radius: 5, dy: 0, parentId: null });
    obstacles.push({
      x: 0,
      y: 0,
      radius: 5,
      dx: 0,
      dy: 0,
      id: 1,
      level: 0,
      parentId: null,
      scoreValue: 10,
      creationTime: Date.now(),
      rotation: 0,
      rotationSpeed: 0,
      speed: 0,
      shape: [{ x: 0, y: 0 }],
    });

    checkCollisions();

    expect(emittedDestroyed.length).toBe(1);
    expect(emittedDestroyed[0]).toMatchObject({
      position: { x: expect.any(Number), y: expect.any(Number) },
      score: expect.any(Number),
      sizeLevel: obstacles[0]?.level ?? expect.any(Number),
    });
  });
});
