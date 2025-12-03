/**
 * Object pool service interface
 * Abstracts object pooling for performance
 */
export interface IPoolService<T> {
  /**
   * Acquires an inactive object from the pool
   * @returns Pooled object or null if pool exhausted
   */
  acquire(): T | null;

  /**
   * Returns an object to the pool for reuse
   * @param item - Object to return to pool
   */
  release(item: T): void;

  /**
   * Resets the entire pool
   */
  reset(): void;

  /**
   * Gets current pool statistics
   */
  getStats(): { total: number; active: number; available: number };
}
