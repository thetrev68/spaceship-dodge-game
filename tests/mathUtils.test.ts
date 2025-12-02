import { afterEach, describe, expect, it, vi } from 'vitest';
import { clamp, lerp, mapRange, randomFloat, randomInt } from '@utils/mathUtils.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('mathUtils', () => {
  it('clamps values within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it('maps a value between ranges', () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(() => mapRange(1, 0, 0, 0, 1)).toThrow(RangeError);
  });

  it('interpolates between numbers', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(-10, 10, 0.25)).toBe(-5);
  });

  it('generates random values with mocked Math.random', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(randomInt(1, 3)).toBe(2);
    expect(randomFloat(0, 10)).toBeCloseTo(5);
  });
});
