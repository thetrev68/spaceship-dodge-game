import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@core/logger', () => {
  const info = vi.fn();
  return { log: { info } };
});

describe('devTools register', () => {
  beforeEach(() => {
    vi.resetModules();
    // clear existing registration
    // @ts-expect-error testing window augmentation
    delete window.__sdgDevTools;
  });

  it('skips registration when DEBUG_MODE is false', async () => {
    const { DEV_CONFIG } = await import('@core/gameConstants.js');
    const { registerDevTools } = await import('@utils/devTools.js');
    DEV_CONFIG.DEBUG_MODE = false;

    registerDevTools();

    // @ts-expect-error testing window augmentation
    expect(window.__sdgDevTools).toBeUndefined();
  });

  it('attaches tools to window when DEBUG_MODE is true', async () => {
    const { DEV_CONFIG } = await import('@core/gameConstants.js');
    const { registerDevTools } = await import('@utils/devTools.js');
    const { log } = await import('@core/logger');

    DEV_CONFIG.DEBUG_MODE = true;
    registerDevTools();

    // @ts-expect-error testing window augmentation
    expect(window.__sdgDevTools?.memoize).toBeInstanceOf(Function);
    // @ts-expect-error testing window augmentation
    expect(window.__sdgDevTools?.assert).toBeInstanceOf(Function);
    expect(log.info).toHaveBeenCalled();

    DEV_CONFIG.DEBUG_MODE = false; // cleanup for other tests
  });
});
