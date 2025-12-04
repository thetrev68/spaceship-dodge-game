/**
 * @module utils/validation
 * Input validation utilities for boundary checks and range clamping.
 *
 * Provides defensive programming utilities to validate user input, API parameters,
 * and game state boundaries. Prevents common errors like out-of-bounds coordinates,
 * invalid volume levels, and malformed game state.
 *
 * ## Validation Strategy
 * - **Validate at boundaries**: User input, external APIs, network data
 * - **Trust internal code**: No validation within trusted systems
 * - **Fail fast**: Throw errors early for invalid input
 * - **Clamp when possible**: Prefer correction over rejection
 *
 * @example
 * ```typescript
 * // Validate user click position
 * canvas.addEventListener('click', (e) => {
 *   const x = clamp(e.clientX, 0, canvas.width);
 *   const y = clamp(e.clientY, 0, canvas.height);
 *   setPlayerPosition(x, y);
 * });
 * ```
 */

/**
 * Validates that coordinates are within canvas bounds.
 *
 * ## Use Cases
 * - Validate mouse/touch input before moving player
 * - Check entity spawn positions
 * - Verify collision detection coordinates
 *
 * ## Boundary Definition
 * Valid coordinates: `0 <= x <= width` and `0 <= y <= height`
 * Allows entities at exact canvas edges (inclusive bounds).
 *
 * @param x - X coordinate to validate
 * @param y - Y coordinate to validate
 * @param width - Canvas width (right boundary)
 * @param height - Canvas height (bottom boundary)
 * @returns `true` if coordinates within bounds, `false` otherwise
 *
 * @example
 * ```typescript
 * // Validate player position before setting
 * export function setPlayerPosition(x: number, y: number): void {
 *   if (!_validateBounds(x, y, canvas.width, canvas.height)) {
 *     log.warn('Player position out of bounds', { x, y });
 *     // Clamp to valid range
 *     x = _clamp(x, 0, canvas.width);
 *     y = _clamp(y, 0, canvas.height);
 *   }
 *   player.x = x;
 *   player.y = y;
 * }
 * ```
 */
function _validateBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

/**
 * Clamps a numeric value to a specified range [min, max].
 *
 * ## Behavior
 * - If `value < min`: Returns `min`
 * - If `value > max`: Returns `max`
 * - Otherwise: Returns `value` unchanged
 *
 * ## Use Cases
 * - Volume controls (clamp to 0-1 range)
 * - Position clamping (keep entities on screen)
 * - Level clamping (prevent negative or excessive levels)
 * - Timer clamping (prevent negative durations)
 *
 * @param value - Value to clamp
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @returns Clamped value within [min, max] range
 *
 * @example
 * ```typescript
 * // Clamp volume slider input
 * const volume = _clamp(sliderValue, 0, 1);
 * setVolume(volume);
 *
 * // Keep player on screen
 * player.x = clamp(player.x, 0, canvas.width - player.width);
 * player.y = clamp(player.y, 0, canvas.height - player.height);
 *
 * // Prevent negative scores (edge case)
 * score.value = clamp(score.value, 0, Number.MAX_SAFE_INTEGER);
 * ```
 */
function _clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validates and clamps audio volume to [0, 1] range.
 * Throws error if volume is NaN (catches programming errors early).
 *
 * ## Volume Range
 * - `0.0`: Silent (muted)
 * - `0.5`: Half volume
 * - `1.0`: Full volume
 *
 * ## Error Handling
 * - **NaN**: Throws `RangeError` (programming error)
 * - **Out of range**: Clamps to [0, 1] (user input correction)
 *
 * @param volume - Volume value to validate (any number)
 * @returns Clamped volume between 0 and 1 (inclusive)
 * @throws {RangeError} If volume is NaN
 *
 * @example
 * ```typescript
 * // In audio volume setter
 * export function setVolume(vol: number): void {
 *   try {
 *     currentVolume = validateAudioVolume(vol);
 *
 *     // Apply to all audio elements
 *     sounds.forEach(audio => {
 *       audio.volume = currentVolume;
 *     });
 *
 *     log.debug(`Volume set to ${(currentVolume * 100).toFixed(0)}%`);
 *   } catch (err) {
 *     log.error('Invalid volume value:', err);
 *     // Use default volume
 *     setVolume(0.5);
 *   }
 * }
 *
 * // Volume slider input
 * volumeSlider.addEventListener('input', (e) => {
 *   const value = parseFloat(e.target.value);
 *   const clamped = validateAudioVolume(value);
 *   setVolume(clamped);
 * });
 * ```
 */
export function validateAudioVolume(volume: number): number {
  if (isNaN(volume)) {
    throw new RangeError('Audio volume must be a valid number, got NaN');
  }
  return _clamp(volume, 0, 1);
}

/**
 * Validates that a value is a positive integer (>= 1).
 * Used for counts, IDs, levels, and other discrete positive values.
 *
 * ## Valid Values
 * - `1, 2, 3, ...` (positive integers)
 *
 * ## Invalid Values
 * - `0` (not positive)
 * - `-5` (negative)
 * - `2.5` (not integer)
 * - `NaN` (not a number)
 * - `Infinity` (not finite)
 *
 * @param value - Value to validate
 * @param name - Parameter name for error messages (e.g., "level", "entityId")
 * @returns The validated positive integer
 * @throws {TypeError} If value is not a positive integer
 */
function _validatePositiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new TypeError(`${name} must be a positive integer (>= 1), got: ${value}`);
  }
  return value;
}

/**
 * Validates that a value is a non-negative number (>= 0).
 * Used for scores, timers, dimensions, and other non-negative values.
 *
 * ## Valid Values
 * - `0, 1, 2.5, 100.75, ...` (zero or positive numbers)
 *
 * ## Invalid Values
 * - `-5` (negative)
 * - `NaN` (not a number)
 * - `Infinity` (not finite)
 *
 * @param value - Value to validate
 * @param name - Parameter name for error messages
 * @returns The validated non-negative number
 * @throws {TypeError} If value is negative, NaN, or infinite
 */
function _validateNonNegative(value: number, name: string): number {
  if (isNaN(value) || !isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number, got: ${value}`);
  }
  return value;
}

/**
 * Validates that a string is non-empty after trimming.
 * Used for names, IDs, asset paths, and other string inputs.
 *
 * ## Valid Strings
 * - `"hello"` (non-empty)
 * - `"  world  "` (whitespace trimmed, still has content)
 *
 * ## Invalid Strings
 * - `""` (empty)
 * - `"   "` (only whitespace)
 *
 * @param value - String to validate
 * @param name - Parameter name for error messages
 * @returns Trimmed non-empty string
 * @throws {TypeError} If string is empty or only whitespace
 */
function _validateNonEmptyString(value: string, name: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new TypeError(`${name} must be a non-empty string, got: "${value}"`);
  }
  return trimmed;
}
