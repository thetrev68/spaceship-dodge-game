import { debug, error } from '@core/logger.js';

type EventHandler = (data: unknown) => void;

/**
 * Event bus for decoupled communication between modules
 * Implements publish-subscribe pattern
 * @internal
 */
class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  /**
   * Registers an event handler
   *
   * @param event - Event name
   * @param handler - Callback function
   * @returns Unsubscribe function
   */
  on<T>(event: string, handler: (data: T) => void): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    const handlers = this.handlers.get(event)!;
    const wrapped: EventHandler = (payload: unknown) => handler(payload as T);
    (wrapped as { _orig?: (data: T) => void })._orig = handler;
    handlers.push(wrapped);

    debug('event', `Event handler registered for: ${event}`);

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(wrapped);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Unregisters an event handler
   *
   * @param event - Event name
   * @param handler - Callback function to remove
   */
  off<T>(event: string, handler: (data: T) => void): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    const idx = handlers.findIndex((fn) => (fn as { _orig?: (data: T) => void })._orig === handler);
    if (idx !== -1) {
      handlers.splice(idx, 1);
      debug('event', `Event handler unregistered for: ${event}`);
    }
  }

  /**
   * Emits an event to all registered handlers
   *
   * @param event - Event name
   * @param data - Event data payload
   */
  emit<T>(event: string, data: T): void {
    const handlers = this.handlers.get(event);
    if (!handlers || handlers.length === 0) {
      return;
    }

    debug('event', `Event emitted: ${event}`);

    const snapshot = handlers.slice();
    snapshot.forEach((handler) => {
      try {
        (handler as (payload: T) => void)(data);
      } catch (err) {
        error('event', `Error in event handler for ${event}:`, err);
      }
    });
  }

  /**
   * Clears all handlers for a specific event
   */
  clear(event: string): void {
    this.handlers.delete(event);
  }

  /**
   * Clears all registered handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
