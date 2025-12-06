/**
 * Unit tests for background manager (theme-aware background system)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeBackground, setupBackgroundWatcher } from '@effects/backgroundManager';
import type { Theme } from '@types';

// Mock dependencies using vi.hoisted for proper hoisting
const { mockSetupStarfield, mockSetupOceanBackground, mockGetCurrentTheme, mockWatchTheme } =
  vi.hoisted(() => ({
    mockSetupStarfield: vi.fn(),
    mockSetupOceanBackground: vi.fn(),
    mockGetCurrentTheme: vi.fn(),
    mockWatchTheme: vi.fn(),
  }));

vi.mock('@effects/starfield', () => ({
  setupStarfield: mockSetupStarfield,
}));

vi.mock('@core/themes/renderers/underwater', () => ({
  setupOceanBackground: mockSetupOceanBackground,
}));

vi.mock('@core/themes', () => ({
  getCurrentTheme: () => mockGetCurrentTheme(),
  watchTheme: (callback: () => void) => mockWatchTheme(callback),
}));

vi.mock('@core/logger', () => ({
  debug: vi.fn(),
}));

function createMockCanvas(): HTMLCanvasElement {
  return {
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
    })),
    width: 800,
    height: 600,
  } as unknown as HTMLCanvasElement;
}

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use starfield for default theme', () => {
    const canvas = createMockCanvas();
    mockGetCurrentTheme.mockReturnValue(createMockTheme({ id: 'default' }));

    initializeBackground(canvas);

    expect(mockSetupStarfield).toHaveBeenCalledWith(canvas);
    expect(mockSetupOceanBackground).not.toHaveBeenCalled();
  });

  it('should use ocean background for underwater theme', () => {
    const canvas = createMockCanvas();
    mockGetCurrentTheme.mockReturnValue(createMockTheme({ id: 'underwater' }));

    initializeBackground(canvas);

    expect(mockSetupOceanBackground).toHaveBeenCalledWith(canvas);
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
    expect(mockSetupOceanBackground).not.toHaveBeenCalled();
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
  beforeEach(() => {
    vi.clearAllMocks();
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
    mockGetCurrentTheme.mockReturnValue(createMockTheme({ id: 'underwater' }));
    if (watcherCallback) {
      watcherCallback();
    }

    expect(mockSetupOceanBackground).toHaveBeenCalledWith(canvas);
  });
});
