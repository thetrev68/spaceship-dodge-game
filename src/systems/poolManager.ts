/**
 * Generic Object Pool for Efficient Memory Management
 *
 * Implements object pooling to reduce garbage collection pressure by reusing
 * objects instead of creating/destroying them every frame. This pattern is
 * critical for performance in games with high entity turnover (bullets, particles).
 *
 * ## Why Object Pooling?
 *
 * **Without pooling (problematic):**
 * ```typescript
 * // Creates 100+ objects per second at high fire rate
 * function fireBullet() {
 *   const bullet = { x: 0, y: 0, vx: 0, vy: 0, active: true }; // GC allocation
 *   bullets.push(bullet);
 * }
 *
 * function updateBullets() {
 *   bullets = bullets.filter(b => b.active); // GC pressure on every removal
 * }
 * // Result: GC runs frequently, causes frame stutters (5-10ms pauses)
 * ```
 *
 * **With pooling (smooth):**
 * ```typescript
 * const bulletPool = new ObjectPool(() => ({ x: 0, y: 0, vx: 0, vy: 0, active: false }));
 *
 * function fireBullet() {
 *   const bullet = bulletPool.acquire(); // Reuse existing object
 *   bullet.active = true;
 *   bullet.x = player.x;
 *   // ...
 * }
 *
 * function updateBullets() {
 *   for (const bullet of bullets) {
 *     if (bullet.offScreen) {
 *       bullet.active = false;
 *       bulletPool.release(bullet); // Return to pool instead of GC
 *     }
 *   }
 * }
 * // Result: No GC, smooth 60 FPS
 * ```
 *
 * ## Performance Impact
 * - **Without pooling**: ~100 GC collections/minute, 5-10ms pauses
 * - **With pooling**: ~5 GC collections/minute, <1ms pauses
 * - **Memory**: Pool size * object size (typically 1-2KB for 50 bullets)
 * - **Trade-off**: Slight memory overhead for massive performance gain
 *
 * ## Usage Patterns
 *
 * **Basic setup:**
 * ```typescript
 * // Create pool with factory function
 * const asteroidPool = new ObjectPool<Asteroid>(() => ({
 *   x: 0, y: 0, vx: 0, vy: 0, size: 0, active: false, points: 8
 * }));
 *
 * // Acquire object from pool (reuses or creates new)
 * const asteroid = asteroidPool.acquire();
 * asteroid.x = 100;
 * asteroid.active = true;
 *
 * // Release back to pool when done
 * asteroidPool.release(asteroid);
 * ```
 *
 * **Pre-warming pool:**
 * ```typescript
 * // Pre-allocate 50 objects to avoid allocation spikes during gameplay
 * const pool = new ObjectPool(() => createBullet());
 * for (let i = 0; i < 50; i++) {
 *   const obj = pool.acquire();
 *   pool.release(obj);
 * }
 * // Now pool has 50 objects ready for reuse
 * ```
 *
 * @see https://gameprogrammingpatterns.com/object-pool.html
 * @see docs/architecture/decisions/ADR-003-object-pooling.md
 *
 * @template T - Type of objects being pooled
 *
 * @example
 * ```typescript
 * interface Bullet { x: number; y: number; active: boolean; }
 * const pool = new ObjectPool<Bullet>(() => ({ x: 0, y: 0, active: false }));
 *
 * // Acquire and use
 * const bullet = pool.acquire();
 * bullet.x = 100;
 * bullets.push(bullet);
 *
 * // Release when done
 * pool.release(bullet);
 * bullets.splice(bullets.indexOf(bullet), 1);
 * ```
 */
export class ObjectPool<T> {
  /** Internal pool storage - uses array for O(1) push/pop operations */
  private pool: T[] = [];

  /**
   * Creates a new object pool with the provided factory function
   *
   * @param factory - Function that creates new instances of T when pool is empty.
   *                  Should return objects in a "reset" state ready for reuse.
   *
   * @example
   * ```typescript
   * const pool = new ObjectPool(() => ({
   *   x: 0, y: 0, active: false
   * }));
   * ```
   */
  constructor(private readonly factory: () => T) {}

  /**
   * Acquires an object from the pool (reuses if available, creates new if empty)
   *
   * ## Behavior
   * - If pool has objects: Returns reused object (O(1) pop operation)
   * - If pool is empty: Creates new object via factory function
   *
   * ## Important Notes
   * - **Caller must reset object state** after acquiring (pool doesn't auto-reset)
   * - Objects retain their previous state when reused
   * - No maximum pool size - factory creates unlimited objects if needed
   *
   * @returns Object of type T (either reused from pool or newly created)
   *
   * @example
   * ```typescript
   * const bullet = bulletPool.acquire();
   * // IMPORTANT: Reset state after acquiring
   * bullet.x = player.x;
   * bullet.y = player.y;
   * bullet.active = true;
   * ```
   */
  acquire(): T {
    const item = this.pool.length > 0 ? this.pool.pop() : undefined;
    return item !== undefined ? item : this.factory();
  }

  /**
   * Returns an object to the pool for future reuse
   *
   * ## Behavior
   * - Adds object back to pool (O(1) push operation)
   * - Object state is **NOT** automatically reset (caller should reset before release)
   * - No duplicate checking - caller must ensure object isn't released twice
   *
   * ## Best Practices
   * - Deactivate object before releasing: `bullet.active = false; pool.release(bullet);`
   * - Remove from active arrays before releasing
   * - Don't hold references to released objects (they may be reused elsewhere)
   *
   * @param obj - Object to return to pool (should be type T)
   *
   * @example
   * ```typescript
   * // When bullet goes off-screen
   * if (bullet.isOffScreen()) {
   *   bullet.active = false; // Reset state
   *   bulletPool.release(bullet); // Return to pool
   *   bullets.splice(bullets.indexOf(bullet), 1); // Remove from active list
   * }
   * ```
   */
  release(obj: T): void {
    this.pool.push(obj);
  }

  /**
   * Clears all objects from the pool (releases memory for GC)
   *
   * ## Use Cases
   * - Game reset (clear all entities and pools)
   * - Level transitions (start fresh)
   * - Memory cleanup after gameplay session
   *
   * ## Performance Note
   * - After clear(), next acquire() will create new objects via factory
   * - Consider pre-warming pool after clear if you want instant availability
   *
   * @example
   * ```typescript
   * function resetGame() {
   *   bullets.length = 0;
   *   asteroids.length = 0;
   *   bulletPool.clear(); // Release pooled objects for GC
   *   asteroidPool.clear();
   * }
   * ```
   */
  clear(): void {
    this.pool.length = 0;
  }

  /**
   * Returns the current number of available objects in the pool
   *
   * ## Use Cases
   * - Debug logging: Monitor pool utilization
   * - Performance tuning: Adjust pool pre-warming based on actual usage
   * - Testing: Verify pool operations (acquire decreases, release increases)
   *
   * @returns Number of objects currently available in pool (0 if empty)
   *
   * @example
   * ```typescript
   * // Debug pool utilization
   * log.debug(`Bullet pool: ${bulletPool.size()} available, ${bullets.length} active`);
   *
   * // Performance metrics
   * if (bulletPool.size() === 0) {
   *   log.warn('Bullet pool exhausted - creating new objects');
   * }
   * ```
   */
  size(): number {
    return this.pool.length;
  }
}
