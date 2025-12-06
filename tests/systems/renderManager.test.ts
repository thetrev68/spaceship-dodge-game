import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderAll } from '@systems/renderManager';
import { gameState, playerState, entityState } from '@core/state';
import { drawPlayer } from '@entities/player.js';
import { drawAsteroid } from '@entities/asteroid.js';
import { drawBullet } from '@entities/bullet.js';
import { drawPowerups, drawShieldPowerup, drawDoubleBlasterPowerup } from '@entities/powerup.js';
import { drawScorePopups } from '@ui/hud/scorePopups.js';
import { drawScore } from '@ui/hud/scoreDisplay.js';
import { drawPowerupTimers } from '@ui/hud/powerupHUD.js';
import { getCurrentTheme } from '@core/themes';
import { activePowerups } from '@entities/powerup.js';

// Mock all the rendering functions
vi.mock('@entities/player.js', () => ({ drawPlayer: vi.fn() }));
vi.mock('@entities/asteroid.js', () => ({
  drawAsteroid: vi.fn(),
  drawObstacles: vi.fn(), // Keep for backward compat
}));
vi.mock('@entities/bullet.js', () => ({
  drawBullet: vi.fn(),
  drawBullets: vi.fn(), // Keep for backward compat
}));
vi.mock('@entities/powerup.js', () => ({
  drawShieldPowerup: vi.fn(),
  drawDoubleBlasterPowerup: vi.fn(),
  drawPowerups: vi.fn(), // Keep for backward compat
  activePowerups: [], // Mock the array
}));
vi.mock('@ui/hud/scorePopups.js', () => ({ drawScorePopups: vi.fn() }));
vi.mock('@ui/hud/scoreDisplay.js', () => ({ drawScore: vi.fn() }));
vi.mock('@ui/hud/powerupHUD.js', () => ({ drawPowerupTimers: vi.fn() }));

// Mock theme system
vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    id: 'default',
    name: 'Default',
    colors: {},
    uiColors: {},
    fonts: {},
    // No custom renderers - use defaults
  })),
}));

// Mock state
vi.mock('@core/state', () => ({
  gameState: { value: 'PLAYING' },
  playerState: {
    player: { x: 0, y: 0, width: 40, height: 40 },
  },
  entityState: {
    getMutableObstacles: vi.fn(() => []),
    getMutableBullets: vi.fn(() => []),
  },
}));

