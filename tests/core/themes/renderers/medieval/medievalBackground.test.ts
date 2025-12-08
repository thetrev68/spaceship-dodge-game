import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMedievalBackground } from '@core/themes/renderers/medieval/medievalBackground';
import { createMockCanvas } from '../../../../helpers/mockCanvas';
import { createMockMedievalContext } from '../../../../helpers/medievalTestUtils';

vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    colors: {
      starfield: '#fbbf24',
    },
  })),
}));

vi.mock('@utils/platform', () => ({
  isMobile: vi.fn(() => false),
}));

describe('setupMedievalBackground', () => {
  let originalRaf: typeof requestAnimationFrame;

  beforeEach(() => {
    vi.clearAllMocks();
    originalRaf = globalThis.requestAnimationFrame;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
  });

  it('draws gradient sky, moon, castles, and embers on desktop', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(false);

    const canvas = createMockCanvas();
    const ctx = createMockMedievalContext();
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);

    const raf = vi.fn();
    globalThis.requestAnimationFrame = raf as unknown as typeof requestAnimationFrame;

    setupMedievalBackground(ctx, canvas);

    // First animation frame scheduled
    expect(raf).toHaveBeenCalledTimes(1);
    const animate = raf.mock.calls[0][0] as FrameRequestCallback;
    animate(0);

    expect(ctx.createLinearGradient).toHaveBeenCalled(); // sky gradient
    expect(ctx.createRadialGradient).toHaveBeenCalled(); // moon glow
    expect(ctx.fillRect).toHaveBeenCalled(); // sky and moon glow
    expect(ctx.arc).toHaveBeenCalled(); // embers and moon
  });

  it('skips moon and castle layers on mobile', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(true);

    const canvas = createMockCanvas();
    const ctx = createMockMedievalContext();
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);

    const raf = vi.fn();
    globalThis.requestAnimationFrame = raf as unknown as typeof requestAnimationFrame;

    setupMedievalBackground(ctx, canvas);
    const animate = raf.mock.calls[0][0] as FrameRequestCallback;
    animate(0);

    // No moon glow or castle layers when mobile
    expect(ctx.createRadialGradient).not.toHaveBeenCalled();
  });
});
