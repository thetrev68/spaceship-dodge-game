import { describe, it, expect, beforeEach } from 'vitest';
import { activePowerups, drawPowerups, updatePowerups, spawnPowerup } from '@entities/powerup';
import { playerState } from '@core/state';

describe('powerup rendering', () => {
  beforeEach(() => {
    activePowerups.length = 0;
    playerState.reset();
  });

  it('draws and updates powerups', () => {
    spawnPowerup(800);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (ctx) {
      // add missing rect to mocked context
      (ctx as any).rect = () => {};
    }
    drawPowerups(ctx);
    updatePowerups(600);
    expect(activePowerups.length).toBeLessThanOrEqual(1);
  });
});
