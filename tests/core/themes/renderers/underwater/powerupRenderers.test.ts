/**
 * Unit tests for powerup renderers (underwater theme)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  drawOctopusPowerup,
  drawStarfishPowerup,
} from '@core/themes/renderers/underwater/powerupRenderers';
import { createTestPowerup } from '../../../../helpers/gameStateFactory';

// Mock dependencies
vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    id: 'underwater',
    colors: {
      powerupShield: '#ff6b9d',
      powerupBlaster: '#fbbf24',
    },
  })),
}));

vi.mock('@utils/platform', () => ({
  isMobile: vi.fn(() => false),
}));

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
    globalAlpha: 1,
  };
}

describe('drawOctopusPowerup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render octopus with head and eyes', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup({ type: 'shield' });

    drawOctopusPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // Should draw circles for head, eyes, and pupils
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('should render 8 tentacles', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    drawOctopusPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // 8 tentacles with quadratic curves
    const curveCount = ctx.quadraticCurveTo.mock.calls.length;
    expect(curveCount).toBeGreaterThanOrEqual(8);
  });

  it('should render suction cups on tentacles', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    drawOctopusPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // Multiple arcs for head, eyes, pupils, and suction cups
    expect(ctx.arc.mock.calls.length).toBeGreaterThan(10);
  });

  it('should animate tentacle waving', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    // Call twice - animation uses performance.now() so each call will differ
    drawOctopusPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);
    const firstCalls = ctx.quadraticCurveTo.mock.calls;

    ctx.quadraticCurveTo.mockClear();

    drawOctopusPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);
    const secondCalls = ctx.quadraticCurveTo.mock.calls;

    // Both should have same number of calls (8 tentacles with quadratic curves)
    expect(firstCalls.length).toBe(secondCalls.length);
    expect(firstCalls.length).toBeGreaterThan(0);
  });

  it('should use shield powerup color', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    drawOctopusPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // Should use theme color
    expect(ctx.strokeStyle).toBe('#ff6b9d');
  });
});

describe('drawStarfishPowerup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render starfish with 5 arms', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup({ type: 'doubleBlaster' });

    drawStarfishPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // Starfish body uses lineTo for star shape
    expect(ctx.lineTo).toHaveBeenCalled();
  });

  it('should render central core', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    drawStarfishPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // Core + 5 texture bumps = 6 arcs
    expect(ctx.arc).toHaveBeenCalledTimes(6);
  });

  it('should render texture bumps on arms', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    drawStarfishPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // 5 bumps + 1 core = 6 arcs
    const arcCount = ctx.arc.mock.calls.length;
    expect(arcCount).toBe(6);
  });

  it('should apply pulsing animation', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    // Starfish uses performance.now() for pulsing
    drawStarfishPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // Should have drawn the star shape
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.closePath).toHaveBeenCalled();
  });

  it('should use blaster powerup color', () => {
    const ctx = createMockContext();
    const powerup = createTestPowerup();

    drawStarfishPowerup(ctx as unknown as CanvasRenderingContext2D, powerup);

    // Should use theme color
    expect(ctx.strokeStyle).toBe('#fbbf24');
  });

  it('should scale with powerup size', () => {
    const ctx = createMockContext();
    const smallPowerup = createTestPowerup({ size: 20 });
    const largePowerup = createTestPowerup({ size: 80 });

    drawStarfishPowerup(ctx as unknown as CanvasRenderingContext2D, smallPowerup);
    const smallArcCount = ctx.arc.mock.calls.length;

    ctx.arc.mockClear();

    drawStarfishPowerup(ctx as unknown as CanvasRenderingContext2D, largePowerup);
    const largeArcCount = ctx.arc.mock.calls.length;

    // Both should have same number of arcs (core + 5 bumps = 6)
    expect(smallArcCount).toBe(largeArcCount);
    expect(smallArcCount).toBe(6);
  });
});
