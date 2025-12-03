import { describe, it, expect, vi } from 'vitest';
import { renderAll } from '@systems/renderManager';
import { gameState } from '@core/state';
import { drawPlayer } from '@entities/player.js';
import { drawObstacles } from '@entities/asteroid.js';
import { drawBullets } from '@entities/bullet.js';
import { drawPowerups } from '@entities/powerup.js';
import { drawScorePopups } from '@ui/hud/scorePopups.js';
import { drawScore } from '@ui/hud/scoreDisplay.js';
import { drawPowerupTimers } from '@ui/hud/powerupHUD.js';

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
    expect(drawPlayer).toHaveBeenCalled();
    expect(drawObstacles).toHaveBeenCalled();
    expect(drawBullets).toHaveBeenCalled();
    expect(drawPowerups).toHaveBeenCalled();
    expect(drawScore).toHaveBeenCalled();
    expect(drawScorePopups).toHaveBeenCalled();
    expect(drawPowerupTimers).toHaveBeenCalled();
  });

  it('skips rendering when not playing', () => {
    const ctx = document.createElement('canvas').getContext('2d')!;
    gameState.value = 'PAUSED';
    renderAll(ctx);
    expect(drawPlayer).not.toHaveBeenCalled();
    expect(drawObstacles).not.toHaveBeenCalled();
    expect(drawBullets).not.toHaveBeenCalled();
    expect(drawPowerups).not.toHaveBeenCalled();
    expect(drawScore).not.toHaveBeenCalled();
    expect(drawScorePopups).not.toHaveBeenCalled();
    expect(drawPowerupTimers).not.toHaveBeenCalled();
  });
});
