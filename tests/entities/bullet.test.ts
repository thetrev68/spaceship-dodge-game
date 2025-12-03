import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { bullets } from '@core/state';
import { updateBullets, fireBullet, clearAllBullets } from '@entities/bullet';

describe('Bullet Entity', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    // Clear bullets
    clearAllBullets();
  });

  afterEach(() => {
    cleanup();
  });

  it('should fire bullets using object pooling', () => {
    // Fire a bullet
    fireBullet(400, 300);

    // Verify bullet was created
    expect(bullets.length).toBe(1);

    // Verify bullet properties
    const firstBullet = bullets[0];
    if (firstBullet) {
      expect(firstBullet.x).toBe(400);
      expect(firstBullet.y).toBe(300);
      expect(firstBullet.dy).toBeLessThan(0); // Moving upward
    }
  });

  it('should move bullets at correct velocity', () => {
    // Fire a bullet
    fireBullet(400, 300);

    // Get initial position
    const initialY = bullets[0]?.y || 0;

    // Update bullets
    updateBullets();

    // Verify bullet moved upward
    const firstBullet = bullets[0];
    if (firstBullet) {
      expect(firstBullet.y).toBeLessThan(initialY);
    }
  });

  it('should remove out-of-bounds bullets', () => {
    // Create bullet at top of screen
    fireBullet(400, -10);

    // Update bullets (should remove)
    updateBullets();

    // Verify bullet was removed
    expect(bullets.length).toBe(0);
  });

  it('should clear all bullets', () => {
    // Fire multiple bullets
    fireBullet(400, 300);
    fireBullet(450, 300);
    fireBullet(350, 300);

    // Verify bullets exist
    expect(bullets.length).toBe(3);

    // Clear all bullets
    clearAllBullets();

    // Verify all bullets removed
    expect(bullets.length).toBe(0);
  });
});