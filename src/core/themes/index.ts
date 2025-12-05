/**
 * Theme System - Public API exports.
 *
 * This module re-exports the public API of the theme system.
 * Import from this module rather than individual files.
 *
 * @module themes
 *
 * @example
 * ```typescript
 * import { getCurrentTheme, setTheme, initializeThemeSystem } from '@core/themes';
 * ```
 */

export {
  getCurrentTheme,
  setTheme,
  getAvailableThemes,
  initializeThemeSystem,
  watchTheme,
  applyUITheme,
} from './themeManager';
