/**
 * Theme Manager - Centralized theme state management and persistence.
 *
 * This module manages the current active theme, handles theme switching,
 * and persists theme preferences to localStorage. It provides a reactive
 * theme value that automatically notifies consumers of theme changes.
 *
 * **Architecture**:
 * - Uses the minimal reactive system from `@core/state`
 * - Validates all theme IDs against a whitelist (security)
 * - Persists theme preference to localStorage
 * - Provides simple accessor API for rendering code
 *
 * **Performance**:
 * - Theme changes are rare (user-initiated only)
 * - Reactive updates are efficient (no polling)
 * - getCurrentTheme() is a simple property access
 *
 * **Security**:
 * - Theme IDs validated against VALID_THEME_IDS whitelist
 * - No dynamic theme loading or arbitrary code execution
 * - localStorage reads are sanitized
 *
 * @module themeManager
 *
 * @example
 * ```typescript
 * import { getCurrentTheme, setTheme, getAvailableThemes } from '@core/themes';
 *
 * // Get current theme for rendering
 * const theme = getCurrentTheme();
 * ctx.fillStyle = theme.colors.player;
 *
 * // Switch theme (triggers reactive update)
 * setTheme('monochrome');
 *
 * // List all available themes
 * const themes = getAvailableThemes();
 * ```
 */

import { createReactive } from '@core/reactive';
import { log } from '@core/logger';
import { announcer } from '@ui/accessibility/announcer';
import type { Theme, ThemeId } from '@types';
import {
  DEFAULT_THEME,
  THEME_REGISTRY,
  VALID_THEME_IDS,
  THEME_STORAGE_KEY,
} from './themeConstants';

/**
 * Current active theme (reactive).
 *
 * This reactive value automatically notifies watchers when the theme changes.
 * Rendering code should access this via getCurrentTheme() for simplicity.
 *
 * @internal
 */
const currentTheme = createReactive<Theme>(DEFAULT_THEME);

/**
 * Validates a theme ID against the whitelist.
 *
 * This is a security measure to prevent injection attacks via localStorage
 * or other user input vectors. Only built-in theme IDs are allowed.
 *
 * @param id - Theme ID to validate
 * @returns True if the ID is valid, false otherwise
 *
 * @example
 * ```typescript
 * validateThemeId('default'); // true
 * validateThemeId('malicious'); // false
 * validateThemeId(null); // false
 * ```
 */
function validateThemeId(id: unknown): id is ThemeId {
  return typeof id === 'string' && VALID_THEME_IDS.includes(id as ThemeId);
}

/**
 * Loads theme preference from localStorage.
 *
 * Reads the stored theme ID, validates it, and returns the corresponding
 * theme object. Falls back to DEFAULT_THEME if the stored ID is invalid
 * or missing.
 *
 * **Security**: All reads are validated against the whitelist.
 *
 * @returns Theme object loaded from storage, or default theme
 *
 * @internal
 */
function loadThemeFromStorage(): Theme {
  try {
    const storedId = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedId && validateThemeId(storedId)) {
      log.debug(`Theme loaded from storage: ${storedId}`);
      return THEME_REGISTRY[storedId];
    }

    log.debug('No valid theme in storage, using default');
    return DEFAULT_THEME;
  } catch (error) {
    log.warn('Failed to load theme from storage, using default', error);
    return DEFAULT_THEME;
  }
}

/**
 * Saves theme preference to localStorage.
 *
 * Persists only the theme ID (not the full theme object) to minimize
 * storage footprint and avoid stale data issues.
 *
 * @param themeId - Theme ID to save
 *
 * @internal
 */
function saveThemeToStorage(themeId: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    log.debug(`Theme saved to storage: ${themeId}`);
  } catch (error) {
    log.warn('Failed to save theme to storage', error);
  }
}

/**
 * Gets the current active theme.
 *
 * This is the primary API for rendering code to access theme colors
 * and fonts. Returns the reactive theme value.
 *
 * **Performance**: This is a simple property access (negligible overhead).
 *
 * @returns Current active theme
 *
 * @example
 * ```typescript
 * const theme = getCurrentTheme();
 * ctx.fillStyle = theme.colors.player;
 * ctx.strokeStyle = theme.colors.asteroid;
 * ```
 */
export function getCurrentTheme(): Theme {
  return currentTheme.value;
}

/**
 * Sets the current active theme.
 *
 * Validates the theme ID, updates the reactive theme value, and persists
 * the preference to localStorage. Throws an error if the theme ID is invalid.
 *
 * **Side effects**:
 * - Updates currentTheme reactive value (triggers watchers)
 * - Saves to localStorage
 * - Logs theme change
 *
 * @param themeId - Theme ID to activate
 * @throws {Error} If theme ID is invalid
 *
 * @example
 * ```typescript
 * setTheme('monochrome'); // Switch to monochrome theme
 * setTheme('default');    // Switch back to default
 * ```
 */
export function setTheme(themeId: string): void {
  if (!validateThemeId(themeId)) {
    log.error(`Invalid theme ID: ${themeId}`);
    throw new Error(`Invalid theme ID: ${themeId}. Valid IDs: ${VALID_THEME_IDS.join(', ')}`);
  }

  const theme = THEME_REGISTRY[themeId];
  currentTheme.value = theme;
  saveThemeToStorage(themeId);

  log.info(`Theme changed to: ${theme.name}`);
  announcer.announce(`Theme changed to ${theme.name}`);
}

/**
 * Gets all available themes.
 *
 * Returns an array of all theme objects in the registry. Useful for
 * building theme selection UIs.
 *
 * @returns Array of all available themes
 *
 * @example
 * ```typescript
 * const themes = getAvailableThemes();
 * themes.forEach(theme => {
 *   console.log(`${theme.name}: ${theme.description}`);
 * });
 * ```
 */
export function getAvailableThemes(): Theme[] {
  return Object.values(THEME_REGISTRY);
}

/**
 * Initializes the theme system.
 *
 * Loads the theme preference from localStorage and applies it.
 * Should be called once during application startup, before the first render.
 *
 * **Timing**: Call after canvas setup but before game loop starts.
 *
 * @example
 * ```typescript
 * // In main.ts
 * initializeThemeSystem();
 * startGameLoop();
 * ```
 */
export function initializeThemeSystem(): void {
  log.info('Initializing theme system');

  const theme = loadThemeFromStorage();
  currentTheme.value = theme;

  log.info(`Theme system initialized with theme: ${theme.name}`);
}

/**
 * Watches for theme changes.
 *
 * Registers a callback that will be invoked whenever the theme changes.
 * Useful for components that need to react to theme switches.
 *
 * @param callback - Function to call when theme changes
 * @returns Cleanup function to stop watching
 *
 * @example
 * ```typescript
 * const unwatch = watchTheme(() => {
 *   console.log('Theme changed to:', getCurrentTheme().name);
 * });
 *
 * // Later, stop watching
 * unwatch();
 * ```
 */
export function watchTheme(callback: () => void): () => void {
  return currentTheme.watch(callback);
}
