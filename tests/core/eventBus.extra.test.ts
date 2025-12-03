import { describe, it, expect, vi, afterEach } from 'vitest';
import { eventBus } from '@core/events/EventBus';

describe('EventBus lifecycle', () => {
  afterEach(() => {
    eventBus.clearAll();
  });

  it('unsubscribes handlers and clears maps', () => {
    const handler = vi.fn();
    const off = eventBus.on('test', handler);
    eventBus.emit('test', 1);
    expect(handler).toHaveBeenCalledWith(1);

    off();
    eventBus.emit('test', 2);
    expect(handler).toHaveBeenCalledTimes(1);

    const second = vi.fn();
    eventBus.on('test', second);
    eventBus.clear('test');
    eventBus.emit('test', 3);
    expect(second).not.toHaveBeenCalled();

    eventBus.on('other', second);
    eventBus.clearAll();
    eventBus.emit('other', 4);
    expect(second).not.toHaveBeenCalled();
  });
});
