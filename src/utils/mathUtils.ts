/**
 * @module utils/mathUtils
 * Math utility functions for random number generation and value clamping.
 */

/**
 * Generate a random integer within a specified range (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float within a specified range
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Clamp a value between a minimum and maximum
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMin === inMax) {
    throw new RangeError(
      `Invalid input range: inMin (${inMin}) cannot equal inMax (${inMax}) when mapping value ${value}`
    );
  }
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
