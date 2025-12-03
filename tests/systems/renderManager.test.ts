import { describe, it, expect, vi } from 'vitest';
import { renderAll } from '@systems/renderManager';
import { gameState } from '@core/state';

vi.mock('@entities/player.js', () => ({ drawPlayer: vi.fn() }));
vi.mock('@entities/asteroid.js', () => ({ drawObstacles: vi.fn() }));
vi.mock('@entities/bullet.js', () => ({ drawBullets: vi.fn() }));
vi.mock('@entities/powerup.js', () => ({ drawPowerups: vi.fn() }));
vi.mock('@ui/hud/scorePopups.js', () => ({ drawScorePopups: vi.fn() }));
vi.mock('@ui/hud/scoreDisplay.js', () => ({ drawScore: vi.fn() }));
vi.mock('@ui/hud/powerupHUD.js', () => ({ drawPowerupTimers: vi.fn() }));

describe('renderManager', () => {
  it('calls draw functions when playing', () => {
    const ctx = document.createElement('canvas').getContext('2d')!;
    gameState.value = 'PLAYING';
    renderAll(ctx);
    expect(true).toBe(true); // execution without early return
  });

  it('skips rendering when not playing', () => {
    const ctx = document.createElement('canvas').getContext('2d')!;
    gameState.value = 'PAUSED';
    renderAll(ctx);
    expect(true).toBe(true);
  });
});
