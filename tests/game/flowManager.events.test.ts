import { describe, it, expect, beforeEach, vi } from 'vitest';
import { allowSpawning, entityState, gameLevel, levelStartTime } from '@core/state';
import { resetLevelFlow, updateLevelFlow } from '@game/flowManager';
import { eventBus } from '@core/events/EventBus';
import { GameEvent, type LevelUpEvent } from '@core/events/GameEvents';
import { services } from '@services/ServiceProvider';

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

describe('FlowManager events', () => {
  beforeEach(() => {
    entityState.clearObstacles();
    allowSpawning.value = true;
    gameLevel.value = 0;
    levelStartTime.value = Date.now();
    resetLevelFlow();
    eventBus.clearAll();
  });

  it('emits LEVEL_UP and LEVEL_TRANSITION_START when screen clears', () => {
    const levelEvents: LevelUpEvent[] = [];
    const transitionEvents: unknown[] = [];

    eventBus.on<LevelUpEvent>(GameEvent.LEVEL_UP, (payload) => levelEvents.push(payload));
    eventBus.on(GameEvent.LEVEL_TRANSITION_START, (payload) => transitionEvents.push(payload));

    // simulate enough asteroids spawned and none remaining
    allowSpawning.value = false;

    let now = Date.now();
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    updateLevelFlow(() => {});
    // advance time to satisfy pending level-up delay
    now += 2000;
    updateLevelFlow(() => {});

    expect(levelEvents.length).toBe(1);
    expect(levelEvents[0]!.newLevel).toBe(gameLevel.value);
    expect(transitionEvents.length).toBe(1);
    expect((services.audioService.stopMusic as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
  });
});
