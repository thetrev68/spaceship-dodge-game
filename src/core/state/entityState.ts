import type { Asteroid, Bullet } from '@types';
import { warn } from '@core/logger.js';

/**
 * Entity state management with encapsulated mutations
 * Prevents direct array manipulation from external modules
 * @internal
 */
export class EntityState {
  private _bullets: Bullet[] = [];
  private _obstacles: Asteroid[] = [];

  // Read-only getters
  get bullets(): readonly Bullet[] {
    return this._bullets;
  }

  get obstacles(): readonly Asteroid[] {
    return this._obstacles;
  }

  // Bullet management
  addBullet(bullet: Bullet): void {
    if (!bullet) {
      warn('entity', 'Attempted to add invalid bullet');
      return;
    }
    this._bullets.push(bullet);
  }

  removeBullet(index: number): void {
    if (index >= 0 && index < this._bullets.length) {
      const lastIndex = this._bullets.length - 1;
      if (lastIndex < 0) return;
      const lastBullet = this._bullets[lastIndex];
      if (!lastBullet) {
        this._bullets.pop();
        return;
      }
      if (index !== lastIndex) {
        this._bullets[index] = lastBullet;
      }
      this._bullets.pop();
    }
  }

  clearBullets(): void {
    this._bullets.length = 0;
  }

  // Obstacle management
  addObstacle(obstacle: Asteroid): void {
    if (!obstacle) {
      warn('entity', 'Attempted to add invalid obstacle');
      return;
    }
    this._obstacles.push(obstacle);
  }

  removeObstacle(index: number): void {
    if (index >= 0 && index < this._obstacles.length) {
      const lastIndex = this._obstacles.length - 1;
      if (lastIndex < 0) return;
      const lastObstacle = this._obstacles[lastIndex];
      if (!lastObstacle) {
        this._obstacles.pop();
        return;
      }
      if (index !== lastIndex) {
        this._obstacles[index] = lastObstacle;
      }
      this._obstacles.pop();
    }
  }

  clearObstacles(): void {
    this._obstacles.length = 0;
  }

  // Bulk operations
  clearAll(): void {
    this.clearBullets();
    this.clearObstacles();
  }

  // Access to mutable arrays (use sparingly, prefer add/remove methods)
  getMutableBullets(): Bullet[] {
    return this._bullets;
  }

  getMutableObstacles(): Asteroid[] {
    return this._obstacles;
  }
}

export const entityState = new EntityState();
