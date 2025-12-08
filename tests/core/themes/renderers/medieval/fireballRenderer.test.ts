import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawFireball } from '@core/themes/renderers/medieval/fireballRenderer';
import { createMockMedievalContext, createTestBullet } from '../../../../helpers/medievalTestUtils';

vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    colors: { bullet: '#ef4444' },
  })),
}));

describe('drawFireball', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  it('renders glowing core with theme bullet color', () => {
    const ctx = createMockMedievalContext();
    const bullet = createTestBullet();

    drawFireball(ctx, bullet);

    expect(ctx.createRadialGradient).toHaveBeenCalledWith(
      bullet.x,
      bullet.y,
      0,
      bullet.x,
      bullet.y,
      bullet.radius
    );
    expect(ctx.__gradientStops).toEqual([
      [0, '#ffffff'],
      [0.3, '#ef4444'],
      [1, 'rgba(239, 68, 68, 0.3)'],
    ]);
    expect(ctx.shadowBlur).toBe(0); // Reset after outer glow
  });

  it('draws a fading particle trail and restores alpha', () => {
    const ctx = createMockMedievalContext();
    const bullet = createTestBullet({ radius: 8 });

    drawFireball(ctx, bullet);

    const smokeSegments = ctx.__fillHistory.filter((value) => value === '#9ca3af').length;
    expect(smokeSegments).toBeGreaterThan(0);
    expect(ctx.globalAlpha).toBe(1);
  });
});
