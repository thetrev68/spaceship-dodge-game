import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameState, score, playerLives, gameLevel } from '@core/state';
import { startGame, continueGame, handlePlayerHit } from '@game/gameStateManager';
import { eventBus } from '@core/events/EventBus';
import { GameEvent, type PlayerDiedEvent } from '@core/events/GameEvents';
import { services } from '@services/ServiceProvider';
import { createMockCanvas } from '../helpers/mockCanvas';

vi.mock('@services/ServiceProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services/ServiceProvider')>();
  return {
    ...actual,
    services: {
      ...actual.services,
      audioService: {
        playSound: vi.fn(),
        stopMusic: vi.fn(),
        startMusic: vi.fn(),
        unlock: vi.fn(),
        setBackgroundMusicVolume: vi.fn(),
        setSoundEffectsVolume: vi.fn(),
        muteAll: vi.fn(),
        unmuteAll: vi.fn(),
        isMuted: vi.fn(() => false),
      },
    },
  };
});

describe('GameStateManager events', () => {
  beforeEach(() => {
    eventBus.clearAll();
    score.value = 0;
    playerLives.value = 3;
    gameLevel.value = 0;
    gameState.value = 'START';
  });

  it('emits GAME_STARTED and GAME_RESUMED appropriately', () => {
    const started: unknown[] = [];
    const resumed: unknown[] = [];
    eventBus.on(GameEvent.GAME_STARTED, (p) => started.push(p));
    eventBus.on(GameEvent.GAME_RESUMED, (p) => resumed.push(p));

    const canvas = createMockCanvas();
    startGame(canvas);
    expect(started.length).toBe(1);

    continueGame();
    expect(resumed.length).toBe(1);
  });

  it('emits GAME_OVER when lives reach zero', () => {
    const over: PlayerDiedEvent[] = [];
    eventBus.on<PlayerDiedEvent>(GameEvent.GAME_OVER, (p) => over.push(p));

    playerLives.value = 1;
    handlePlayerHit(); // should drop to 0 and emit

    expect(over.length).toBe(1);
    expect(over[0]).toMatchObject({ finalScore: expect.any(Number), level: expect.any(Number) });
    expect(services.audioService.stopMusic as ReturnType<typeof vi.fn>).toHaveBeenCalled();
  });
});
