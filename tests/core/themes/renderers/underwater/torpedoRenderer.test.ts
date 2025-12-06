/**
 * Unit tests for torpedo renderer (underwater theme bullets)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drawTorpedo } from '@core/themes/renderers/underwater/torpedoRenderer';
import type { Bullet } from '@types';

// Mock dependencies
vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    id: 'underwater',
    colors: {
      bullet: '#ffaa00',
    },
  })),
}));

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
  };
}

function createTestBullet(overrides?: Partial<Bullet>): Bullet {
  return {
    x: 100,
    y: 200,
    radius: 5,
    dy: -10,
    parentId: null,
    ...overrides,
  };
}

describe('drawTorpedo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render torpedo with body and nose', () => {
    const ctx = createMockContext();
    const torpedo = createTestBullet();

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, torpedo);

    // Should have 2 ellipses (body + nose)
    expect(ctx.ellipse).toHaveBeenCalledTimes(2);
  });

  it('should render tail fins', () => {
    const ctx = createMockContext();
    const torpedo = createTestBullet();

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, torpedo);

    // Fins use moveTo + lineTo
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
  });

  it('should render animated propeller', () => {
    const ctx = createMockContext();
    const torpedo = createTestBullet();

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, torpedo);

    // Propeller uses save/translate/rotate/restore
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should render bubble trail', () => {
    const ctx = createMockContext();
    const torpedo = createTestBullet();

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, torpedo);

    // Bubble trail has 3 circles
    expect(ctx.arc).toHaveBeenCalledTimes(3);
  });

  it('should apply fading opacity to bubbles', () => {
    const ctx = createMockContext();
    const torpedo = createTestBullet();

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, torpedo);

    // Global alpha should be restored to 1 after bubbles
    expect(ctx.globalAlpha).toBe(1);
  });

  it('should scale with bullet radius', () => {
    const ctx = createMockContext();
    const smallTorpedo = createTestBullet({ radius: 3 });
    const largeTorpedo = createTestBullet({ radius: 10 });

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, smallTorpedo);
    const smallEllipseCall = ctx.ellipse.mock.calls[0];

    ctx.ellipse.mockClear();

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, largeTorpedo);
    const largeEllipseCall = ctx.ellipse.mock.calls[0];

    // Larger torpedo should have larger body dimensions
    const smallWidth = smallEllipseCall?.[2];
    const largeWidth = largeEllipseCall?.[2];
    if (smallWidth !== undefined && largeWidth !== undefined) {
      expect(largeWidth).toBeGreaterThan(smallWidth);
    }
  });

  it('should use theme bullet color', () => {
    const ctx = createMockContext();
    const torpedo = createTestBullet();

    drawTorpedo(ctx as unknown as CanvasRenderingContext2D, torpedo);

    expect(ctx.fillStyle).toContain('#'); // Should have color set
  });
});
