/**
 * Theme definitions and constants for the Spaceship Dodge game.
 *
 * This module contains the color-only theme definitions for Phase 1 of the theme system.
 * Future phases may add asset-based themes (images, sprites, etc.).
 *
 * @module themeConstants
 */

import type { Theme, ThemeId, UIColorPalette } from '@types';

const DEFAULT_UI_COLORS: UIColorPalette = {
  // Overlay colors - transparent for starfield visibility
  overlayBackground: 'rgba(0, 0, 0, 0.8)',
  overlayText: '#ffffff',
  overlayTitle: '#00ffff',

  // Button colors - simplified approach
  buttonBackground: 'rgba(0, 0, 0, 0.6)',
  buttonText: '#ffffff',
  buttonHover: 'rgba(0, 0, 0, 0.7)',
  buttonFocus: '#00ffff',

  // Settings button specific - white with black text
  settingsButtonBackground: '#ffffff',
  settingsButtonText: '#000000',
};

const MONOCHROME_UI_COLORS: UIColorPalette = {
  // Overlay colors - COMPLETELY transparent (invisible) as requested
  overlayBackground: 'transparent', // 100% transparent - completely see-through
  overlayText: '#f5f5f0',
  overlayTitle: '#f5f5f0', // No blue glow, just off-white

  // Button colors - ALL buttons now consistent (translucent with white text)
  buttonBackground: 'rgba(0, 0, 0, 0.6)',
  buttonText: '#ffffff',
  buttonHover: 'rgba(0, 0, 0, 0.7)',
  buttonFocus: '#f5f5f0',

  // Settings button - NOW MATCHES other buttons (translucent with white text)
  settingsButtonBackground: 'rgba(0, 0, 0, 0.6)',
  settingsButtonText: '#ffffff',
};

/**
 * Default "Space Explorer" theme with classic arcade aesthetics.
 *
 * This theme uses the original color palette extracted from the game's
 * hardcoded colors, providing the familiar neon-space look.
 */
export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Space Explorer',
  description: 'Classic space arcade aesthetic',
  colors: {
    // Entity colors
    player: '#00ffff',
    playerEngine: 'rgba(0, 255, 255, 0.7)',
    playerShield: '#00ffff',
    bullet: '#ffff88',
    asteroid: '#ff4500',

    // UI colors
    hudText: '#ffffff',
    hudAccent: '#00ffff',
    scorePopup: '#ffffff',
    bonusPopup: '#00ff00',
    powerupPopup: '#00ffff',

    // Effects
    starfield: '#ffffff',

    // Powerup specific
    powerupShield: '#0ff',
    powerupBlaster: '#f9d71c',
  },
  uiColors: DEFAULT_UI_COLORS,
  fonts: {
    family: '"Inter", sans-serif',
    hudSize: '24px',
  },
};

/**
 * Monochrome theme with minimalist off-white aesthetic.
 *
 * This theme provides a clean, minimalist look using a single
 * off-white color (#f5f5f0) for all game elements.
 */
export const MONOCHROME_THEME: Theme = {
  id: 'monochrome',
  name: 'Monochrome',
  description: 'Minimalist off-white aesthetic',
  colors: {
    // Entity colors
    player: '#f5f5f0',
    playerEngine: 'rgba(245, 245, 240, 0.7)',
    playerShield: '#f5f5f0',
    bullet: '#f5f5f0',
    asteroid: '#f5f5f0',

    // UI colors
    hudText: '#f5f5f0',
    hudAccent: '#f5f5f0',
    scorePopup: '#f5f5f0',
    bonusPopup: '#f5f5f0',
    powerupPopup: '#f5f5f0',

    // Effects
    starfield: '#f5f5f0',

    // Powerup specific
    powerupShield: '#f5f5f0',
    powerupBlaster: '#f5f5f0',
  },
  uiColors: MONOCHROME_UI_COLORS,
  fonts: {
    family: '"Inter", sans-serif',
    hudSize: '24px',
  },
};

/**
 * Registry of all available themes.
 *
 * This object maps theme IDs to their complete theme definitions.
 * Used by the theme manager for validation and theme lookup.
 */
export const THEME_REGISTRY: Record<ThemeId, Theme> = {
  default: DEFAULT_THEME,
  monochrome: MONOCHROME_THEME,
};

/**
 * Array of valid theme IDs.
 *
 * Used for validation when loading themes from localStorage
 * or user input to prevent injection attacks.
 */
export const VALID_THEME_IDS: readonly ThemeId[] = ['default', 'monochrome'] as const;

/**
 * LocalStorage key for theme preference persistence.
 *
 * Follows the naming convention used by settingsManager
 * (e.g., 'spaceshipDodgeVolume').
 */
export const THEME_STORAGE_KEY = 'spaceshipDodgeTheme';
