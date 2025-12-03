import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { debug, error, info, warn, logger } from '@core/logger';

describe('logger utilities', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.reset();
  });

  afterEach(() => {
    logSpy.mockRestore();
    logger.reset();
  });

  it('respects log levels and categories', () => {
    logger.setLevel('DEBUG');
    debug('game', 'debug message');
    expect(logSpy).toHaveBeenCalledTimes(1);

    logger.setLevel('ERROR');
    info('game', 'should be filtered');
    expect(logSpy).toHaveBeenCalledTimes(1);

    logger.setCategory('game', false);
    error('game', 'also filtered');
    expect(logSpy).toHaveBeenCalledTimes(1);

    logger.setCategory('game', true);
    error('game', 'visible error');
    expect(logSpy).toHaveBeenCalledTimes(2);
  });

  it('toggles colors/timestamps and exposes config snapshot', () => {
    logger.setColors(false);
    logger.setTimestamps(false);
    info('audio', 'no color');
    const firstCall = logSpy.mock.calls[0]?.[0] as string;
    expect(firstCall).toMatch(/\[audio\]\[INFO\]/);

    const config = logger.getConfig();
    expect(config.colors).toBe(false);
    expect(config.timestamps).toBe(false);
  });

  it('suppresses logs when disabled then restores via reset', () => {
    logger.setEnabled(false);
    warn('ui', 'hidden');
    expect(logSpy).not.toHaveBeenCalled();

    logger.reset();
    warn('ui', 'visible');
    expect(logSpy).toHaveBeenCalled();
  });

  it('measures timing with timer helper', () => {
    vi.useFakeTimers();
    const timer = logger.timer('render');
    vi.advanceTimersByTime(10);
    const duration = timer.end();
    expect(duration).toBeGreaterThanOrEqual(10);
    expect(logSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
