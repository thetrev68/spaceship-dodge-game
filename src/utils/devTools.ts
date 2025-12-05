import { DEV_CONFIG } from '@core/constants';
import { log } from '@core/logger';
import { assert, assertInRange, assertNumber, assertPositive } from './assertions';
import { memoize, memoizeWithLimit } from './memoize';
import { profiler } from './profiler';

type DevToolsRegistry = {
  profiler: typeof profiler;
  memoize: typeof memoize;
  memoizeWithLimit: typeof memoizeWithLimit;
  assert: typeof assert;
  assertNumber: typeof assertNumber;
  assertPositive: typeof assertPositive;
  assertInRange: typeof assertInRange;
};

/**
 * Registers dev-only utilities on the global window object when DEBUG_MODE is enabled.
 *
 * This is intentionally gated behind DEV_CONFIG to avoid affecting production bundles
 * while still keeping developer ergonomics high. Tools are exposed as `window.__sdgDevTools`.
 */
export function registerDevTools(): void {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  const tools: DevToolsRegistry = {
    profiler,
    memoize,
    memoizeWithLimit,
    assert,
    assertNumber,
    assertPositive,
    assertInRange,
  };

  const global = window as typeof window & { __sdgDevTools?: DevToolsRegistry };
  global.__sdgDevTools = tools;

  log.info('dev', 'Dev tools available on window.__sdgDevTools (profiler, memoize, assertions)');
}
