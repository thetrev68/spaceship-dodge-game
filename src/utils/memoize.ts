/**
 * Generic memoization utility
 *
 * Caches function results based on arguments to avoid recalculation.
 * Useful for expensive calculations called frequently with same inputs.
 */

/**
 * @internal
 */
type Func = (...args: readonly unknown[]) => unknown;

/**
 * Memoizes a function to cache results based on arguments.
 *
 * Uses JSON.stringify to generate cache keys from arguments. Falls back to
 * non-cached execution if arguments contain circular references or other
 * non-serializable values. Note that argument order affects caching, and
 * object keys are not sorted, so equivalent objects with different key orders
 * will not match.
 *
 * @param fn - The function to memoize
 * @returns The memoized function with the same signature
 *
 * @example
 * ```typescript
 * const expensiveCalc = (x: number, y: number) => x * y + Math.sqrt(x);
 * const memoizedCalc = memoize(expensiveCalc);
 *
 * console.log(memoizedCalc(3, 4)); // Computes and caches: 15
 * console.log(memoizedCalc(3, 4)); // Returns cached: 15
 * ```
 */
export function memoize<TFunc extends Func>(fn: TFunc): TFunc {
  const cache = new Map<string, ReturnType<TFunc>>();

  return ((...args: Parameters<TFunc>): ReturnType<TFunc> => {
    let key: string;
    try {
      key = JSON.stringify(args);
    } catch {
      // Fallback to non-cached execution for non-serializable args
      return fn(...args) as ReturnType<TFunc>;
    }

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args) as ReturnType<TFunc>;
    cache.set(key, result);

    return result;
  }) as TFunc;
}

/**
 * Memoizes a function with a size-limited LRU cache.
 *
 * @param fn - The function to memoize
 * @param limit - Maximum number of cached results (must be a positive integer)
 * @returns The memoized function with LRU cache eviction
 *
 * @example
 * ```typescript
 * const fibonacci = (n: number): number => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);
 * const memoizedFib = memoizeWithLimit(fibonacci, 50);
 *
 * console.log(memoizedFib(10)); // Computes and caches
 * console.log(memoizedFib(10)); // Returns cached result
 * ```
 */
export function memoizeWithLimit<TFunc extends Func>(fn: TFunc, limit = 100): TFunc {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError(`Limit must be a positive integer, got ${limit}`);
  }

  const cache = new Map<string, ReturnType<TFunc>>();

  return ((...args: Parameters<TFunc>): ReturnType<TFunc> => {
    let key: string;
    try {
      key = JSON.stringify(args);
    } catch {
      // Fallback to non-cached execution for non-serializable args
      return fn(...args) as ReturnType<TFunc>;
    }

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
