// utils/platform.js
// Platform detection utilities

/**
 * Detects if the current device is mobile based on touch capabilities
 * @type {boolean}
 */
export const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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

// For testing purposes - allows overriding mobile detection
let mobileOverride = null;

/**
 * Override mobile detection for testing
 * @param {boolean|null} value - true for mobile, false for desktop, null to use real detection
 * @private
 */
export const __setMobileOverride = (value) => {
  mobileOverride = value;
};

/**
 * Get current mobile state (respects test overrides)
 * @returns {boolean}
 * @private
 */
export const __getMobileState = () => {
  return mobileOverride !== null ? mobileOverride : isMobile;
};
