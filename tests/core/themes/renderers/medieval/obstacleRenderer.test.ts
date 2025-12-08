import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { drawMedievalObstacle } from '@core/themes/renderers/medieval/obstacleRenderer';
import type { Asteroid } from '@types';
import {
  createMockMedievalContext,
  createTestAsteroid,
} from '../../../../helpers/medievalTestUtils';

vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    colors: {
      asteroid: '#78716c',
      starfield: '#fbbf24',
    },
  })),
}));

vi.mock('@utils/platform', () => ({
  isMobile: vi.fn(() => false),
}));

describe('drawMedievalObstacle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('draws wyvern silhouette for large obstacles', () => {
    const ctx = createMockMedievalContext();
    const wyvern: Asteroid = createTestAsteroid({ radius: 40, dx: 2, dy: 1, rotation: 0.5 });

    drawMedievalObstacle(ctx, wyvern);

    // Wyvern branch applies translate+rotate for movement orientation
    expect(ctx.translate).toHaveBeenCalledWith(wyvern.x + wyvern.radius, wyvern.y + wyvern.radius);
    expect(ctx.rotate).toHaveBeenCalled();
    // Wings + body paths should produce multiple fill/stroke calls
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('adds forward glow for bats via radial gradient', () => {
    const ctx = createMockMedievalContext();
    const bat: Asteroid = createTestAsteroid({ radius: 18, dx: 0, dy: 3, rotation: 0.25 });

    drawMedievalObstacle(ctx, bat);

    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1);
    expect(ctx.__gradientStops).toEqual([
      [0, '#DC2626'],
      [1, 'transparent'],
    ]);
  });

  it('renders crystal orbit particles on desktop but not mobile', async () => {
    const desktopCtx = createMockMedievalContext();
    const crystal: Asteroid = createTestAsteroid({ radius: 12, rotation: Math.PI / 4 });
    const { isMobile } = await import('@utils/platform');

    vi.mocked(isMobile).mockReturnValue(false);
    drawMedievalObstacle(desktopCtx, crystal);
    const desktopArcMock = desktopCtx.arc as unknown as MockInstance;
    const desktopArcCount = desktopArcMock.mock.calls.length;
    expect(desktopCtx.globalAlpha).toBe(1);

    vi.mocked(isMobile).mockReturnValue(true);
    const mobileCtx = createMockMedievalContext();
    drawMedievalObstacle(mobileCtx, crystal);
    const mobileArcMock = mobileCtx.arc as unknown as MockInstance;
    const mobileArcCount = mobileArcMock.mock.calls.length;

    // Desktop path draws extra orbiting particles
    expect(desktopArcCount).toBeGreaterThan(mobileArcCount);
  });
});
