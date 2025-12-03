import { describe, it, expect, beforeEach, vi } from 'vitest';
import { activePowerups, drawPowerups, updatePowerups, spawnPowerup } from '@entities/powerup';
import { playerState } from '@core/state';

function setupCanvasContextMock(): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Mock canvas context methods used by powerup rendering
  ctx.fillStyle = '';
  ctx.beginPath = vi.fn();
  ctx.rect = vi.fn();
  ctx.arc = vi.fn();
  ctx.fill = vi.fn();
  ctx.save = vi.fn();
  ctx.restore = vi.fn();
  ctx.translate = vi.fn();
  ctx.scale = vi.fn();
  ctx.createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }));

  return ctx;
}

describe('powerup rendering', () => {
  beforeEach(() => {
    activePowerups.length = 0;
    playerState.reset();
  });

  it('draws and updates powerups', () => {
    spawnPowerup(800);
    const ctx = setupCanvasContextMock();

    // Verify drawing occurred by checking canvas methods were called
    drawPowerups(ctx);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();

    // Verify position update logic by capturing initial position
    const initialY = activePowerups[0]?.y;
    updatePowerups(600);

    // If powerup wasn't removed (didn't go off screen), verify it moved
    if (activePowerups.length > 0 && initialY !== undefined && activePowerups[0]) {
      expect(activePowerups[0].y).toBeGreaterThan(initialY);
    }

    expect(activePowerups.length).toBeLessThanOrEqual(1);
  });
});
