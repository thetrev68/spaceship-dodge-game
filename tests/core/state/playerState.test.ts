import { describe, it, expect, beforeEach } from 'vitest';
import { playerState } from '@core/state';

describe('player state', () => {
  beforeEach(() => {
    playerState.reset();
  });

  it('activates and ticks powerups safely', () => {
    playerState.activatePowerup('doubleBlaster', 2);
    expect(playerState.powerUps.doubleBlaster.active).toBe(true);
    expect(playerState.powerUps.doubleBlaster.timer).toBe(2);

    playerState.tickPowerups();
    expect(playerState.powerUps.doubleBlaster.timer).toBe(1);

    playerState.tickPowerups();
    expect(playerState.powerUps.doubleBlaster.active).toBe(false);

    // Invalid powerup key should be ignored
    // @ts-expect-error invalid key is intentional for guard coverage
    playerState.activatePowerup('unknown', 5);
    expect(playerState.powerUps.shield.active).toBe(false);
  });

  it('clears powerups and resets player data', () => {
    playerState.activatePowerup('shield', 5);
    playerState.clearPowerups();
    expect(playerState.powerUps.shield.active).toBe(false);

    playerState.setPlayer({
      ...playerState.player,
      x: 10,
      y: 20,
      width: 10,
      height: 10,
      speed: 5,
      dx: 1,
      dy: 1,
      overridePosition: null,
    });
    expect(playerState.player.x).toBe(10);
    playerState.reset();
    expect(playerState.player.x).not.toBe(10);

    playerState.setPlayer(null);
    expect(playerState.player.x).toBeDefined();
  });
});
