/**
 * Unit tests for ocean background (underwater theme)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setupOceanBackground } from '@core/themes/renderers/underwater/oceanBackground';

// Mock dependencies
vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    id: 'underwater',
    colors: {
      starfield: '#7dd3fc',
    },
  })),
}));

vi.mock('@utils/platform', () => ({
  isMobile: vi.fn(() => false),
}));

function createMockCanvas() {
  const ctx = {
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
  };

  const canvas = {
    getContext: vi.fn(() => ctx),
    width: 800,
    height: 600,
    addEventListener: vi.fn(),
  };

  return { canvas, ctx };
}

describe('setupOceanBackground', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let rafCallCount = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallCount = 0;
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // Only call callback once to prevent infinite loop
      if (rafCallCount === 0) {
        rafCallCount++;
        setTimeout(() => cb(0), 0);
      }
      return rafCallCount;
    });
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
  });

  afterEach(() => {
    rafSpy.mockRestore();
    addEventListenerSpy.mockRestore();
  });

  it('should initialize canvas and context', () => {
    const { canvas } = createMockCanvas();

    setupOceanBackground(canvas as unknown as HTMLCanvasElement);

    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should handle missing context gracefully', () => {
    const canvas = {
      getContext: vi.fn(() => null),
      width: 800,
      height: 600,
      addEventListener: vi.fn(),
    };

    expect(() => {
      setupOceanBackground(canvas as unknown as HTMLCanvasElement);
    }).not.toThrow();
  });

  it('should create ocean gradient', () => {
    const { canvas, ctx } = createMockCanvas();

    setupOceanBackground(canvas as unknown as HTMLCanvasElement);

    // Should create linear gradient
    expect(ctx.createLinearGradient).toHaveBeenCalled();
  });

  it('should create sunbeam gradient on desktop', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(false);

    const { canvas, ctx } = createMockCanvas();

    setupOceanBackground(canvas as unknown as HTMLCanvasElement);

    // Should create radial gradient for sunbeam
    expect(ctx.createRadialGradient).toHaveBeenCalled();
  });

  it('should skip sunbeam on mobile', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(true);

    const { canvas, ctx } = createMockCanvas();

    setupOceanBackground(canvas as unknown as HTMLCanvasElement);

    // Should NOT create radial gradient
    expect(ctx.createRadialGradient).not.toHaveBeenCalled();
  });

  it('should initialize plankton particles', () => {
    const { canvas, ctx } = createMockCanvas();

    setupOceanBackground(canvas as unknown as HTMLCanvasElement);

    // Should draw circles for plankton
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('should use fewer particles on mobile', async () => {
    const { isMobile } = await import('@utils/platform');

    // Desktop
    vi.mocked(isMobile).mockReturnValue(false);
    const { canvas: desktopCanvas, ctx: desktopCtx } = createMockCanvas();
    setupOceanBackground(desktopCanvas as unknown as HTMLCanvasElement);
    const desktopArcCount = desktopCtx.arc.mock.calls.length;

    // Mobile
    vi.mocked(isMobile).mockReturnValue(true);
    const { canvas: mobileCanvas, ctx: mobileCtx } = createMockCanvas();
    setupOceanBackground(mobileCanvas as unknown as HTMLCanvasElement);
    const mobileArcCount = mobileCtx.arc.mock.calls.length;

    // Desktop should have more particles
    expect(desktopArcCount).toBeGreaterThan(mobileArcCount);
  });

  it('should set up resize handler', () => {
    const { canvas } = createMockCanvas();

    setupOceanBackground(canvas as unknown as HTMLCanvasElement);

    // Should add resize listener to window
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should start animation loop', () => {
    const { canvas } = createMockCanvas();

    setupOceanBackground(canvas as unknown as HTMLCanvasElement);

    // Should call requestAnimationFrame
    expect(rafSpy).toHaveBeenCalled();
  });
});
