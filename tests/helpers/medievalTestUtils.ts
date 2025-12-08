import { vi } from 'vitest';
import type { ActivePowerup, Asteroid, Bullet } from '@types';

/**
 * Creates a reusable mock CanvasRenderingContext2D with tracking helpers.
 */
export function createMockMedievalContext(): CanvasRenderingContext2D & {
  __fillHistory: unknown[];
  __strokeHistory: unknown[];
  __gradientStops: Array<[number, string]>;
} {
  const gradientStops: Array<[number, string]> = [];
  const radialGradient = {
    addColorStop: vi.fn((offset: number, color: string) => gradientStops.push([offset, color])),
  };
  const linearGradient = { addColorStop: vi.fn() };

  const ctx: Partial<CanvasRenderingContext2D> & {
    __fillHistory: unknown[];
    __strokeHistory: unknown[];
    __gradientStops: Array<[number, string]>;
    __globalAlpha: number;
    __shadowBlur: number;
  } = {
    __fillHistory: [],
    __strokeHistory: [],
    __gradientStops: gradientStops,
    __globalAlpha: 1,
    __shadowBlur: 0,
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    createRadialGradient: vi.fn(() => radialGradient),
    createLinearGradient: vi.fn(() => linearGradient),
    fillText: vi.fn(),
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    lineWidth: 0,
    lineCap: 'butt',
    lineJoin: 'miter',
  };

  Object.defineProperty(ctx, 'fillStyle', {
    get() {
      return ctx.__fillHistory.at(-1);
    },
    set(value) {
      ctx.__fillHistory.push(value);
    },
  });

  Object.defineProperty(ctx, 'strokeStyle', {
    get() {
      return ctx.__strokeHistory.at(-1);
    },
    set(value) {
      ctx.__strokeHistory.push(value);
    },
  });

  Object.defineProperty(ctx, 'globalAlpha', {
    get() {
      return ctx.__globalAlpha;
    },
    set(value) {
      ctx.__globalAlpha = value;
    },
  });

  Object.defineProperty(ctx, 'shadowBlur', {
    get() {
      return ctx.__shadowBlur;
    },
    set(value) {
      ctx.__shadowBlur = value;
    },
  });

  return ctx as CanvasRenderingContext2D & {
    __fillHistory: unknown[];
    __strokeHistory: unknown[];
    __gradientStops: Array<[number, string]>;
  };
}

/** Factory for consistent test asteroid data */
export function createTestAsteroid(overrides: Partial<Asteroid> = {}): Asteroid {
  return {
    x: 50,
    y: 60,
    radius: 20,
    dx: 1,
    dy: 1,
    id: 1,
    level: 1,
    parentId: null,
    scoreValue: 100,
    creationTime: 1000000000, // Fixed timestamp for test determinism
    rotation: 0,
    rotationSpeed: 0.01,
    speed: 2,
    shape: [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ],
    ...overrides,
  };
}

/** Factory for medieval bullet rendering tests */
export function createTestBullet(overrides: Partial<Bullet> = {}): Bullet {
  return {
    x: 50,
    y: 75,
    radius: 6,
    dy: -8,
    parentId: null,
    ...overrides,
  };
}

/** Factory for medieval powerup rendering tests */
export function createTestPowerup(overrides: Partial<ActivePowerup> = {}): ActivePowerup {
  return {
    x: 100,
    y: 120,
    size: 40,
    type: 'shield',
    dy: 0,
    ...overrides,
  };
}
