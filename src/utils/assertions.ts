import { log } from '@core/logger';
import { DEV_CONFIG } from '@core/constants';

/**
 * Development assertions
 * Only active in debug mode for performance
 */

export function assert(condition: boolean, message: string): asserts condition {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (!condition) {
    log.error(`Assertion failed: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertNumber(value: unknown, name: string): asserts value is number {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Expected ${name} to be a number, got ${typeof value}`);
  }
}

export function assertPositive(value: number, name: string): void {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (value < 0) {
    throw new Error(`Expected ${name} to be positive, got ${value}`);
  }
}

export function assertInRange(value: number, min: number, max: number, name: string): void {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (value < min || value > max) {
    throw new Error(`Expected ${name} to be in range [${min}, ${max}], got ${value}`);
  }
}
