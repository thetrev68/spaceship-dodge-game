/**
 * @fileoverview Platform detection utilities.
 */

/**
 * Detects if the device supports touch events.
 * @returns {boolean}
 */
const _detectMobile = (): boolean => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/**
 * For testing purposes - allows overriding mobile detection.
 */
let mobileOverride: boolean | null = null;

/**
 * Get current mobile state (respects test overrides).
 */
const __getMobileState = (): boolean => {
  return mobileOverride !== null ? mobileOverride : _detectMobile();
};

/**
 * Detects if the current device is mobile based on touch capabilities.
 */
export const isMobile = (): boolean => __getMobileState();

/**
 * Override mobile detection for testing purposes only.
 * @internal - Do not use in production code
 */
export const setMobileOverride = (value: boolean | null): void => {
  mobileOverride = value;
};

/**
 * Platform test utilities - for test code only.
 * @internal - Do not use in production code
 */
export const __platformTestUtils = {
  reset: () => { mobileOverride = null; },
  getState: () => __getMobileState(),
};
