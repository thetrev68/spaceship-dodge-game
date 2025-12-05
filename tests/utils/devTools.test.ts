import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('devTools register', () => {
  beforeEach(() => {
    vi.resetModules();
    // clear existing registration
    // @ts-expect-error testing window augmentation
    delete window.__sdgDevTools;
  });

  it('skips registration when DEBUG_MODE is false', async () => {
    // Mock gameConstants with DEBUG_MODE = false
    vi.doMock('@core/gameConstants.js', () => ({
      DEV_CONFIG: { DEBUG_MODE: false },
    }));

    // Mock logger
    const mockInfo = vi.fn();
    vi.doMock('@core/logger', () => ({
      log: { info: mockInfo },
    }));

    const { registerDevTools } = await import('@utils/devTools.js');
    registerDevTools();

    // @ts-expect-error testing window augmentation
    expect(window.__sdgDevTools).toBeUndefined();
  });

  it('attaches tools to window when DEBUG_MODE is true', async () => {
    // Mock gameConstants with DEBUG_MODE = true
    vi.doMock('@core/gameConstants.js', () => ({
      DEV_CONFIG: { DEBUG_MODE: true },
    }));

    // Mock logger
    const mockInfo = vi.fn();
    vi.doMock('@core/logger', () => ({
      log: { info: mockInfo },
    }));

    const { registerDevTools } = await import('@utils/devTools.js');
    const { log } = await import('@core/logger');

    registerDevTools();

    // @ts-expect-error testing window augmentation
    expect(window.__sdgDevTools?.memoize).toBeInstanceOf(Function);
    // @ts-expect-error testing window augmentation
    expect(window.__sdgDevTools?.assert).toBeInstanceOf(Function);
    expect(log.info).toHaveBeenCalled();
  });
});
