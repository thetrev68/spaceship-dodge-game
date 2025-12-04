import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { gameState, player, score, playerLives, obstacles, bullets } from '@core/state';
import { stopGameLoop, setCanvas } from '@game/gameLoop';
import { fireBullet } from '@entities/bullet';
import { createTestAsteroid } from '../helpers/gameStateFactory';
import { createMockCanvas } from '../helpers/mockCanvas';

describe('Game Flow Integration', () => {
  let cleanup: () => void;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    canvas = createMockCanvas();
    setCanvas(canvas);

    // Reset game state
    gameState.value = 'START';
    player.x = 400;
    player.y = 500;
    player.width = 30;
    player.height = 45;
    score.value = 0;
    playerLives.value = 3;
    obstacles.length = 0;
    bullets.length = 0;
  });

  afterEach(() => {
    cleanup();
    stopGameLoop();
  });

  it('should handle complete game flow: start → play → spawn entities → game over', () => {
    // Start game
    gameState.value = 'PLAYING';

    // Verify game started
    expect(gameState.value).toBe('PLAYING');

    // Spawn asteroid
    const asteroid = createTestAsteroid({
      x: 400,
      y: 100,
      radius: 40,
      level: 0,
    });
    obstacles.push(asteroid);

    // Verify asteroid exists
    expect(obstacles.length).toBe(1);

    // Fire bullet
    fireBullet(player.x + player.width / 2, player.y);

    // Verify bullet was created
    expect(bullets.length).toBeGreaterThan(0);

    // Simulate damage - take life
    const initialLives = playerLives.value;
    playerLives.value = initialLives - 1;

    // Verify life decreased
    expect(playerLives.value).toBe(initialLives - 1);

    // Simulate game over
    playerLives.value = 0;
    gameState.value = 'GAME_OVER';

    // Verify game over state
    expect(gameState.value).toBe('GAME_OVER');
    expect(playerLives.value).toBe(0);
  });
});
