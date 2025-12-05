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
} from './themeManager';

export {
  DEFAULT_THEME,
  MONOCHROME_THEME,
  THEME_REGISTRY,
  VALID_THEME_IDS,
  THEME_STORAGE_KEY,
} from './themeConstants';
