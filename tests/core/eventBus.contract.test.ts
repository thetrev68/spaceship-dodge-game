import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from '@core/events/EventBus';

describe('EventBus contracts', () => {
  beforeEach(() => {
    eventBus.clearAll();
  });

  it('no-ops when emitting without subscribers and supports unsubscribe', () => {
    expect(() => eventBus.emit('missing', { ok: true })).not.toThrow();

    const handler = vi.fn();
    const unsubscribe = eventBus.on('data', handler);
    eventBus.emit('data', { id: 1 });
    expect(handler).toHaveBeenCalledWith({ id: 1 });

    unsubscribe();
    eventBus.emit('data', { id: 2 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('clears specific events and all events via clear/clearAll', () => {
    const a = vi.fn();
    const b = vi.fn();
    eventBus.on('alpha', a);
    eventBus.on('beta', b);

    eventBus.clear('alpha');
    eventBus.emit('alpha', {});
    eventBus.emit('beta', {});

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);

    eventBus.clearAll();
    eventBus.emit('beta', {});
    expect(b).toHaveBeenCalledTimes(1);
  });
});
