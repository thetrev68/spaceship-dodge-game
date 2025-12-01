/**
 * Generic object pool manager for reusable game entities.
 * @template T
 */
export class ObjectPool {
  /**
   * @param {() => T} factory - Factory to create new items when pool is empty.
   */
  constructor(factory) {
    /** @type {T[]} */
    this.pool = [];
    this.factory = factory;
  }

  /**
   * Acquire an object from the pool, creating a new one if pool is empty
   * @returns {T} An object from the pool or newly created
   */
  acquire() {
    const item = this.pool.length > 0 ? this.pool.pop() : undefined;
    // Type narrowing keeps noUncheckedIndexedAccess happy
    return item !== undefined ? item : this.factory();
  }

  /**
   * Release an object back to the pool for reuse
   * @param {T} obj - The object to return to the pool
   */
  release(obj) {
    this.pool.push(obj);
  }

  /**
   * Clear all objects from the pool
   */
  clear() {
    this.pool.length = 0;
  }

  /**
   * Get current pool size (for debugging/monitoring)
   * @returns {number} Number of objects in the pool
   */
  size() {
    return this.pool.length;
  }
}
