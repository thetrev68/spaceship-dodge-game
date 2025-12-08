/**
 * Theme Constants Unit Tests
 *
 * Tests for theme constant definitions including:
 * - Theme registry integrity
 * - Color palette completeness
 * - Type safety
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_THEME,
  MONOCHROME_THEME,
  THEME_REGISTRY,
  VALID_THEME_IDS,
} from '@core/themes/themeConstants';
import type { Theme, ColorPalette, FontConfig } from '@types';

describe('Theme Constants', () => {
  describe('DEFAULT_THEME', () => {
    it('should have correct structure', () => {
      expect(DEFAULT_THEME).toHaveProperty('id', 'default');
      expect(DEFAULT_THEME).toHaveProperty('name', 'Space Explorer');
      expect(DEFAULT_THEME).toHaveProperty('description');
      expect(DEFAULT_THEME).toHaveProperty('colors');
      expect(DEFAULT_THEME).toHaveProperty('fonts');
    });

    it('should have complete color palette', () => {
      const colors = DEFAULT_THEME.colors;
      expect(colors).toHaveProperty('player');
      expect(colors).toHaveProperty('playerEngine');
      expect(colors).toHaveProperty('playerShield');
      expect(colors).toHaveProperty('bullet');
      expect(colors).toHaveProperty('asteroid');
      expect(colors).toHaveProperty('hudText');
      expect(colors).toHaveProperty('hudAccent');
      expect(colors).toHaveProperty('scorePopup');
      expect(colors).toHaveProperty('bonusPopup');
      expect(colors).toHaveProperty('powerupPopup');
      expect(colors).toHaveProperty('starfield');
      expect(colors).toHaveProperty('powerupShield');
      expect(colors).toHaveProperty('powerupBlaster');
    });

    it('should have valid color values', () => {
      const colors = DEFAULT_THEME.colors;
      Object.values(colors).forEach((color) => {
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });
    });

    it('should have valid font configuration', () => {
      const fonts = DEFAULT_THEME.fonts;
      expect(fonts).toHaveProperty('family');
      expect(fonts).toHaveProperty('hudSize');
      expect(typeof fonts.family).toBe('string');
      expect(typeof fonts.hudSize).toBe('string');
    });
  });

  describe('MONOCHROME_THEME', () => {
    it('should have correct structure', () => {
      expect(MONOCHROME_THEME).toHaveProperty('id', 'monochrome');
      expect(MONOCHROME_THEME).toHaveProperty('name', 'Monochrome');
      expect(MONOCHROME_THEME).toHaveProperty('description');
      expect(MONOCHROME_THEME).toHaveProperty('colors');
      expect(MONOCHROME_THEME).toHaveProperty('fonts');
    });

    it('should have complete color palette', () => {
      const colors = MONOCHROME_THEME.colors;
      expect(colors).toHaveProperty('player');
      expect(colors).toHaveProperty('playerEngine');
      expect(colors).toHaveProperty('playerShield');
      expect(colors).toHaveProperty('bullet');
      expect(colors).toHaveProperty('asteroid');
      expect(colors).toHaveProperty('hudText');
      expect(colors).toHaveProperty('hudAccent');
      expect(colors).toHaveProperty('scorePopup');
      expect(colors).toHaveProperty('bonusPopup');
      expect(colors).toHaveProperty('powerupPopup');
      expect(colors).toHaveProperty('starfield');
      expect(colors).toHaveProperty('powerupShield');
      expect(colors).toHaveProperty('powerupBlaster');
    });

    it('should use monochrome color scheme', () => {
      const colors = MONOCHROME_THEME.colors;
      // All colors should be based on the same off-white shade (#f5f5f0)
      // Some colors use RGBA format for transparency effects
      Object.values(colors).forEach((color) => {
        // Check if color contains the base hex value or is an RGBA variant
        expect(color.includes('#f5f5f0') || color.includes('rgba(245, 245, 240')).toBe(true);
      });
    });

    it('should have complete UI color palette', () => {
      const uiColors = MONOCHROME_THEME.uiColors;
      expect(uiColors).toHaveProperty('overlayBackground');
      expect(uiColors).toHaveProperty('overlayText');
      expect(uiColors).toHaveProperty('overlayTitle');
      expect(uiColors).toHaveProperty('buttonBackground');
      expect(uiColors).toHaveProperty('buttonText');
      expect(uiColors).toHaveProperty('buttonHover');
      expect(uiColors).toHaveProperty('buttonFocus');
      expect(uiColors).toHaveProperty('settingsButtonBackground');
      expect(uiColors).toHaveProperty('settingsButtonText');
    });

    it('should have completely transparent overlay background (invisible)', () => {
      const uiColors = MONOCHROME_THEME.uiColors;
      expect(uiColors.overlayBackground).toBe('transparent');
    });

    it('should have all buttons consistent with translucent background and white text', () => {
      const uiColors = MONOCHROME_THEME.uiColors;
      // All buttons now use the same styling
      expect(uiColors.buttonBackground).toBe('rgba(0, 0, 0, 0.6)');
      expect(uiColors.buttonText).toBe('#ffffff');
      expect(uiColors.settingsButtonBackground).toBe('rgba(0, 0, 0, 0.6)');
      expect(uiColors.settingsButtonText).toBe('#ffffff');
    });
  });

  describe('THEME_REGISTRY', () => {
    it('should contain all registered themes', () => {
      expect(THEME_REGISTRY).toHaveProperty('default');
      expect(THEME_REGISTRY).toHaveProperty('monochrome');
      expect(THEME_REGISTRY).toHaveProperty('underwater');
      expect(THEME_REGISTRY).toHaveProperty('medieval');
    });

    it('should map theme IDs to theme objects', () => {
      expect(THEME_REGISTRY.default).toEqual(DEFAULT_THEME);
      expect(THEME_REGISTRY.monochrome).toEqual(MONOCHROME_THEME);
      expect(THEME_REGISTRY.underwater.id).toBe('underwater');
      expect(THEME_REGISTRY.medieval.id).toBe('medieval');
    });

    it('should have consistent theme structure', () => {
      Object.values(THEME_REGISTRY).forEach((theme) => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('fonts');
      });
    });
  });

  describe('VALID_THEME_IDS', () => {
    it('should contain all valid theme IDs', () => {
      expect(VALID_THEME_IDS).toContain('default');
      expect(VALID_THEME_IDS).toContain('monochrome');
      expect(VALID_THEME_IDS).toContain('underwater');
      expect(VALID_THEME_IDS).toContain('medieval');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(VALID_THEME_IDS)).toBe(true);
      // TypeScript ensures this is readonly, but we can check it's not empty
      expect(VALID_THEME_IDS.length).toBeGreaterThan(0);
    });

    it('should match theme registry keys', () => {
      const registryKeys = Object.keys(THEME_REGISTRY);
      VALID_THEME_IDS.forEach((validId) => {
        expect(registryKeys).toContain(validId);
      });
    });
  });

  describe('Type Safety', () => {
    it('should have themes that conform to Theme type', () => {
      const testTheme = (theme: unknown): theme is Theme => {
        return (
          typeof theme === 'object' &&
          theme !== null &&
          'id' in theme &&
          'name' in theme &&
          'description' in theme &&
          'colors' in theme &&
          'fonts' in theme
        );
      };

      expect(testTheme(DEFAULT_THEME)).toBe(true);
      expect(testTheme(MONOCHROME_THEME)).toBe(true);
    });

    it('should have color palettes that conform to ColorPalette type', () => {
      const testColorPalette = (colors: unknown): colors is ColorPalette => {
        return (
          typeof colors === 'object' &&
          colors !== null &&
          'player' in colors &&
          'asteroid' in colors &&
          'bullet' in colors
        );
      };

      expect(testColorPalette(DEFAULT_THEME.colors)).toBe(true);
      expect(testColorPalette(MONOCHROME_THEME.colors)).toBe(true);
    });

    it('should have fonts that conform to FontConfig type', () => {
      const testFontConfig = (fonts: unknown): fonts is FontConfig => {
        return (
          typeof fonts === 'object' && fonts !== null && 'family' in fonts && 'hudSize' in fonts
        );
      };

      expect(testFontConfig(DEFAULT_THEME.fonts)).toBe(true);
      expect(testFontConfig(MONOCHROME_THEME.fonts)).toBe(true);
    });
  });

  describe('Theme Consistency', () => {
    it('should have consistent color palette structure between themes', () => {
      const defaultColors = Object.keys(DEFAULT_THEME.colors);
      const monochromeColors = Object.keys(MONOCHROME_THEME.colors);

      expect(defaultColors).toEqual(monochromeColors);
      expect(defaultColors).toEqual(Object.keys(THEME_REGISTRY.medieval.colors));
    });

    it('should have consistent font structure between themes', () => {
      const defaultFontKeys = Object.keys(DEFAULT_THEME.fonts);
      const monochromeFontKeys = Object.keys(MONOCHROME_THEME.fonts);

      expect(defaultFontKeys).toEqual(monochromeFontKeys);
      expect(defaultFontKeys).toEqual(Object.keys(THEME_REGISTRY.medieval.fonts));
    });
  });

  describe('MEDIEVAL_THEME', () => {
    it('should expose all medieval renderers', () => {
      const medievalTheme = THEME_REGISTRY.medieval;

      expect(medievalTheme.renderers?.background).toBeDefined();
      expect(medievalTheme.renderers?.player).toBeDefined();
      expect(medievalTheme.renderers?.obstacle).toBeDefined();
      expect(medievalTheme.renderers?.bullet).toBeDefined();
      expect(medievalTheme.renderers?.powerups?.shield).toBeDefined();
      expect(medievalTheme.renderers?.powerups?.doubleBlaster).toBeDefined();
    });

    it('should keep UI palette aligned with defaults', () => {
      const medievalUIKeys = Object.keys(THEME_REGISTRY.medieval.uiColors);
      const defaultUIKeys = Object.keys(DEFAULT_THEME.uiColors);

      expect(medievalUIKeys).toEqual(defaultUIKeys);
    });
  });
});
