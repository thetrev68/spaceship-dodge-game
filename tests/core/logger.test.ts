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

  it('handles numeric and fallback level configuration paths', () => {
    logger.setLevel(logger.LogLevel.ERROR);
    debug('game', 'filtered out');
    info('game', 'also filtered');
    expect(logSpy).not.toHaveBeenCalled();

    error('game', 'visible');
    expect(logSpy).toHaveBeenCalledTimes(1);

    logger.setLevel('unknown' as any);
    info('game', 'fallback to DEBUG threshold');
    expect(logSpy).toHaveBeenCalledTimes(2);
  });

  it('creates scoped loggers with category context and timers', () => {
    vi.useFakeTimers();
    const scoped = logger.createLogger('scoped');

    scoped.info('hello scope', { foo: 1 });
    const call = logSpy.mock.calls[0]?.[0] as string;
    expect(call).toContain('[scoped]');

    scoped.debug('debug scope');
    scoped.warn('warn scope');
    scoped.error('error scope');

    const scopedTimer = scoped.timer('work');
    vi.advanceTimersByTime(5);
    const duration = scopedTimer.end();

    expect(duration).toBeGreaterThanOrEqual(5);
    expect(logSpy).toHaveBeenCalledTimes(5);
    vi.useRealTimers();
  });

  it('covers fallback branches via raw log helper', () => {
    const rawLog = (logger as unknown as { __log: (l: number, c: string, m: string) => void })
      .__log;
    rawLog(999, '', 'unknown level');
    rawLog(logger.LogLevel.NONE, 'no-color', 'missing color mapping');

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy.mock.calls[0]?.[0] as string).toMatch(/\[DEBUG\]/);
    expect(logSpy.mock.calls[1]?.[0] as string).toMatch(/\[NONE\]/);
  });

  it('disables logging when initialized under production mode', async () => {
    logSpy.mockRestore();
    vi.resetModules();
    vi.stubEnv('MODE', 'production');

    const prodConsole = vi.spyOn(console, 'log').mockImplementation(() => {});
    const prodModule = await import('@core/logger');

    prodModule.debug('game', 'should not emit');
    prodModule.info('game', 'still disabled');
    expect(prodConsole).not.toHaveBeenCalled();

    prodModule.logger.setEnabled(true);
    prodModule.error('game', 'enabled again');
    expect(prodConsole).toHaveBeenCalledTimes(1);

    prodConsole.mockRestore();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('falls back to development defaults when MODE is missing', async () => {
    logSpy.mockRestore();
    vi.resetModules();
    vi.stubEnv('MODE', undefined as any);

    const devConsole = vi.spyOn(console, 'log').mockImplementation(() => {});
    const devModule = await import('@core/logger');

    devModule.logger.setLevel(devModule.logger.LogLevel.DEBUG);
    devModule.info('', 'no category tag');
    expect(devConsole).toHaveBeenCalled();

    devConsole.mockRestore();
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
