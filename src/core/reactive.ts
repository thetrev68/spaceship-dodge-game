/**
 * Minimal reactive state system
 * Uses ES6 Proxy for transparent reactivity
 */

export type ReactiveValue<T> = {
  value: T;
  watch(callback: (newValue: T, oldValue: T) => void): () => void;
};

type Watcher<T> = (newValue: T, oldValue: T) => void;

/**
 * Creates a reactive value with automatic change notifications
 *
 * @param initialValue - Initial value
 * @returns Reactive value object with watch() method
 */
export function createReactive<T>(initialValue: T): ReactiveValue<T> {
  const watchers: Set<Watcher<T>> = new Set();
  let currentValue = initialValue;

  const reactive = {
    get value() {
      return currentValue;
    },
    set value(newValue: T) {
      const oldValue = currentValue;
      currentValue = newValue;

      watchers.forEach(watcher => {
        try {
          watcher(newValue, oldValue);
        } catch (err) {
          console.error('Error in reactive watcher:', err);
        }
      });
    },
    watch(callback: Watcher<T>) {
      watchers.add(callback);

      // Return unwatch function
      return () => {
        watchers.delete(callback);
      };
    }
  };

  return reactive;
}
