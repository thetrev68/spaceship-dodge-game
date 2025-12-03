import { describe, expect, it, beforeEach } from 'vitest';

import { isMobile, setMobileOverride, __platformTestUtils } from '@utils/platform';

describe('platform utils', () => {
  beforeEach(() => {
    setMobileOverride(null);
  });

  it('allows overriding mobile detection', () => {
    setMobileOverride(true);
    expect(isMobile()).toBe(true);
    setMobileOverride(false);
    expect(isMobile()).toBe(false);
  });

  it('falls back to detection when no override', () => {
    setMobileOverride(null);
    expect(typeof isMobile()).toBe('boolean');
    expect(__platformTestUtils.getState()).toBe(isMobile());
  });
});
