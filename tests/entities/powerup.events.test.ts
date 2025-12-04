import { describe, it, expect, beforeEach } from 'vitest';
import { eventBus } from '@core/events/EventBus.js';
import {
  GameEvent,
  type PowerupCollectedEvent,
  type PowerupExpiredEvent,
} from '@core/events/GameEvents.js';
import { playerState } from '@core/state.js';
import { activePowerups, updatePowerups, spawnPowerup } from '@entities/powerup';

describe('Powerup events', () => {
  const collected: PowerupCollectedEvent[] = [];
  const expired: PowerupExpiredEvent[] = [];

  beforeEach(() => {
    collected.length = 0;
    expired.length = 0;
    playerState.reset();
    activePowerups.length = 0;
    eventBus.clearAll();
    eventBus.on<PowerupCollectedEvent>(GameEvent.POWERUP_COLLECTED, (p) => collected.push(p));
    eventBus.on<PowerupExpiredEvent>(GameEvent.POWERUP_EXPIRED, (p) => expired.push(p));
  });

  it('emits collected and expired events', () => {
    spawnPowerup(800);
    // force collision by aligning with player
    const p = activePowerups[0];
    if (!p) throw new Error('Expected a spawned powerup');
    p.x = playerState.player.x;
    p.y = playerState.player.y;

    updatePowerups(600);

    expect(collected.length).toBe(1);

    // set active and expire quickly
    playerState.powerUps.shield.active = true;
    playerState.powerUps.shield.timer = 1;
    updatePowerups(600);
    expect(expired.length).toBe(1);
  });
});
