/**
 * Game event definitions
 * Central registry of all game events with typed payloads
 */

export enum GameEvent {
  // Asteroid events
  ASTEROID_DESTROYED = 'asteroid:destroyed',
  ASTEROID_SPAWNED = 'asteroid:spawned',
  ASTEROID_FRAGMENTED = 'asteroid:fragmented',

  // Player events
  PLAYER_HIT = 'player:hit',
  PLAYER_DIED = 'player:died',
  PLAYER_FIRED = 'player:fired',

  // Level events
  LEVEL_UP = 'level:up',
  LEVEL_TRANSITION_START = 'level:transitionStart',
  LEVEL_TRANSITION_END = 'level:transitionEnd',

  // Powerup events
  POWERUP_COLLECTED = 'powerup:collected',
  POWERUP_SPAWNED = 'powerup:spawned',
  POWERUP_EXPIRED = 'powerup:expired',

  // Score events
  SCORE_CHANGED = 'score:changed',
  BONUS_AWARDED = 'bonus:awarded',

  // Game state events
  GAME_STARTED = 'game:started',
  GAME_PAUSED = 'game:paused',
  GAME_RESUMED = 'game:resumed',
  GAME_OVER = 'game:over'
}

// Event payload types
export type AsteroidDestroyedEvent = {
  position: { x: number; y: number };
  score: number;
  size: number;
  sizeLevel: number;
};

export type AsteroidFragmentedEvent = {
  position: { x: number; y: number };
  fragmentCount: number;
  parentSize: number;
};

export type PlayerHitEvent = {
  livesRemaining: number;
  invulnerable: boolean;
};

export type PlayerDiedEvent = {
  finalScore: number;
  level: number;
};

export type LevelUpEvent = {
  newLevel: number;
  difficulty: number;
};

export type PowerupCollectedEvent = {
  type: 'shield' | 'doubleBlaster';
  duration: number;
  position: { x: number; y: number };
};

export type PowerupExpiredEvent = {
  type: 'shield' | 'doubleBlaster';
};

export type ScoreChangedEvent = {
  oldScore: number;
  newScore: number;
  delta: number;
};

export type BonusAwardedEvent = {
  bonusType: string;
  bonusAmount: number;
  position: { x: number; y: number };
};
