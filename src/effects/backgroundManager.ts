/**
 * @module effects/backgroundManager
 * Theme-aware background management system.
 *
 * ## Architecture
 * This module provides a centralized system for initializing and switching
 * background effects based on the active theme. It follows the strategy pattern
 * where themes can provide custom background renderers, falling back to the
 * default starfield if not specified.
 *
 * ## Background Lifecycle
 * 1. **Initialization**: `initializeBackground()` called on app start
 * 2. **Theme Watch**: Automatically reinitializes when theme changes
 * 3. **Cleanup**: Previous background animation loops are abandoned (GC handles cleanup)
 *
 * ## Performance Considerations
 * - Background animations run in separate `requestAnimationFrame` loops
 * - Mobile devices get reduced particle counts for performance
 * - Canvas resizing is handled by individual background implementations
 *
 * @example
 * ```typescript
 * // Initialize on app start
 * const canvas = document.getElementById('starfieldCanvas') as HTMLCanvasElement;
 * initializeBackground(canvas);
 *
 * // Background automatically updates when theme changes
 * setTheme('underwater'); // Ocean background replaces starfield
 * setTheme('default');    // Starfield restored
 * ```
 */

import { getCurrentTheme, watchTheme } from '@core/themes';
import { setupStarfield } from '@effects/starfield.js';
import { setupOceanBackground } from '@core/themes/renderers/underwater';
import { debug } from '@core/logger.js';

/**
 * Initializes the background effect for the current theme.
 *
 * This function checks the current theme for a custom background renderer
 * or particle system. If found, it uses the custom implementation; otherwise,
 * it falls back to the default starfield effect.
 *
 * ## Background Renderer Priority
 * 1. `theme.renderers.background` - Full background control (gradient + particles)
 * 2. `theme.renderers.particles` - Custom particle system only
 * 3. Default starfield - Classic animated star particles
 *
 * ## Theme-Specific Implementations
 * - **Default Theme**: Animated starfield with white particles
 * - **Monochrome Theme**: Same starfield with off-white particles
 * - **Underwater Theme**: Ocean gradient with plankton particles
 *
 * @param canvas - The canvas element for background rendering
 *
 * @example
 * ```typescript
 * const bgCanvas = document.getElementById('starfieldCanvas') as HTMLCanvasElement;
 * initializeBackground(bgCanvas);
 * ```
 */
export function initializeBackground(canvas: HTMLCanvasElement): void {
  const theme = getCurrentTheme();
  const themeId = theme.id;

  debug('effects', `Initializing background for theme: ${themeId}`);

  // Check for custom background renderer
  if (theme.renderers?.background) {
    debug('effects', `Using custom background renderer for ${themeId}`);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      theme.renderers.background(ctx, canvas);
    }
    return;
  }

  // Check for custom particle system
  if (theme.renderers?.particles) {
    debug('effects', `Using custom particle system for ${themeId}`);
    theme.renderers.particles.setup(canvas);
    return;
  }

  // Underwater theme uses ocean background
  if (themeId === 'underwater') {
    debug('effects', 'Using ocean background for underwater theme');
    setupOceanBackground(canvas);
    return;
  }

  // Default to starfield for all other themes
  debug('effects', 'Using default starfield background');
  setupStarfield(canvas);
}

/**
 * Sets up automatic background reinitialization when theme changes.
 *
 * This function registers a theme watcher that reinitializes the background
 * whenever the user switches themes. The previous background's animation loop
 * is abandoned and garbage collected automatically.
 *
 * ## Implementation Notes
 * - Only call this once during app initialization
 * - Canvas element is captured in closure for reinitialization
 * - Previous background loops continue briefly but are orphaned (no memory leak)
 *
 * @param canvas - The canvas element for background rendering
 *
 * @example
 * ```typescript
 * // In main.ts initialization
 * const starfieldCanvas = document.getElementById('starfieldCanvas') as HTMLCanvasElement;
 * if (starfieldCanvas) {
 *   setupBackgroundWatcher(starfieldCanvas);
 * }
 * ```
 */
export function setupBackgroundWatcher(canvas: HTMLCanvasElement): void {
  watchTheme(() => {
    const theme = getCurrentTheme();
    debug('effects', `Theme changed to ${theme.id}, reinitializing background`);
    initializeBackground(canvas);
  });
}
