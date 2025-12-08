import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { drawDragon } from '@core/themes/renderers/medieval/dragonRenderer';
import { playerState } from '@core/state/playerState';
import type { Player } from '@types';
import { createMockMedievalContext } from '../../../../helpers/medievalTestUtils';

vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    colors: {
      player: '#d97706',
      playerEngine: 'rgba(239, 68, 68, 0.6)',
      playerShield: '#a855f7',
    },
  })),
}));

vi.mock('@utils/platform', () => ({
  isMobile: vi.fn(() => false),
}));

function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    x: 50,
    y: 50,
    width: 40,
    height: 50,
    speed: 7,
    dx: 0,
    dy: 0,
    overridePosition: null,
    ...overrides,
  };
}

describe('drawDragon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    playerState.clearPowerups();
  });

  afterEach(() => {
    playerState.clearPowerups();
  });

  it('renders fire breath and shield when moving on desktop', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(false);

    const ctx = createMockMedievalContext();
    const player = createPlayer({ dy: 1 });
    playerState.activatePowerup('shield', 60);

    drawDragon(ctx, player);

    // Fire breath + shield should draw arcs and restore alpha
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.globalAlpha).toBe(1);
    expect(ctx.__strokeHistory).toContain('#a855f7'); // shield color used
  });

  it('skips fire breath on mobile devices', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(true);

    const ctx = createMockMedievalContext();
    const player = createPlayer({ dy: 2 });

    drawDragon(ctx, player);

    // No fire particles drawn, so no flame colors recorded
    const flameColors = ctx.__fillHistory.filter((color) =>
      ['#fbbf24', '#fb923c', '#dc2626', 'rgba(239, 68, 68, 0.6)'].includes(String(color))
    );
    expect(flameColors.length).toBe(0);
  });
});
