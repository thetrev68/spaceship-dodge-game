/**
 * @module utils/formatNumber
 * Number formatting utilities for display purposes.
 */

/**
 * Formats a number with comma separators for thousands.
 *
 * @param num - The number to format
 * @returns Formatted string with comma separators (e.g., "10,000")
 *
 * @example
 * ```typescript
 * formatNumber(1000);      // "1,000"
 * formatNumber(10000);     // "10,000"
 * formatNumber(1234567);   // "1,234,567"
 * formatNumber(42);        // "42"
 * ```
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}
