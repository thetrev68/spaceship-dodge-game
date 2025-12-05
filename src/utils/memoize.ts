/**
 * Generic memoization utilities for development and performance-sensitive paths.
 *
 * These helpers are intentionally lightweight and dependency-free so they can be
 * dropped into hot paths without pulling in a larger library.
 */

/**
 * Memoizes a function using a simple argument serialization cache.
 *
 * Use this when the argument list is small and serializable; falls back to
 * non-cached execution if arguments cannot be stringified.
 *
 * @param fn - Function to memoize
 * @returns A memoized version of the provided function
 * @typeParam TFunc - Function signature being memoized
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
export function memoize<TFunc extends (...args: readonly unknown[]) => unknown>(fn: TFunc): TFunc {
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
/**
 * Memoizes a function with an LRU cache bounded by `limit`.
 *
 * Use this when unbounded caching could grow too large or when the input space
 * is wide but recent results are most valuable.
 *
 * @param fn - Function to memoize
 * @param limit - Maximum number of cached entries (must be positive)
 * @returns A memoized function with LRU eviction
 * @typeParam TFunc - Function signature being memoized
 */
export function memoizeWithLimit<TFunc extends (...args: readonly unknown[]) => unknown>(
  fn: TFunc,
  limit = 100
): TFunc {
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
