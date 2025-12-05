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
    const message = `Expected ${name} to be a number, got ${typeof value}`;
    log.error(message);
    throw new Error(message);
  }
}

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
