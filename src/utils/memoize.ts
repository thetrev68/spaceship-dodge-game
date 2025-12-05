/**
 * Generic memoization utility
 *
 * Caches function results based on arguments to avoid recalculation.
 * Useful for expensive calculations called frequently with same inputs.
 */

/**
 * @internal
 */
export type Func = (...args: readonly unknown[]) => unknown;

export function memoize<TFunc extends Func>(fn: TFunc): TFunc {
  const cache = new Map<string, ReturnType<TFunc>>();

  return ((...args: Parameters<TFunc>): ReturnType<TFunc> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args) as ReturnType<TFunc>;
    cache.set(key, result);

    return result;
  }) as TFunc;
}

/**
 * Memoize with size limit (LRU cache)
 */
export function memoizeWithLimit<TFunc extends Func>(fn: TFunc, limit = 100): TFunc {
  const cache = new Map<string, ReturnType<TFunc>>();

  return ((...args: Parameters<TFunc>): ReturnType<TFunc> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn(...args) as ReturnType<TFunc>;

    // Evict oldest if at limit
    if (cache.size >= limit) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as TFunc;
}
