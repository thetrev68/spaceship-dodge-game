// utils/platform.js
// Platform detection utilities

/**
 * Private function to detect if the device supports touch events
 * @returns {boolean}
 */
const _detectMobile = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/**
 * For testing purposes - allows overriding mobile detection
 * @type {boolean|null}
 * @private
 */
let mobileOverride = null;

/**
 * Get current mobile state (respects test overrides)
 * @returns {boolean}
 * @private
 */
export const __getMobileState = () => {
  return mobileOverride !== null ? mobileOverride : _detectMobile();
};

/**
 * Detects if the current device is mobile based on touch capabilities
 * @returns {boolean}
 */
export const isMobile = () => __getMobileState();

/**
 * Detects if the device supports touch events
 * @returns {boolean}
 */
export const isTouch = () => 'ontouchstart' in window;

/**
 * Detects if the device supports vibration API
 * @returns {boolean}
 */
export const supportsVibration = () => 'vibrate' in navigator;

/**
 * Override mobile detection for testing
 * @param {boolean|null} value - true for mobile, false for desktop, null to use real detection
 * @private
 */
export const __setMobileOverride = (value) => {
  mobileOverride = value;
};
