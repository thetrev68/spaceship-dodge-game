/**
 * Theme definitions and constants for the Spaceship Dodge game.
 *
 * This module contains the color-only theme definitions for Phase 1 of the theme system.
 * Future phases may add asset-based themes (images, sprites, etc.).
 *
 * @module themeConstants
 */

import {
  drawSubmarine,
  drawJellyfish,
  drawTorpedo,
  drawOctopusPowerup,
  drawStarfishPowerup,
  drawOceanBackground,
} from './renderers/underwater';

import {
  drawDragon,
  drawMedievalObstacle,
  drawFireball,
  drawRuneShield,
  drawSpellTome,
  setupMedievalBackground,
} from './renderers/medieval';

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

const MEDIEVAL_UI_COLORS: UIColorPalette = {
  // Overlay colors - dark medieval aesthetic
  overlayBackground: 'rgba(31, 27, 75, 0.85)', // Dark purple-blue
  overlayText: '#fef3c7', // Warm cream
  overlayTitle: '#d97706', // Amber

  // Button colors
  buttonBackground: 'rgba(217, 119, 6, 0.2)', // Translucent amber
  buttonText: '#ffffff',
  buttonHover: 'rgba(217, 119, 6, 0.4)',
  buttonFocus: '#a855f7', // Purple

  // Settings button
  settingsButtonBackground: 'rgba(217, 119, 6, 0.2)',
  settingsButtonText: '#ffffff',
};

/**
 * Underwater theme with submarine, jellyfish, and ocean visuals.
 *
 * This theme provides a complete underwater aesthetic with custom renderers
 * for all game entities, transforming the space theme into an ocean adventure.
 */
const UNDERWATER_THEME: Theme = {
  id: 'underwater',
  name: 'Deep Ocean',
  description: 'Submarine exploration in bioluminescent depths',
  colors: {
    // Entity colors (bioluminescent palette)
    player: '#00d9ff', // Cyan submarine
    playerEngine: 'rgba(0, 217, 255, 0.5)', // Cyan bubbles
    playerShield: '#00ffaa', // Aqua shield
    bullet: '#ffaa00', // Orange torpedo
    asteroid: '#9f7aea', // Purple jellyfish

    // UI colors
    hudText: '#ffffff',
    hudAccent: '#00d9ff',
    scorePopup: '#ffffff',
    bonusPopup: '#00ffaa',
    powerupPopup: '#00d9ff',

    // Effects
    starfield: '#7dd3fc', // Light blue plankton

    // Powerup colors
    powerupShield: '#ff6b9d', // Pink octopus
    powerupBlaster: '#fbbf24', // Yellow starfish
  },
  uiColors: {
    // Keep UI consistent across themes (or customize)
    overlayBackground: 'rgba(13, 43, 61, 0.85)', // Dark ocean blue
    overlayText: '#ffffff',
    overlayTitle: '#00d9ff',
    buttonBackground: 'rgba(0, 217, 255, 0.2)',
    buttonText: '#ffffff',
    buttonHover: 'rgba(0, 217, 255, 0.4)',
    buttonFocus: '#00ffaa',
    settingsButtonBackground: 'rgba(0, 217, 255, 0.2)',
    settingsButtonText: '#ffffff',
  },
  fonts: {
    family: '"Inter", sans-serif',
    hudSize: '24px',
  },
  // CUSTOM RENDERERS
  renderers: {
    background: drawOceanBackground,
    player: drawSubmarine,
    obstacle: drawJellyfish,
    bullet: drawTorpedo,
    powerups: {
      shield: drawOctopusPowerup,
      doubleBlaster: drawStarfishPowerup,
    },
  },
  // THEME-SPECIFIC AUDIO
  audio: {
    bgMusic: 'sounds/underwater-bg-music.mp3',
    fireSound: 'sounds/underwater-fire.mp3',
    breakSound: 'sounds/underwater-break.mp3',
    // gameover and levelup can use defaults
  },
};

/**
 * Medieval Fantasy theme with dragon rider, wyverns, and magical elements.
 *
 * This theme provides a medieval fantasy aesthetic with custom renderers planned
 * for dragon rider (player), wyverns/bats/crystals (obstacles), fireballs (bullets),
 * and magical powerups. Phase 1: Colors only, renderers coming in later phases.
 */
const MEDIEVAL_THEME: Theme = {
  id: 'medieval',
  name: 'Dragon Rider',
  description: 'Navigate hostile skies, dodging cursed wyverns and magical defenses',
  colors: {
    // Entity colors (earthy medieval tones)
    player: '#d97706', // Amber/orange dragon
    playerEngine: 'rgba(239, 68, 68, 0.6)', // Red fire breath
    playerShield: '#a855f7', // Purple magical shield
    bullet: '#ef4444', // Red fireball
    asteroid: '#78716c', // Gray stone/creature base

    // UI colors
    hudText: '#fef3c7', // Warm cream text
    hudAccent: '#d97706', // Amber accents
    scorePopup: '#fbbf24', // Gold score text
    bonusPopup: '#a855f7', // Purple bonus
    powerupPopup: '#10b981', // Green powerup text

    // Effects
    starfield: '#fbbf24', // Golden embers

    // Powerup colors
    powerupShield: '#8b5cf6', // Purple magic rune
    powerupBlaster: '#10b981', // Green spell tome
  },
  uiColors: MEDIEVAL_UI_COLORS,
  fonts: {
    family: '"Inter", sans-serif',
    hudSize: '24px',
  },
  // CUSTOM RENDERERS
  renderers: {
    background: setupMedievalBackground,
    player: drawDragon,
    obstacle: drawMedievalObstacle,
    bullet: drawFireball,
    powerups: {
      shield: drawRuneShield,
      doubleBlaster: drawSpellTome,
    },
  },
  // THEME-SPECIFIC AUDIO
  audio: {
    bgMusic: 'sounds/medieval-bg-music.mp3',
    fireSound: 'sounds/medieval-fire.mp3',
    breakSound: 'sounds/medieval-break.mp3',
    // gameover and levelup can use defaults
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
  underwater: UNDERWATER_THEME,
  medieval: MEDIEVAL_THEME,
};

/**
 * Array of valid theme IDs.
 *
 * Used for validation when loading themes from localStorage
 * or user input to prevent injection attacks.
 */
export const VALID_THEME_IDS: readonly ThemeId[] = [
  'default',
  'monochrome',
  'underwater',
  'medieval',
] as const;

/**
 * LocalStorage key for theme preference persistence.
 *
 * Follows the naming convention used by settingsManager
 * (e.g., 'spaceshipDodgeVolume').
 */
export const THEME_STORAGE_KEY = 'spaceshipDodgeTheme';
