import { createReactive } from '../reactive.js';
import type { GameStateValue } from '@types';

/**
 * @fileoverview Core game state management with reactive values.
 *
 * Provides centralized state for game flow control, scoring, and progression.
 * All values are reactive and automatically notify watchers on changes.
 *
 * ## State Machine Flow
 * ```
 * START → PLAYING → PAUSED → PLAYING
 *              ↓           ↗
 *        LEVEL_TRANSITION
 *              ↓
 *          GAME_OVER → START
 * ```
 *
 * @see createReactive - Reactive value implementation
 * @see ADR-001 - Custom reactive state rationale
 */

/**
 * Game phase state machine.
 * Controls game flow and determines active systems.
 *
 * ## States
 * - `'START'` - Initial state, showing start overlay
 * - `'PLAYING'` - Active gameplay (updates and collisions enabled)
 * - `'PAUSED'` - Game loop paused, showing pause overlay
 * - `'LEVEL_TRANSITION'` - Between levels, showing level-up overlay
 * - `'GAME_OVER'` - Player lost all lives, showing game over overlay
 *
 * ## Usage
 * ```typescript
 * // Watch for state changes
 * gameState.watch(() => {
 *   if (gameState.value === 'GAME_OVER') {
 *     showGameOverOverlay();
 *     clearAllEntities();
 *   }
 * });
 *
 * // Transition states
 * gameState.value = 'PLAYING'; // Triggers watchers
 * ```
 */
export const gameState = createReactive<GameStateValue>('START');

/**
 * Player's current score.
 * Automatically updates HUD when changed via reactive watchers.
 *
 * ## Scoring
 * - Large asteroid: 20 points
 * - Medium asteroid: 50 points
 * - Small asteroid: 100 points
 * - Fragment bonus: 150 points (all fragments from parent cleared)
 * - Powerup pickup: 200 points
 *
 * @example
 * ```typescript
 * // Watch for score changes (HUD update)
 * score.watch(() => {
 *   updateScoreDisplay(score.value);
 * });
 *
 * // Update score
 * addScore(50); // Triggers HUD update automatically
 * ```
 */
export const score = createReactive<number>(0);

/**
 * Current game level (0-indexed).
 * Affects asteroid spawn rate and speed scaling.
 *
 * ## Difficulty Scaling
 * - Spawn interval decreases by 70ms per level (capped at 300ms min)
 * - Asteroid speed increases by 0.5 per level (capped at 3.0 max)
 * - Level duration: ~15 seconds each
 *
 * @example
 * ```typescript
 * // Calculate spawn interval with level scaling
 * const spawnInterval = Math.max(
 *   BASE_SPAWN_INTERVAL - (gameLevel.value * 70),
 *   MIN_SPAWN_INTERVAL
 * );
 *
 * // Calculate asteroid speed multiplier
 * const speedMultiplier = Math.min(
 *   1.0 + (gameLevel.value * 0.5),
 *   MAX_SPEED
 * );
 * ```
 */
export const gameLevel = createReactive<number>(0);

/**
 * Player's remaining lives.
 * Game over occurs when reaches 0.
 *
 * ## Lives System
 * - Starting lives: 3
 * - Lost on asteroid collision (unless shield active)
 * - No life gain (keeps games finite)
 * - Displayed as heart icons in HUD
 *
 * @example
 * ```typescript
 * // Watch for game over condition
 * playerLives.watch(() => {
 *   if (playerLives.value === 0) {
 *     gameState.value = 'GAME_OVER';
 *     playSound('gameover');
 *   }
 * });
 *
 * // Lose life on collision
 * if (!hasShield) {
 *   loseLife(); // Triggers watcher
 * }
 * ```
 */
export const playerLives = createReactive<number>(3);

/**
 * Timestamp of last asteroid spawn (milliseconds).
 * Used by spawn logic to enforce spawn interval timing.
 *
 * @example
 * ```typescript
 * const now = Date.now();
 * if (now - lastObstacleSpawnTime.value > spawnInterval) {
 *   spawnAsteroid();
 *   lastObstacleSpawnTime.value = now;
 * }
 * ```
 */
export const lastObstacleSpawnTime = createReactive<number>(0);

/**
 * Timestamp when current level started (milliseconds).
 * Used for level progression timing and gating.
 *
 * @example
 * ```typescript
 * const now = Date.now();
 * const levelDuration = now - levelStartTime.value;
 * if (levelDuration > LEVEL_DURATION_MS && allAsteroidsCleared()) {
 *   incrementLevel();
 *   levelStartTime.value = now;
 * }
 * ```
 */
