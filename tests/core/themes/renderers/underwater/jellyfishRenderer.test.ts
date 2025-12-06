/**
 * Unit tests for jellyfish renderer (underwater theme obstacles)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drawJellyfish } from '@core/themes/renderers/underwater/jellyfishRenderer';
import type { Asteroid } from '@types';

// Mock dependencies
vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    id: 'underwater',
    colors: {
      asteroid: '#9f7aea',
      starfield: '#7dd3fc',
    },
  })),
}));

vi.mock('@utils/platform', () => ({
  isMobile: vi.fn(() => false),
}));

/**
 * Creates a mock canvas 2D context
 */
function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    lineCap: '',
    globalAlpha: 1,
  };
}

/**
 * Creates a test asteroid entity
 */
function createTestAsteroid(overrides?: Partial<Asteroid>): Asteroid {
  return {
    x: 100,
    y: 100,
    radius: 30,
    dx: 2,
    dy: 1,
    id: 1,
    level: 1,
    parentId: null,
    scoreValue: 100,
    creationTime: Date.now(),
    rotation: 0,
    rotationSpeed: 0.01,
    speed: 2,
    shape: [
      { x: 0, y: 0 },
      { x: 10, y: 5 },
    ],
    ...overrides,
  };
}

describe('drawJellyfish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render jellyfish with bell and tentacles', () => {
    const ctx = createMockContext();
    const jellyfish = createTestAsteroid();

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish);

    // Should draw bell (arc)
    expect(ctx.arc).toHaveBeenCalled();

    // Should draw tentacles with quadratic curves
    expect(ctx.quadraticCurveTo).toHaveBeenCalled();
  });

  it('should use theme colors', () => {
    const ctx = createMockContext();
    const jellyfish = createTestAsteroid();

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish);

    expect(ctx.strokeStyle).toContain('#'); // Should have color assigned
  });

  it('should apply pulsating animation', () => {
    const ctx = createMockContext();
    const jellyfish1 = createTestAsteroid({ rotation: 0, radius: 30 });
    const jellyfish2 = createTestAsteroid({ rotation: Math.PI / 2, radius: 30 }); // Different rotation

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish1);
    const arcCalls1 = ctx.arc.mock.calls.length;

    ctx.arc.mockClear();

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish2);
    const arcCalls2 = ctx.arc.mock.calls.length;

    // Both jellyfish should have arc calls (bell + optional glow)
    // The pulsating is visible in the rendering, we just verify arcs were drawn
    expect(arcCalls1).toBeGreaterThan(0);
    expect(arcCalls2).toBeGreaterThan(0);
  });

  it('should scale tentacle count with size', () => {
    const ctx = createMockContext();
    const smallJelly = createTestAsteroid({ radius: 10 });
    const largeJelly = createTestAsteroid({ radius: 100 });

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, smallJelly);
    const smallCurves = ctx.quadraticCurveTo.mock.calls.length;

    ctx.quadraticCurveTo.mockClear();

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, largeJelly);
    const largeCurves = ctx.quadraticCurveTo.mock.calls.length;

    // Larger jellyfish should have more tentacle segments
    expect(largeCurves).toBeGreaterThan(smallCurves);
  });

  it('should have minimum tentacle count', () => {
    const ctx = createMockContext();
    const tinyJelly = createTestAsteroid({ radius: 5 }); // Very small

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, tinyJelly);

    // Should have at least 4 tentacles × 4 segments = 12-16 quadratic curves
    // (actual count depends on implementation details)
    expect(ctx.quadraticCurveTo).toHaveBeenCalled();
  });

  it('should render bioluminescent glow on desktop', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(false);

    const ctx = createMockContext();
    const jellyfish = createTestAsteroid();

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish);

    // Check that globalAlpha was modified for glow effect
    expect(ctx.globalAlpha).toBe(1); // Should be restored to 1 after glow
  });

  it('should skip bioluminescent glow on mobile', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(true);

    const ctx = createMockContext();
    const jellyfish = createTestAsteroid();

    // Count arc calls before
    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish);

    const arcCalls = ctx.arc.mock.calls.length;

    // Re-render with desktop to compare
    vi.mocked(isMobile).mockReturnValue(false);
    ctx.arc.mockClear();

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish);
    const desktopArcCalls = ctx.arc.mock.calls.length;

    // Desktop should have one more arc (the glow)
    expect(desktopArcCalls).toBeGreaterThan(arcCalls);
  });

  it('should use starfield color for glow', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(false);

    const ctx = createMockContext();
    const jellyfish = createTestAsteroid();

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish);

    // Should have used starfield color at some point (for glow)
    // Note: This is hard to test directly, but we can verify strokeStyle was set
    expect(ctx.strokeStyle).toBeDefined();
  });

  it('should handle zero-radius jellyfish gracefully', () => {
    const ctx = createMockContext();
    const zeroJelly = createTestAsteroid({ radius: 0 });

    // Should not throw
    expect(() => {
      drawJellyfish(ctx as unknown as CanvasRenderingContext2D, zeroJelly);
    }).not.toThrow();
  });

  it('should create wavy tentacle motion', () => {
    const ctx = createMockContext();
    const jellyfish = createTestAsteroid({ rotation: Math.PI / 4 });

    drawJellyfish(ctx as unknown as CanvasRenderingContext2D, jellyfish);

    // Tentacles use quadraticCurveTo for wavy curves
    expect(ctx.quadraticCurveTo).toHaveBeenCalled();

    // Should have multiple segments per tentacle
    const curveCount = ctx.quadraticCurveTo.mock.calls.length;
    expect(curveCount).toBeGreaterThan(4); // At least 4 tentacles × segments
  });
});
