import { describe, it, expect, beforeEach } from 'vitest';
import { eventBus } from '@core/events/EventBus';
import { GameEvent, type AsteroidDestroyedEvent, type BonusAwardedEvent, type PowerupCollectedEvent, type PowerupExpiredEvent } from '@core/events/GameEvents';
import { updateScorePopups, __getTestPopupCount } from '@ui/hud/scorePopups';

describe('scorePopups event handling', () => {
  beforeEach(() => {
    // reset DOM canvas to avoid isMobile mocks
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
  });

  it('creates popups on emitted events', () => {
    // Verify that events create popups and update doesn't throw
    eventBus.emit<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, {
      position: { x: 10, y: 10 },
      score: 5,
      size: 10,
      sizeLevel: 0,
    });

    eventBus.emit<BonusAwardedEvent>(GameEvent.BONUS_AWARDED, {
      bonusType: 'fragment',
      bonusAmount: 15,
      position: { x: 20, y: 20 },
    });

    eventBus.emit<PowerupCollectedEvent>(GameEvent.POWERUP_COLLECTED, {
      type: 'shield',
      duration: 1000,
      position: { x: 30, y: 30 },
    });

    eventBus.emit<PowerupExpiredEvent>(GameEvent.POWERUP_EXPIRED, {
      type: 'shield',
    });

    // Verify that popups were created
    expect(__getTestPopupCount()).toBeGreaterThan(0);

    // Advance animation one tick and ensure it doesn't throw
    expect(() => updateScorePopups()).not.toThrow();
  });
});
