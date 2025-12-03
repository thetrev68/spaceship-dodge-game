import { createReactive } from '../reactive.js';
import type { GameStateValue } from '@types';

/**
 * Core game state management
 * Contains all reactive values for game flow control
 */

// Game phase state machine
export const gameState = createReactive<GameStateValue>('START');

// Score tracking
export const score = createReactive<number>(0);

// Level progression (0-indexed in current gameplay)
export const gameLevel = createReactive<number>(0);

// Player health
export const playerLives = createReactive<number>(3);

// Timers used by flow manager
export const lastObstacleSpawnTime = createReactive<number>(0);
export const levelStartTime = createReactive<number>(0);

/**
 * Resets all game state to initial values
 * Called when starting a new game
 */
export function resetGameState(): void {
  gameState.value = 'START';
  score.value = 0;
  gameLevel.value = 0;
  playerLives.value = 3;
  lastObstacleSpawnTime.value = 0;
  levelStartTime.value = 0;
}

/**
 * Increments score and returns new value
 */
export function addScore(points: number): number {
  score.value += points;
  return score.value;
}

/**
 * Decrements lives and returns remaining
 */
export function loseLife(): number {
  playerLives.value = Math.max(0, playerLives.value - 1);
  return playerLives.value;
}

/**
 * Advances to next level
 */
export function incrementLevel(): void {
  gameLevel.value++;
}
