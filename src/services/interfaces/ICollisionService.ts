/**
 * Collision detection service interface
 * Abstracts collision checking logic
 */
export interface ICollisionService {
  /**
   * Performs collision detection for all active entities
   * Should be called once per frame after entity updates
   */
  checkCollisions(): void;

  /**
   * Resets collision state (e.g., clears spatial grid)
   */
  reset(): void;
}
