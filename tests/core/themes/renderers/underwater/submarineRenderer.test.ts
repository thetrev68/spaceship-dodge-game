/**
 * Unit tests for submarine renderer (underwater theme player)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { drawSubmarine } from '@core/themes/renderers/underwater/submarineRenderer';
import type { Player } from '@types';

// Mock dependencies
vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    id: 'underwater',
    colors: {
      player: '#00d9ff',
      playerShield: '#00ffaa',
    },
  })),
}));

vi.mock('@utils/platform', () => ({
  isMobile: vi.fn(() => false),
}));

vi.mock('@core/state/playerState', () => ({
  playerState: {
    powerUps: {
      shield: { active: false, timer: 0 },
      doubleBlaster: { active: false, timer: 0 },
    },
  },
}));

/**
 * Creates a mock canvas 2D context with tracking for draw calls
 */
function createMockContext() {
  const calls: string[] = [];

  const ctx = {
    save: vi.fn(() => calls.push('save')),
    restore: vi.fn(() => calls.push('restore')),
    beginPath: vi.fn(() => calls.push('beginPath')),
    stroke: vi.fn(() => calls.push('stroke')),
    fill: vi.fn(() => calls.push('fill')),
    arc: vi.fn(() => calls.push('arc')),
    ellipse: vi.fn(() => calls.push('ellipse')),
    strokeRect: vi.fn(() => calls.push('strokeRect')),
    moveTo: vi.fn(() => calls.push('moveTo')),
    lineTo: vi.fn(() => calls.push('lineTo')),
    translate: vi.fn(() => calls.push('translate')),
    rotate: vi.fn(() => calls.push('rotate')),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
  };

  return { ctx, calls };
}

/**
 * Creates a test player entity
 */
function createTestPlayer(overrides?: Partial<Player>): Player {
  return {
    x: 100,
    y: 200,
    width: 40,
    height: 60,
    speed: 5,
    dx: 0,
    dy: 0,
    overridePosition: null,
    ...overrides,
  };
}

describe('drawSubmarine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render submarine with all components', () => {
    const { ctx } = createMockContext();
    const player = createTestPlayer();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, player);

    // Should have called ellipse for hull
    expect(ctx.ellipse).toHaveBeenCalled();

    // Should have drawn conning tower
    expect(ctx.strokeRect).toHaveBeenCalled();

    // Should have drawn periscope (moveTo + lineTo)
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();

    // Should have drawn portholes (3 arcs)
    const arcCalls = ctx.arc.mock.calls.length;
    expect(arcCalls).toBeGreaterThanOrEqual(3); // At least 3 portholes
  });

  it('should use theme colors', () => {
    const { ctx } = createMockContext();
    const player = createTestPlayer();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, player);

    expect(ctx.strokeStyle).toBe('#00d9ff'); // theme.colors.player
  });

  it('should render animated propeller', () => {
    const { ctx } = createMockContext();
    const player = createTestPlayer();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, player);

    // Propeller uses save/translate/rotate/restore
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should render bubble trail on desktop', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(false);

    const { ctx } = createMockContext();
    const player = createTestPlayer();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, player);

    // Bubble trail draws 5 circles (arcs)
    // Total arcs = 3 portholes + 5 bubbles = 8
    const arcCalls = ctx.arc.mock.calls.length;
    expect(arcCalls).toBeGreaterThanOrEqual(8);
  });

  it('should skip bubble trail on mobile', async () => {
    const { isMobile } = await import('@utils/platform');
    vi.mocked(isMobile).mockReturnValue(true);

    const { ctx } = createMockContext();
    const player = createTestPlayer();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, player);

    // Only 3 portholes, no bubbles
    const arcCalls = ctx.arc.mock.calls.length;
    expect(arcCalls).toBe(3);
  });

  it('should render shield when active', async () => {
    const { playerState } = await import('@core/state/playerState');
    playerState.powerUps.shield.active = true;

    const { ctx } = createMockContext();
    const player = createTestPlayer();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, player);

    // Shield adds one more arc
    const arcCalls = ctx.arc.mock.calls.length;
    expect(arcCalls).toBeGreaterThanOrEqual(4); // 3 portholes + 1 shield

    // Should use shield color
    expect(ctx.strokeStyle).toBe('#00ffaa'); // Last strokeStyle set
  });

  it('should not render shield when inactive', async () => {
    const { playerState } = await import('@core/state/playerState');
    playerState.powerUps.shield.active = false;

    const { ctx } = createMockContext();
    const player = createTestPlayer();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, player);

    // Only 3 portholes, no shield
    const arcCalls = ctx.arc.mock.calls.length;
    expect(arcCalls).toBe(3);
  });

  it('should scale with player dimensions', () => {
    const { ctx } = createMockContext();
    const smallPlayer = createTestPlayer({ width: 20, height: 30 });
    const largePlayer = createTestPlayer({ width: 80, height: 120 });

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, smallPlayer);
    const smallCallCount = ctx.ellipse.mock.calls.length;

    ctx.ellipse.mockClear();

    drawSubmarine(ctx as unknown as CanvasRenderingContext2D, largePlayer);
    const largeCallCount = ctx.ellipse.mock.calls.length;

    // Both should have same number of ellipse calls
    expect(smallCallCount).toBe(largeCallCount);
    expect(smallCallCount).toBeGreaterThan(0); // Should have drawn something
  });

  it('should handle zero-size player gracefully', () => {
    const { ctx } = createMockContext();
    const zeroPlayer = createTestPlayer({ width: 0, height: 0 });

    // Should not throw
    expect(() => {
      drawSubmarine(ctx as unknown as CanvasRenderingContext2D, zeroPlayer);
    }).not.toThrow();
  });
});
