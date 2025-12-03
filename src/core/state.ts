/**
 * Unified state management exports
 * Re-exports from domain-specific state modules
 */

import { createReactive } from './reactive.js';
import { entityState } from './state/entityState.js';
import { playerState } from './state/playerState.js';

// Reactive system
export { createReactive, type ReactiveValue } from './reactive.js';

// Game state
export {
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
} from './state/gameState.js';

// Entity state
export { entityState } from './state/entityState.js';

// Player state
export { playerState } from './state/playerState.js';

// Backward compatibility exports for existing callers
export const bullets = entityState.getMutableBullets();
export const obstacles = entityState.getMutableObstacles();
export const powerUps = playerState.powerUps;
export const player = playerState.player;

// Flow control (kept here for backward compatibility)
export const allowSpawning = createReactive<boolean>(true);

// Platform detection (centralized for reuse)
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);
