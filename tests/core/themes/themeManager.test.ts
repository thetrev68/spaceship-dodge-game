/**
 * Theme Manager Unit Tests
 *
 * Comprehensive tests for the theme manager functionality including:
 * - Theme initialization
 * - Theme switching
 * - localStorage persistence
 * - Invalid theme handling
 * - Reactive updates
 * - Validation logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentTheme,
  setTheme,
  getAvailableThemes,
  initializeThemeSystem,
  watchTheme,
  applyUITheme,
} from '@core/themes';
import {
  DEFAULT_THEME,
  MONOCHROME_THEME,
  VALID_THEME_IDS,
  THEME_STORAGE_KEY,
} from '@core/themes/themeConstants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Theme Manager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset theme system to default state
    initializeThemeSystem();
  });

  afterEach(() => {
    // Clean up any watchers
    vi.restoreAllMocks();
  });

  describe('initializeThemeSystem()', () => {
    it('should initialize with default theme when no theme is stored', () => {
      const theme = getCurrentTheme();
      expect(theme).toEqual(DEFAULT_THEME);
      expect(theme.id).toBe('default');
    });

    it('should load theme from localStorage when valid theme is stored', () => {
      localStorageMock.setItem(THEME_STORAGE_KEY, 'monochrome');
      initializeThemeSystem();
      const theme = getCurrentTheme();
      expect(theme).toEqual(MONOCHROME_THEME);
      expect(theme.id).toBe('monochrome');
    });

    it('should fall back to default theme when invalid theme is stored', () => {
      localStorageMock.setItem(THEME_STORAGE_KEY, 'invalid-theme');
      initializeThemeSystem();
      const theme = getCurrentTheme();
      expect(theme).toEqual(DEFAULT_THEME);
      expect(theme.id).toBe('default');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = () => {
        throw new Error('localStorage error');
      };

      initializeThemeSystem();
      const theme = getCurrentTheme();
      expect(theme).toEqual(DEFAULT_THEME);

      // Restore original method
      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('getCurrentTheme()', () => {
    it('should return the current active theme', () => {
      const theme = getCurrentTheme();
      expect(theme).toBeDefined();
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('fonts');
    });

    it('should return theme with correct structure', () => {
      const theme = getCurrentTheme();
      expect(theme.colors).toHaveProperty('player');
      expect(theme.colors).toHaveProperty('asteroid');
      expect(theme.colors).toHaveProperty('bullet');
      expect(theme.colors).toHaveProperty('hudText');
      expect(theme.fonts).toHaveProperty('family');
      expect(theme.fonts).toHaveProperty('hudSize');
    });
  });

  describe('setTheme()', () => {
    it('should change current theme to valid theme ID', () => {
      setTheme('monochrome');
      const theme = getCurrentTheme();
      expect(theme).toEqual(MONOCHROME_THEME);
      expect(theme.id).toBe('monochrome');

      setTheme('medieval');
      const medieval = getCurrentTheme();
      expect(medieval.id).toBe('medieval');
    });

    it('should persist theme preference to localStorage', () => {
      setTheme('monochrome');
      const storedTheme = localStorageMock.getItem(THEME_STORAGE_KEY);
      expect(storedTheme).toBe('monochrome');
    });

    it('should throw error for invalid theme ID', () => {
      expect(() => setTheme('invalid-theme')).toThrow();
      expect(() => setTheme('invalid-theme')).toThrow(/Invalid theme ID/);
    });

    it('should handle null/undefined theme ID', () => {
      // @ts-expect-error Testing invalid input
      expect(() => setTheme(null)).toThrow();
      // @ts-expect-error Testing invalid input
      expect(() => setTheme(undefined)).toThrow();
    });

    it('should handle theme switching multiple times', () => {
      setTheme('monochrome');
      let theme = getCurrentTheme();
      expect(theme.id).toBe('monochrome');

      setTheme('default');
      theme = getCurrentTheme();
      expect(theme.id).toBe('default');

      setTheme('medieval');
      theme = getCurrentTheme();
      expect(theme.id).toBe('medieval');
    });
  });

  describe('getAvailableThemes()', () => {
    it('should return array of all available themes', () => {
      const themes = getAvailableThemes();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
    });

    it('should include both default and monochrome themes', () => {
      const themes = getAvailableThemes();
      const themeIds = themes.map((t) => t.id);
      expect(themeIds).toContain('default');
      expect(themeIds).toContain('monochrome');
      expect(themeIds).toContain('underwater');
      expect(themeIds).toContain('medieval');
    });

    it('should return themes with complete structure', () => {
      const themes = getAvailableThemes();
      themes.forEach((theme) => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('fonts');
      });
    });
  });

  describe('watchTheme()', () => {
    it('should call callback when theme changes', () => {
      const callback = vi.fn();
      const unwatch = watchTheme(callback);

      setTheme('monochrome');
      expect(callback).toHaveBeenCalled();

      // Clean up
      unwatch();
    });

    it('should not call callback when theme does not change', () => {
      const callback = vi.fn();
      const unwatch = watchTheme(callback);

      // No theme change, callback should not be called
      expect(callback).not.toHaveBeenCalled();

      // Clean up
      unwatch();
    });

    it('should allow multiple watchers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const unwatch1 = watchTheme(callback1);
      const unwatch2 = watchTheme(callback2);

      setTheme('monochrome');
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Clean up
      unwatch1();
      unwatch2();
    });

    it('should stop calling callback after unwatch', () => {
      const callback = vi.fn();
      const unwatch = watchTheme(callback);

      setTheme('monochrome');
      expect(callback).toHaveBeenCalledTimes(1);

      unwatch();

      // Change theme again
      setTheme('default');
      // Callback should not be called again
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Theme Validation', () => {
    it('should only accept valid theme IDs', () => {
      VALID_THEME_IDS.forEach((validId) => {
        expect(() => setTheme(validId)).not.toThrow();
      });
    });

    it('should reject invalid theme IDs', () => {
      const invalidIds = ['', ' ', 'invalid', 'default ', ' monochrome', 'DEFAULT', 'MONOCHROME'];
      invalidIds.forEach((invalidId) => {
        expect(() => setTheme(invalidId)).toThrow();
      });
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme across multiple setTheme calls', () => {
      setTheme('monochrome');
      setTheme('default');
      setTheme('monochrome');

      const storedTheme = localStorageMock.getItem(THEME_STORAGE_KEY);
      expect(storedTheme).toBe('monochrome');
    });

    it('should maintain persistence after initialization', () => {
      setTheme('monochrome');
      initializeThemeSystem();
      const theme = getCurrentTheme();
      expect(theme.id).toBe('monochrome');
    });
  });

  describe('applyUITheme()', () => {
    it('should set CSS variables for UI theme colors', () => {
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');
      vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as unknown as NodeListOf<Element>);

      // Call the function directly
      applyUITheme();

      // Verify CSS variables were set
      const { uiColors } = DEFAULT_THEME;

      expect(setPropertySpy).toHaveBeenCalledWith(
        '--overlay-background',
        uiColors.overlayBackground
      );
      expect(setPropertySpy).toHaveBeenCalledWith('--overlay-text', uiColors.overlayText);
      expect(setPropertySpy).toHaveBeenCalledWith('--overlay-title', uiColors.overlayTitle);
      expect(setPropertySpy).toHaveBeenCalledWith('--button-background', uiColors.buttonBackground);
      expect(setPropertySpy).toHaveBeenCalledWith('--button-text', uiColors.buttonText);
      expect(setPropertySpy).toHaveBeenCalledWith('--button-hover', uiColors.buttonHover);
      expect(setPropertySpy).toHaveBeenCalledWith('--button-focus', uiColors.buttonFocus);
      expect(setPropertySpy).toHaveBeenCalledWith(
        '--settings-button-bg',
        uiColors.settingsButtonBackground
      );
      expect(setPropertySpy).toHaveBeenCalledWith(
        '--settings-button-text',
        uiColors.settingsButtonText
      );
      expect(setPropertySpy).toHaveBeenCalledTimes(9);
    });

    it('styles overlays and buttons in the DOM', () => {
      const overlay = document.createElement('div');
      overlay.className = 'game-overlay';
      const title = document.createElement('h1');
      overlay.appendChild(title);
      const button = document.createElement('button');
      button.className = 'game-button';

      document.body.append(overlay, button);

      applyUITheme();

      expect(overlay.style.backgroundColor).toBe('var(--overlay-background)');
      expect(overlay.style.color).toBe('var(--overlay-text)');
      expect(title.style.color).toBe('var(--overlay-title)');
      expect(button.style.backgroundColor).toBe('var(--button-background)');
    });
  });
});
