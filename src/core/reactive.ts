/**
 * @module core/reactive
 * Minimal Reactive State System
 *
 * Provides observable values with automatic change notifications to watchers.
 * Custom implementation chosen over libraries (MobX, Zustand) for simplicity.
 *
 * ## Design Decision: Why Custom Implementation?
 *
 * **Options Considered:**
 * 1. **MobX** - 50KB+, overkill for 5 reactive values
 * 2. **Zustand** - Async-first, doesn't fit synchronous game loop
 * 3. **Custom** - 50 lines, zero dependencies, full control
 *
 * **Chose custom implementation because:**
 * - Game state is simple: 5 primitive reactive values, no nested objects
 * - No need for computed values or complex dependency tracking
 * - Zero dependencies = smaller bundle (saves ~50KB), faster load
 * - Full control over notification timing (synchronous updates match game loop)
 * - No learning curve for contributors
 *
 * ## Trade-offs
 *
 * **Pros:**
 * - Lightweight (~50 lines of code)
 * - Fast (no batching overhead)
 * - Simple mental model (value changes -> watchers called immediately)
 * - Zero dependencies
 *
 * **Cons:**
 * - No computed values (must manually derive)
 * - No batched updates (each change triggers watchers)
 * - No time-travel debugging (no state history)
 * - No React/Vue integration (fine for vanilla TS game)
 *
 * ## Performance Characteristics
 * - Value read: O(1) - direct property access
 * - Value write: O(n) where n = number of watchers (typically 1-3)
 * - Memory: ~100 bytes per reactive value
 *
 * @see docs/architecture/decisions/ADR-001-custom-reactive-state.md
 *
 * @example
 * ```typescript
 * // Create reactive value
 * const score = createReactive(0);
 *
 * // Watch for changes
 * const unwatch = score.watch((newVal, oldVal) => {
 *   console.log(`Score changed from ${oldVal} to ${newVal}`);
 * });
 *
 * // Trigger watcher immediately (synchronous)
 * score.value = 100;  // Logs: "Score changed from 0 to 100"
 *
 * // Cleanup
 * unwatch(); // Remove watcher
 * ```
 */

/**
 * Reactive value interface with getter/setter and watch method
 * @template T - Type of the value being stored
 */
type ReactiveValue<T> = {
  /** Current value (reading is O(1), writing triggers watchers) */
  value: T;

  /**
   * Register a watcher function to be called when value changes
   * @param callback - Function invoked immediately when value changes
   * @returns Cleanup function to remove watcher
   */
  watch(callback: (newValue: T, oldValue: T) => void): () => void;
};

/**
 * Watcher function type
 * @template T - Type of value being watched
 */
type Watcher<T> = (newValue: T, oldValue: T) => void;

/**
 * Creates a reactive value that notifies watchers when changed
 *
 * ## Implementation Details
 * - Uses closure to store watchers Set and current value
 * - Getter/setter pattern triggers notifications on write
 * - Try/catch around watcher invocations prevents one bad watcher from breaking others
 * - Synchronous notification (no batching delay)
 *
 * ## Usage Pattern
 * Reactive values are typically created at module level and exported:
 * ```typescript
 * // In state module
 * export const score = createReactive(0);
 * export const gameLevel = createReactive(1);
 *
 * // In HUD module
 * import { score } from '@core/state';
 * score.watch((newScore) => {
 *   scoreElement.textContent = `Score: ${newScore}`;
 * });
 * ```
 *
 * @template T - Type of value to make reactive
 * @param initialValue - Starting value
 * @returns ReactiveValue with .value property and .watch() method
 *
 * @example
 * ```typescript
 * const lives = createReactive(3);
 * lives.watch((newLives, oldLives) => {
 *   if (newLives < oldLives) {
 *     console.log(`Lost a life! ${newLives} remaining`);
 *   }
 * });
 * lives.value = 2;  // Logs: "Lost a life! 2 remaining"
 * ```
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

      // Notify all watchers synchronously
      // This is intentional - game loop needs immediate updates
      watchers.forEach((watcher) => {
        try {
          watcher(newValue, oldValue);
        } catch (err) {
          // Prevent one bad watcher from breaking others
          console.error('Error in reactive watcher:', err);
        }
      });
    },
    watch(callback: Watcher<T>) {
      watchers.add(callback);

      // Return cleanup function to remove watcher
      return () => {
        watchers.delete(callback);
      };
    },
  };

  return reactive;
}