export const levelStartTime = createReactive<number>(0);

/**
 * Resets all game state reactive values to initial starting values.
 * Called when starting a new game or restarting after game over.
 *
 * ## Reset Values
 * - Game state: `'START'`
 * - Score: `0`
 * - Level: `0`
 * - Lives: `3`
 * - Timers: `0` (spawn and level timing)
 *
 * ## Reactive Updates
 * All value changes trigger their respective watchers, causing:
 * - HUD updates (score, lives, level display)
 * - Overlay state changes
 * - Entity cleanup (via state watchers)
 *
 * @example
 * ```typescript
 * // On game over, show overlay then reset
 * function handleGameOver() {
 *   gameState.value = 'GAME_OVER';
 *   showGameOverOverlay();
 *
 *   // User clicks "Play Again"
 *   resetGameState(); // All values reset, triggers watchers
 *   clearAllEntities();
 *   resetPlayer(canvas.width, canvas.height);
 *   gameState.value = 'PLAYING'; // Start new game
 * }
 * ```
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
 * Increments the player's score by the specified points amount.
 * Automatically triggers HUD score display update via reactive watcher.
 *
 * ## Typical Point Values
 * - 20 pts: Large asteroid destroyed
 * - 50 pts: Medium asteroid destroyed
 * - 100 pts: Small asteroid destroyed
 * - 150 pts: Fragment bonus (all fragments from parent cleared)
 * - 200 pts: Powerup collected
 *
 * @param points - Points to add to current score (typically 10-200)
 * @returns New total score after addition
 *
 * @example
 * ```typescript
 * // Award points for asteroid destruction
 * const outcome = destroyAsteroid(asteroid);
 * const newScore = addScore(asteroid.scoreValue);
 *
 * // Award fragment bonus
 * if (outcome.bonusAwarded) {
 *   addScore(outcome.bonusAmount); // +150 pts
 *   showScorePopup(outcome.bonusPosition, outcome.bonusAmount, 'bonus');
 * }
 * ```
 */
export function addScore(points: number): number {
  score.value += points;
  return score.value;
}

/**
 * Decrements player lives by 1 (clamped to minimum of 0).
 * Triggers game over sequence when lives reach 0.
 *
 * ## Lives System
 * - Starting lives: 3
 * - Lost on asteroid collision (unless shield powerup active)
 * - No life recovery (keeps game sessions finite)
 * - Game over at 0 lives
 *
 * ## Reactive Updates
 * Triggers watchers that:
 * - Update HUD heart icons
 * - Check for game over condition
 * - Play hit sound effect
 * - Show damage flash effect
 *
 * @returns Remaining lives after decrement (0-3)
 *
 * @example
 * ```typescript
 * // On player-asteroid collision
 * function handlePlayerHit() {
 *   if (!playerState.powerUps.shield.active) {
 *     const remaining = loseLife();
 *     playSound('hit');
 *     showDamageFlash();
 *
 *     if (remaining === 0) {
 *       gameState.value = 'GAME_OVER';
 *       playSound('gameover');
 *     }
 *   }
 * }
 * ```
 */
export function loseLife(): number {
  playerLives.value = Math.max(0, playerLives.value - 1);
  return playerLives.value;
}

/**
 * Advances the game to the next level (increments level counter).
 * Triggers difficulty scaling via reactive watchers.
 *
 * ## Level Progression
 * - Called after ~15 seconds per level AND all asteroids cleared (gated)
 * - Increases spawn rate (shorter interval)
 * - Increases asteroid speed
 * - Updates level display in HUD
 *
 * ## Difficulty Scaling
 * Each level increase affects:
 * - Spawn interval: Decreases by 70ms (min 300ms)
 * - Asteroid speed: Increases by 0.5x (max 3.0x)
 *
 * @example
 * ```typescript
 * // In level progression logic
 * const now = Date.now();
 * const levelDuration = now - levelStartTime.value;
 *
 * if (levelDuration > LEVEL_DURATION_MS && allAsteroidsCleared()) {
 *   incrementLevel();
 *   levelStartTime.value = now;
 *   gameState.value = 'LEVEL_TRANSITION';
 *   playSound('levelup');
 *   showLevelUpOverlay(gameLevel.value);
 * }
 * ```
 *
 * @see gameLevel - Current level reactive value
 * @see LEVEL_CONFIG - Difficulty scaling configuration
 */
export function incrementLevel(): void {
  gameLevel.value++;
}
