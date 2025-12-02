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
export const __getMobileState = (): boolean => {
  return mobileOverride !== null ? mobileOverride : _detectMobile();
};

/**
 * Detects if the current device is mobile based on touch capabilities.
 */
export const isMobile = (): boolean => __getMobileState();

/**
 * Detects if the device supports touch events.
 */
export const isTouch = (): boolean => 'ontouchstart' in window;

/**
 * Detects if the device supports vibration API.
 */
export const supportsVibration = (): boolean => 'vibrate' in navigator;

/**
 * Override mobile detection for testing.
 */
export const __setMobileOverride = (value: boolean | null): void => {
  mobileOverride = value;
};
