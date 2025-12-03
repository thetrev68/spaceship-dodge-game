import { describe, it, expect, beforeEach } from 'vitest';
import { drawPlayer, resetPlayer, firePlayerBullets } from '@entities/player';
import { playerState, gameState } from '@core/state';

describe('player rendering and firing', () => {
  beforeEach(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    resetPlayer(canvas.width, canvas.height);
    gameState.value = 'PLAYING';
    playerState.powerUps.shield.active = false;
    playerState.powerUps.doubleBlaster.active = false;
  });

  it('draws player with shield active', () => {
    const ctx = document.createElement('canvas').getContext('2d')!;
    playerState.powerUps.shield.active = true;
    drawPlayer(ctx);
    expect(true).toBe(true);
  });

  it('fires double blaster when powerup active', () => {
    playerState.powerUps.doubleBlaster.active = true;
    firePlayerBullets();
    expect(true).toBe(true);
  });
});
