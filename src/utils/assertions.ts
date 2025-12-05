import { log } from '@core/logger';
import { DEV_CONFIG } from '@core/constants';

/**
 * Development assertions
 * Only active in debug mode for performance
 */

/**
 * Asserts a condition, throwing if it fails in debug mode.
 *
 * @param condition - Condition that must be truthy
 * @param message - Error message when the assertion fails
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (!condition) {
    log.error(`Assertion failed: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Asserts that a value is a number (dev-only).
 *
 * @param value - Value to validate
 * @param name - Human-friendly variable name for error output
 */
export function assertNumber(value: unknown, name: string): asserts value is number {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    const message = `Expected ${name} to be a number, got ${typeof value}`;
    log.error(message);
    throw new Error(message);
  }
}

/**
 * Asserts that a numeric value is greater than zero (dev-only).
 *
 * @param value - Value to validate
 * @param name - Human-friendly variable name for error output
 */
export function assertPositive(value: number, name: string): void {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    const message = `Expected ${name} to be a number, got ${typeof value}`;
    log.error(message);
    throw new Error(message);
  }

  if (value <= 0) {
    const message = `Expected ${name} to be positive, got ${value}`;
    log.error(message);
    throw new Error(message);
  }
}

/**
 * Asserts that a numeric value is within an inclusive range (dev-only).
 *
 * @param value - Value to validate
 * @param min - Minimum acceptable value (inclusive)
 * @param max - Maximum acceptable value (inclusive)
 * @param name - Human-friendly variable name for error output
 */
export function assertInRange(value: number, min: number, max: number, name: string): void {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    const message = `Expected ${name} to be a number, got ${typeof value}`;
    log.error(message);
    throw new Error(message);
  }

  if (typeof min !== 'number' || Number.isNaN(min)) {
    const message = `Expected min to be a number, got ${typeof min}`;
    log.error(message);
    throw new Error(message);
  }

  if (typeof max !== 'number' || Number.isNaN(max)) {
    const message = `Expected max to be a number, got ${typeof max}`;
    log.error(message);
    throw new Error(message);
  }

  if (value < min || value > max) {
    const message = `Expected ${name} to be in range [${min}, ${max}], got ${value}`;
    log.error(message);
    throw new Error(message);
  }
}
