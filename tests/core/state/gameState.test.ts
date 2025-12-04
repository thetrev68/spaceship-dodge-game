import { describe, expect, it, beforeEach } from 'vitest';
import {
  gameState,
  score,
  gameLevel,
  playerLives,
  lastObstacleSpawnTime,
  levelStartTime,
  resetGameState,
  addScore,
  loseLife,
  incrementLevel,
} from '@core/state';

describe('game state helpers', () => {
  beforeEach(() => {
    resetGameState();
  });

  it('resets all game state fields', () => {
    gameState.value = 'PLAYING';
    score.value = 42;
    gameLevel.value = 3;
    playerLives.value = 1;
    lastObstacleSpawnTime.value = 99;
    levelStartTime.value = 88;

    resetGameState();

    expect(gameState.value).toBe('START');
    expect(score.value).toBe(0);
    expect(gameLevel.value).toBe(0);
    expect(playerLives.value).toBe(3);
    expect(lastObstacleSpawnTime.value).toBe(0);
    expect(levelStartTime.value).toBe(0);
  });

  it('increments score, level, and clamps lives', () => {
    expect(addScore(10)).toBe(10);
    expect(addScore(5)).toBe(15);
    incrementLevel();
    expect(gameLevel.value).toBe(1);
    expect(loseLife()).toBe(2);
    playerLives.value = 0;
    expect(loseLife()).toBe(0);
  });
});
