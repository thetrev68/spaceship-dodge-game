/**
 * Unit tests for background manager (theme-aware background system)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Theme } from '@types';
import { createMockCanvas } from '../helpers/mockCanvas';

let initializeBackground: (canvas: HTMLCanvasElement) => void;
let setupBackgroundWatcher: (canvas: HTMLCanvasElement) => void;

// Mock dependencies using vi.hoisted for proper hoisting
const {
  mockSetupStarfield,
  mockBackgroundRenderer,
  mockGetCurrentTheme,
  mockWatchTheme,
  mockOceanCleanup,
  mockClearOceanCleanup,
} = vi.hoisted(() => ({
  mockSetupStarfield: vi.fn(),
  mockBackgroundRenderer: vi.fn(),
  mockGetCurrentTheme: vi.fn(),
  mockWatchTheme: vi.fn(),
  mockOceanCleanup: vi.fn(() => null),
  mockClearOceanCleanup: vi.fn(),
}));

vi.mock('@effects/starfield.js', () => ({
  setupStarfield: mockSetupStarfield,
}));

vi.mock('@core/themes/renderers/underwater/oceanBackground', () => ({
  getOceanBackgroundCleanup: mockOceanCleanup,
  clearOceanBackgroundCleanup: mockClearOceanCleanup,
}));

vi.mock('@core/themes', () => ({
  getCurrentTheme: () => mockGetCurrentTheme(),
  watchTheme: (callback: () => void) => mockWatchTheme(callback),
}));

vi.mock('@core/logger.js', () => ({
  debug: vi.fn(),
}));

function createMockTheme(overrides?: Partial<Theme>): Theme {
  return {
    id: 'default',
    name: 'Default',
    description: 'Default theme',
    colors: {} as any,
    uiColors: {} as any,
    fonts: {} as any,
    ...overrides,
  };
}

describe('initializeBackground', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ initializeBackground, setupBackgroundWatcher } = await import('@effects/backgroundManager'));
  });

  it('should use starfield for default theme', () => {
    const canvas = createMockCanvas();
    mockGetCurrentTheme.mockReturnValue(createMockTheme({ id: 'default' }));

    initializeBackground(canvas);

    expect(mockSetupStarfield).toHaveBeenCalledWith(canvas);
  });

  it('should use ocean background for underwater theme', () => {
    const canvas = createMockCanvas();
    mockGetCurrentTheme.mockReturnValue(
      createMockTheme({
        id: 'underwater',
        renderers: {
          background: mockBackgroundRenderer,
        },
      })
    );

    initializeBackground(canvas);

    expect(mockBackgroundRenderer).toHaveBeenCalledWith(expect.anything(), canvas);
    expect(mockSetupStarfield).not.toHaveBeenCalled();
  });

  it('should use starfield for monochrome theme', () => {
    const canvas = createMockCanvas();
    mockGetCurrentTheme.mockReturnValue(createMockTheme({ id: 'monochrome' }));

    initializeBackground(canvas);

    expect(mockSetupStarfield).toHaveBeenCalledWith(canvas);
  });

  it('should use custom background renderer if provided', () => {
    const canvas = createMockCanvas();
    const customRenderer = vi.fn();
    mockGetCurrentTheme.mockReturnValue(
      createMockTheme({
        renderers: {
          background: customRenderer,
        },
      })
    );

    initializeBackground(canvas);

    // Should have called custom renderer
    expect(customRenderer).toHaveBeenCalled();
    expect(mockSetupStarfield).not.toHaveBeenCalled();
  });

  it('should use custom particle system if provided', () => {
    const canvas = createMockCanvas();
    const customSetup = vi.fn();
    mockGetCurrentTheme.mockReturnValue(
      createMockTheme({
        renderers: {
          particles: {
            setup: customSetup,
            animate: vi.fn(),
          },
        },
      })
    );

    initializeBackground(canvas);

    expect(customSetup).toHaveBeenCalledWith(canvas);
    expect(mockSetupStarfield).not.toHaveBeenCalled();
  });

  it('should prioritize background renderer over particle system', () => {
    const canvas = createMockCanvas();
    const customBackground = vi.fn();
    const customParticles = vi.fn();

    mockGetCurrentTheme.mockReturnValue(
      createMockTheme({
        renderers: {
          background: customBackground,
          particles: {
            setup: customParticles,
            animate: vi.fn(),
          },
        },
      })
    );

    initializeBackground(canvas);

    expect(customBackground).toHaveBeenCalled();
    expect(customParticles).not.toHaveBeenCalled();
  });
});

describe('setupBackgroundWatcher', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ initializeBackground, setupBackgroundWatcher } = await import('@effects/backgroundManager'));
  });

  it('should register theme watcher', () => {
    const canvas = createMockCanvas();

    setupBackgroundWatcher(canvas);

    expect(mockWatchTheme).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should reinitialize background on theme change', () => {
    const canvas = createMockCanvas();
    let watcherCallback: (() => void) | undefined;

    mockWatchTheme.mockImplementation((cb: () => void) => {
      watcherCallback = cb;
    });

    setupBackgroundWatcher(canvas);

    // Initially default theme
    mockGetCurrentTheme.mockReturnValue(createMockTheme({ id: 'default' }));

    // Simulate theme change to underwater
    mockGetCurrentTheme.mockReturnValue(
      createMockTheme({
        id: 'underwater',
        renderers: {
          background: mockBackgroundRenderer,
        },
      })
    );
    if (watcherCallback) {
      watcherCallback();
    }

    expect(mockBackgroundRenderer).toHaveBeenCalledWith(expect.anything(), canvas);
  });
});
