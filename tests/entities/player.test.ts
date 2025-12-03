import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { player, powerUps, bullets, gameState } from '@core/state';
import { updatePlayer, setPlayerPosition, firePlayerBullets } from '@entities/player';

describe('Player Entity', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    // Reset player state
    gameState.value = 'PLAYING'; // Required for updates to work
    player.x = 400;
    player.y = 300;
    player.width = 30;
    player.height = 45;
    player.dx = 0;
    player.dy = 0;
    player.overridePosition = null;
    bullets.length = 0;
    powerUps.doubleBlaster.active = false;
    powerUps.shield.active = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('should move player within canvas bounds', () => {
    // Set player movement
    player.dx = 5;
    player.dy = 3;

    // Mock window dimensions
    global.innerWidth = 800;
    global.innerHeight = 600;

    // Update player
    updatePlayer();

    // Verify player moved
    expect(player.x).toBeGreaterThan(400);
    expect(player.y).toBeGreaterThan(300);

    // Verify player stays within bounds
    expect(player.x).toBeLessThan(800 - player.width);
    expect(player.y).toBeLessThan(600 - player.height);
  });

  it('should clamp player position to canvas boundaries', () => {
    // Set player outside bounds
    setPlayerPosition(-100, -100);

    // Verify player is clamped to bounds
    expect(player.x).toBeGreaterThanOrEqual(0);
    expect(player.y).toBeGreaterThanOrEqual(0);

    // Set player beyond right/bottom bounds
    setPlayerPosition(1000, 1000);

    // Verify player is clamped
    expect(player.x).toBeLessThanOrEqual(800 - player.width);
    expect(player.y).toBeLessThanOrEqual(600 - player.height);
  });

  it('should fire bullets', () => {
    // Fire bullets
    firePlayerBullets();

    // Verify bullets were created
    expect(bullets.length).toBeGreaterThan(0);

    // Verify bullets are created at player position
    const firstBullet = bullets[0];
    if (firstBullet) {
      expect(firstBullet.x).toBeCloseTo(player.x + player.width * 0.5, 10);
      expect(firstBullet.y).toBe(player.y);
    }
  });

  it('should fire double bullets when double blaster is active', () => {
    // Activate double blaster
    powerUps.doubleBlaster.active = true;

    // Fire bullets
    firePlayerBullets();

    // Verify two bullets were fired
    expect(bullets.length).toBe(2);

    // Verify bullets are positioned for double blaster
    const bullet1 = bullets[0];
    const bullet2 = bullets[1];
    if (bullet1 && bullet2) {
      expect(bullet1.x).not.toBe(bullet2.x);
    }
  });
});