import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from '@core/events/EventBus.js';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clearAll();
  });

  it('registers and emits to handlers', () => {
    const handler = vi.fn();
    eventBus.on('test:event', handler);
    eventBus.emit('test:event', { foo: 'bar' });
    expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('unregisters handlers', () => {
    const handler = vi.fn();
    const off = eventBus.on('remove:event', handler);
    off();
    eventBus.emit('remove:event', 123);
    expect(handler).not.toHaveBeenCalled();
  });

  it('continues emitting when a handler throws', () => {
    const bad = vi.fn(() => {
      throw new Error('boom');
    });
    const good = vi.fn();
    eventBus.on('safe:event', bad);
    eventBus.on('safe:event', good);
    expect(() => eventBus.emit('safe:event', 'data')).not.toThrow();
    expect(good).toHaveBeenCalledWith('data');
  });
});