describe('renderManager', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    vi.clearAllMocks();
    gameState.value = 'PLAYING';
    mockCanvas = document.createElement('canvas');
    mockCtx = mockCanvas.getContext('2d')!;

    // Reset mocked arrays
    vi.mocked(entityState.getMutableObstacles).mockReturnValue([]);
    vi.mocked(entityState.getMutableBullets).mockReturnValue([]);
    (activePowerups as any).length = 0;

    // Reset theme to default
    vi.mocked(getCurrentTheme).mockReturnValue({
      id: 'default',
      name: 'Default',
      description: 'Default theme',
      colors: {} as any,
      uiColors: {} as any,
      fonts: {} as any,
    } as any);
  });

  describe('Game State Guards', () => {
    it('renders when game state is PLAYING', () => {
      gameState.value = 'PLAYING';
      renderAll(mockCtx);

      expect(drawPlayer).toHaveBeenCalled();
      expect(drawScore).toHaveBeenCalled();
    });

    it('skips rendering when game state is PAUSED', () => {
      gameState.value = 'PAUSED';
      renderAll(mockCtx);

      expect(drawPlayer).not.toHaveBeenCalled();
      expect(drawAsteroid).not.toHaveBeenCalled();
      expect(drawBullet).not.toHaveBeenCalled();
      expect(drawScore).not.toHaveBeenCalled();
    });

    it('skips rendering when game state is START', () => {
      gameState.value = 'START';
      renderAll(mockCtx);

      expect(drawPlayer).not.toHaveBeenCalled();
    });

    it('skips rendering when game state is GAME_OVER', () => {
      gameState.value = 'GAME_OVER';
      renderAll(mockCtx);

      expect(drawPlayer).not.toHaveBeenCalled();
    });

    it('skips rendering when game state is LEVEL_TRANSITION', () => {
      gameState.value = 'LEVEL_TRANSITION';
      renderAll(mockCtx);

      expect(drawPlayer).not.toHaveBeenCalled();
    });
  });

  describe('Default Rendering (No Custom Renderers)', () => {
    it('calls drawPlayer for player rendering', () => {
      renderAll(mockCtx);

      expect(drawPlayer).toHaveBeenCalledWith(mockCtx);
      expect(drawPlayer).toHaveBeenCalledTimes(1);
    });

    it('calls drawAsteroid for each obstacle', () => {
      const mockObstacles = [
        { id: 1, x: 100, y: 100 },
        { id: 2, x: 200, y: 200 },
        { id: 3, x: 300, y: 300 },
      ];

      vi.mocked(entityState.getMutableObstacles).mockReturnValue(mockObstacles as any);
      renderAll(mockCtx);

      expect(drawAsteroid).toHaveBeenCalledTimes(3);
      expect(drawAsteroid).toHaveBeenCalledWith(mockCtx, mockObstacles[0]);
      expect(drawAsteroid).toHaveBeenCalledWith(mockCtx, mockObstacles[1]);
      expect(drawAsteroid).toHaveBeenCalledWith(mockCtx, mockObstacles[2]);
    });

    it('calls drawBullet for each bullet', () => {
      const mockBullets = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ];

      vi.mocked(entityState.getMutableBullets).mockReturnValue(mockBullets as any);
      renderAll(mockCtx);

      expect(drawBullet).toHaveBeenCalledTimes(2);
      expect(drawBullet).toHaveBeenCalledWith(mockCtx, mockBullets[0]);
      expect(drawBullet).toHaveBeenCalledWith(mockCtx, mockBullets[1]);
    });

    it('handles empty entity arrays', () => {
      vi.mocked(entityState.getMutableObstacles).mockReturnValue([]);
      vi.mocked(entityState.getMutableBullets).mockReturnValue([]);

      renderAll(mockCtx);

      expect(drawAsteroid).not.toHaveBeenCalled();
      expect(drawBullet).not.toHaveBeenCalled();
    });

    it('always renders HUD elements', () => {
      renderAll(mockCtx);

      expect(drawScore).toHaveBeenCalledWith(mockCtx);
      expect(drawScorePopups).toHaveBeenCalledWith(mockCtx);
      expect(drawPowerupTimers).toHaveBeenCalledWith(mockCtx);
    });
  });

  describe('Custom Player Renderer', () => {
    it('calls custom player renderer when provided', () => {
      const customPlayerRenderer = vi.fn();
      const player = { x: 50, y: 50, width: 40, height: 40 };
      (playerState as any).player = player;

      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'custom',
        name: 'Custom',
        description: 'Custom theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          player: customPlayerRenderer,
        },
      } as any);

      renderAll(mockCtx);

      expect(customPlayerRenderer).toHaveBeenCalledWith(mockCtx, player);
      expect(drawPlayer).not.toHaveBeenCalled();
    });

    it('falls back to default when custom renderer is undefined', () => {
      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'partial',
        name: 'Partial',
        description: 'Partial theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          // No player renderer
          obstacle: vi.fn(),
        },
      } as any);

      renderAll(mockCtx);

      expect(drawPlayer).toHaveBeenCalled();
    });
  });

  describe('Custom Obstacle Renderer', () => {
    it('calls custom obstacle renderer for each obstacle', () => {
      const customObstacleRenderer = vi.fn();
      const mockObstacles = [
        { id: 1, x: 100, y: 100 },
        { id: 2, x: 200, y: 200 },
      ];

      vi.mocked(entityState.getMutableObstacles).mockReturnValue(mockObstacles as any);
      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'custom',
        name: 'Custom',
        description: 'Custom theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          obstacle: customObstacleRenderer,
        },
      } as any);

      renderAll(mockCtx);

      expect(customObstacleRenderer).toHaveBeenCalledTimes(2);
      expect(customObstacleRenderer).toHaveBeenCalledWith(mockCtx, mockObstacles[0]);
      expect(customObstacleRenderer).toHaveBeenCalledWith(mockCtx, mockObstacles[1]);
      expect(drawAsteroid).not.toHaveBeenCalled();
    });
  });

  describe('Custom Bullet Renderer', () => {
    it('calls custom bullet renderer for each bullet', () => {
      const customBulletRenderer = vi.fn();
      const mockBullets = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 300, y: 300 },
      ];

      vi.mocked(entityState.getMutableBullets).mockReturnValue(mockBullets as any);
      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'custom',
        name: 'Custom',
        description: 'Custom theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          bullet: customBulletRenderer,
        },
      } as any);

      renderAll(mockCtx);

      expect(customBulletRenderer).toHaveBeenCalledTimes(3);
      expect(customBulletRenderer).toHaveBeenCalledWith(mockCtx, mockBullets[0]);
      expect(customBulletRenderer).toHaveBeenCalledWith(mockCtx, mockBullets[1]);
      expect(customBulletRenderer).toHaveBeenCalledWith(mockCtx, mockBullets[2]);
      expect(drawBullet).not.toHaveBeenCalled();
    });
  });

  describe('Powerup Rendering', () => {
    it('delegates to drawPowerups when active powerups exist and no custom renderer', () => {
      const shieldPowerup = { x: 100, y: 100, type: 'shield', size: 40, dy: 1 };
      (activePowerups as any).push(shieldPowerup);

      renderAll(mockCtx);

      // renderManager now calls the aggregate `drawPowerups` when no theme
      // powerup renderers are provided. Ensure aggregate is invoked and the
      // individual helpers are not called directly in this default path.
      expect(drawPowerups).toHaveBeenCalledWith(mockCtx);
      expect(drawShieldPowerup).not.toHaveBeenCalled();
    });

    it('calls aggregate drawPowerups for doubleBlaster powerups when no custom renderer', () => {
      const blasterPowerup = { x: 200, y: 200, type: 'doubleBlaster', size: 40, dy: 1 };
      (activePowerups as any).push(blasterPowerup);

      renderAll(mockCtx);

      expect(drawPowerups).toHaveBeenCalledWith(mockCtx);
      expect(drawDoubleBlasterPowerup).not.toHaveBeenCalled();
    });

    it('uses aggregate drawPowerups for mixed powerups when no custom renderers', () => {
      const shieldPowerup = { x: 100, y: 100, type: 'shield', size: 40, dy: 1 };
      const blasterPowerup = { x: 200, y: 200, type: 'doubleBlaster', size: 40, dy: 1 };
      (activePowerups as any).push(shieldPowerup, blasterPowerup);

      renderAll(mockCtx);

      expect(drawPowerups).toHaveBeenCalledWith(mockCtx);
      expect(drawShieldPowerup).not.toHaveBeenCalled();
      expect(drawDoubleBlasterPowerup).not.toHaveBeenCalled();
    });

    it('calls custom shield renderer when provided', () => {
      const customShieldRenderer = vi.fn();
      const shieldPowerup = { x: 100, y: 100, type: 'shield', size: 40, dy: 1 };
      (activePowerups as any).push(shieldPowerup);

      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'custom',
        name: 'Custom',
        description: 'Custom theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          powerups: {
            shield: customShieldRenderer,
          },
        },
      } as any);

      renderAll(mockCtx);

      expect(customShieldRenderer).toHaveBeenCalledWith(mockCtx, shieldPowerup);
      expect(drawShieldPowerup).not.toHaveBeenCalled();
    });

    it('calls custom doubleBlaster renderer when provided', () => {
      const customBlasterRenderer = vi.fn();
      const blasterPowerup = { x: 200, y: 200, type: 'doubleBlaster', size: 40, dy: 1 };
      (activePowerups as any).push(blasterPowerup);

      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'custom',
        name: 'Custom',
        description: 'Custom theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          powerups: {
            doubleBlaster: customBlasterRenderer,
          },
        },
      } as any);

      renderAll(mockCtx);

      expect(customBlasterRenderer).toHaveBeenCalledWith(mockCtx, blasterPowerup);
      expect(drawDoubleBlasterPowerup).not.toHaveBeenCalled();
    });

    it('falls back to default shield renderer when only doubleBlaster custom renderer provided', () => {
      const customBlasterRenderer = vi.fn();
      const shieldPowerup = { x: 100, y: 100, type: 'shield', size: 40, dy: 1 };
      (activePowerups as any).push(shieldPowerup);

      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'custom',
        name: 'Custom',
        description: 'Custom theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          powerups: {
            doubleBlaster: customBlasterRenderer,
            // No shield renderer - should fall back to default
          },
        },
      } as any);

      renderAll(mockCtx);

      expect(drawShieldPowerup).toHaveBeenCalledWith(mockCtx, shieldPowerup);
    });

    it('handles empty powerups array', () => {
      (activePowerups as any).length = 0;

      renderAll(mockCtx);

      expect(drawShieldPowerup).not.toHaveBeenCalled();
      expect(drawDoubleBlasterPowerup).not.toHaveBeenCalled();
    });
  });

  describe('Canvas Context Management', () => {
    it('calls save and restore on context', () => {
      const saveSpy = vi.spyOn(mockCtx, 'save');
      const restoreSpy = vi.spyOn(mockCtx, 'restore');

      renderAll(mockCtx);

      expect(saveSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
    });

    it('sets default canvas styles', () => {
      renderAll(mockCtx);

      expect(mockCtx.globalAlpha).toBe(1.0);
      expect(mockCtx.fillStyle).toBe('white');
      expect(mockCtx.font).toBe('16px Inter');
    });
  });

  describe('Integration: Full Custom Theme', () => {
    it('uses all custom renderers when provided', () => {
      const customPlayerRenderer = vi.fn();
      const customObstacleRenderer = vi.fn();
      const customBulletRenderer = vi.fn();
      const customShieldRenderer = vi.fn();
      const customBlasterRenderer = vi.fn();

      const player = { x: 50, y: 50, width: 40, height: 40 };
      const obstacles = [{ id: 1, x: 100, y: 100 }];
      const bullets = [{ x: 200, y: 200 }];
      const shieldPowerup = { x: 300, y: 300, type: 'shield', size: 40, dy: 1 };
      const blasterPowerup = { x: 400, y: 400, type: 'doubleBlaster', size: 40, dy: 1 };

      (playerState as any).player = player;
      vi.mocked(entityState.getMutableObstacles).mockReturnValue(obstacles as any);
      vi.mocked(entityState.getMutableBullets).mockReturnValue(bullets as any);
      (activePowerups as any).push(shieldPowerup, blasterPowerup);

      (playerState as any).player = player;
      vi.mocked(getCurrentTheme).mockReturnValue({
        id: 'underwater',
        name: 'Underwater',
        description: 'Underwater theme',
        colors: {} as any,
        uiColors: {} as any,
        fonts: {} as any,
        renderers: {
          player: customPlayerRenderer,
          obstacle: customObstacleRenderer,
          bullet: customBulletRenderer,
          powerups: {
            shield: customShieldRenderer,
            doubleBlaster: customBlasterRenderer,
          },
        },
      } as any);

      renderAll(mockCtx);

      // All custom renderers should be called
      expect(customPlayerRenderer).toHaveBeenCalledWith(mockCtx, player);
      expect(customObstacleRenderer).toHaveBeenCalledWith(mockCtx, obstacles[0]);
      expect(customBulletRenderer).toHaveBeenCalledWith(mockCtx, bullets[0]);
      expect(customShieldRenderer).toHaveBeenCalledWith(mockCtx, shieldPowerup);
      expect(customBlasterRenderer).toHaveBeenCalledWith(mockCtx, blasterPowerup);

      // No default renderers should be called
      expect(drawPlayer).not.toHaveBeenCalled();
      expect(drawAsteroid).not.toHaveBeenCalled();
      expect(drawBullet).not.toHaveBeenCalled();
      expect(drawShieldPowerup).not.toHaveBeenCalled();
      expect(drawDoubleBlasterPowerup).not.toHaveBeenCalled();

      // HUD should still be rendered (theme-agnostic)
      expect(drawScore).toHaveBeenCalled();
      expect(drawScorePopups).toHaveBeenCalled();
      expect(drawPowerupTimers).toHaveBeenCalled();
    });
  });
});
