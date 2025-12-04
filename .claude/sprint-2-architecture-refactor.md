# Sprint 2: Architecture Refactoring

## Goal

Eliminate tight coupling, improve modularity, and enhance testability through architectural improvements. This sprint prepares the codebase for achieving 85% test coverage in Sprint 3.

## Prerequisites

- Sprint 1 completed with 50%+ test coverage
- All existing tests passing
- TypeScript strict mode enabled
- Familiarity with dependency injection and event-driven patterns

## Overview

Sprint 2 addresses the critical architectural gaps identified in the transformation plan:

1. **State management** - Split monolithic state into domain-specific modules
2. **Main.ts decomposition** - Break down 140-line initialization into focused modules
3. **Service layer** - Introduce interfaces for dependency injection
4. **Event system** - Decouple modules using event bus pattern

After this refactor, modules will be independently testable, easier to maintain, and follow SOLID principles.

---

## Part 1: State Management Refactor

### Problem Statement

Current `src/core/state.ts` mixes reactive values with entity arrays, has no encapsulation, and allows global mutations from any module. This creates tight coupling and makes testing difficult.

### 1.1 Create Domain-Specific State Modules

**Step 1: Create src/core/state/gameState.ts**

This module manages game flow state (scores, lives, levels, game phase).

```typescript
import { createReactive, type ReactiveValue } from '../reactive';
import type { GameState as GamePhase } from '@/types';

/**
 * Core game state management
 * Contains all reactive values for game flow control
 */

// Game phase state machine
export const gameState = createReactive<GamePhase>('START');

// Score tracking
export const score = createReactive<number>(0);

// Level progression
export const gameLevel = createReactive<number>(1);

// Player health
export const playerLives = createReactive<number>(3);

/**
 * Resets all game state to initial values
 * Called when starting a new game
 */
export function resetGameState(): void {
  gameState.value = 'START';
  score.value = 0;
  gameLevel.value = 1;
  playerLives.value = 3;
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
```

**Step 2: Create src/core/state/entityState.ts**

This module encapsulates entity collections with controlled mutation methods.

```typescript
import type { Asteroid, Bullet, Powerup } from '@/types';

/**
 * Entity state management with encapsulated mutations
 * Prevents direct array manipulation from external modules
 */
class EntityState {
  private _bullets: Bullet[] = [];
  private _obstacles: Asteroid[] = [];
  private _powerups: Powerup[] = [];

  // Read-only getters
  get bullets(): readonly Bullet[] {
    return this._bullets;
  }

  get obstacles(): readonly Asteroid[] {
    return this._obstacles;
  }

  get powerups(): readonly Powerup[] {
    return this._powerups;
  }

  // Bullet management
  addBullet(bullet: Bullet): void {
    if (!bullet) {
      console.warn('Attempted to add invalid bullet');
      return;
    }
    this._bullets.push(bullet);
  }

  removeBullet(index: number): void {
    if (index >= 0 && index < this._bullets.length) {
      // Swap-and-pop for O(1) removal
      this._bullets[index] = this._bullets[this._bullets.length - 1];
      this._bullets.pop();
    }
  }

  clearBullets(): void {
    this._bullets.length = 0;
  }

  // Obstacle management
  addObstacle(obstacle: Asteroid): void {
    if (!obstacle) {
      console.warn('Attempted to add invalid obstacle');
      return;
    }
    this._obstacles.push(obstacle);
  }

  removeObstacle(index: number): void {
    if (index >= 0 && index < this._obstacles.length) {
      this._obstacles[index] = this._obstacles[this._obstacles.length - 1];
      this._obstacles.pop();
    }
  }

  clearObstacles(): void {
    this._obstacles.length = 0;
  }

  // Powerup management
  addPowerup(powerup: Powerup): void {
    if (!powerup) {
      console.warn('Attempted to add invalid powerup');
      return;
    }
    this._powerups.push(powerup);
  }

  removePowerup(index: number): void {
    if (index >= 0 && index < this._powerups.length) {
      this._powerups[index] = this._powerups[this._powerups.length - 1];
      this._powerups.pop();
    }
  }

  clearPowerups(): void {
    this._powerups.length = 0;
  }

  // Bulk operations
  clearAll(): void {
    this.clearBullets();
    this.clearObstacles();
    this.clearPowerups();
  }

  // Access to mutable arrays (use sparingly, prefer add/remove methods)
  getMutableBullets(): Bullet[] {
    return this._bullets;
  }

  getMutableObstacles(): Asteroid[] {
    return this._obstacles;
  }

  getMutablePowerups(): Powerup[] {
    return this._powerups;
  }
}

export const entityState = new EntityState();
```

**Step 3: Create src/core/state/playerState.ts**

This module manages player-specific state and active powerups.

```typescript
import type { Player } from '@/types';
import type { PowerupType } from '@/types';

/**
 * Player state management
 * Tracks player entity and active powerup effects
 */
class PlayerState {
  private _player: Player | null = null;
  private _activePowerups = new Map<PowerupType, number>();

  get player(): Player | null {
    return this._player;
  }

  setPlayer(player: Player | null): void {
    this._player = player;
  }

  // Powerup management
  hasPowerup(type: PowerupType): boolean {
    const expiry = this._activePowerups.get(type);
    if (!expiry) return false;

    // Check if expired
    if (Date.now() > expiry) {
      this._activePowerups.delete(type);
      return false;
    }

    return true;
  }

  addPowerup(type: PowerupType, durationMs: number): void {
    const expiryTime = Date.now() + durationMs;
    this._activePowerups.set(type, expiryTime);
  }

  removePowerup(type: PowerupType): void {
    this._activePowerups.delete(type);
  }

  clearPowerups(): void {
    this._activePowerups.clear();
  }

  getActivePowerups(): PowerupType[] {
    const now = Date.now();
    const active: PowerupType[] = [];

    for (const [type, expiry] of this._activePowerups) {
      if (now <= expiry) {
        active.push(type);
      } else {
        this._activePowerups.delete(type);
      }
    }

    return active;
  }

  getPowerupTimeRemaining(type: PowerupType): number {
    const expiry = this._activePowerups.get(type);
    if (!expiry) return 0;

    const remaining = expiry - Date.now();
    return Math.max(0, remaining);
  }

  reset(): void {
    this._player = null;
    this._activePowerups.clear();
  }
}

export const playerState = new PlayerState();
```

**Step 4: Create src/core/reactive.ts**

Extract the reactive system from state.ts into its own module for reusability.

````typescript
/**
 * Minimal reactive state system
 * Uses ES6 Proxy for transparent reactivity
 */

export type ReactiveValue<T> = {
  value: T;
  watch(callback: (newValue: T, oldValue: T) => void): () => void;
};

type Watcher<T> = (newValue: T, oldValue: T) => void;

/**
 * Creates a reactive value with automatic change notifications
 *
 * @param initialValue - Initial value
 * @returns Reactive value object with watch() method
 *
 * @example
 * ```typescript
 * const count = createReactive(0);
 * count.watch((newVal) => console.log('Count:', newVal));
 * count.value = 5; // Triggers watcher
 * ```
 */
export function createReactive<T>(initialValue: T): ReactiveValue<T> {
  const watchers: Set<Watcher<T>> = new Set();
  let currentValue = initialValue;

  const reactive = {
    get value() {
      return currentValue;
    },
    set value(newValue: T) {
      const oldValue = currentValue;
      currentValue = newValue;

      // Notify all watchers
      watchers.forEach((watcher) => {
        try {
          watcher(newValue, oldValue);
        } catch (err) {
          console.error('Error in reactive watcher:', err);
        }
      });
    },
    watch(callback: Watcher<T>) {
      watchers.add(callback);

      // Return unwatch function
      return () => {
        watchers.delete(callback);
      };
    },
  };

  return reactive;
}
````

**Step 5: Update src/core/state.ts**

Transform the existing state.ts into a barrel export that re-exports from the new modules.

```typescript
/**
 * Unified state management exports
 * Re-exports from domain-specific state modules
 */

// Reactive system
export { createReactive, type ReactiveValue } from './reactive';

// Game state
export {
  gameState,
  score,
  gameLevel,
  playerLives,
  resetGameState,
  addScore,
  loseLife,
  incrementLevel,
} from './state/gameState';

// Entity state
export { entityState } from './state/entityState';

// Player state
export { playerState } from './state/playerState';

// Flow control (kept in this file for backward compatibility)
export const allowSpawning = createReactive<boolean>(false);

// Platform detection (moved from utils/platform.ts for centralization)
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);
```

### 1.2 Migration Strategy

**Update entity modules to use new state API:**

Example for `src/entities/bullet.ts`:

```typescript
// Before:
import { bullets } from '@core/state';
bullets.push(newBullet);

// After:
import { entityState } from '@core/state';
entityState.addBullet(newBullet);
```

Example for `src/entities/asteroid.ts`:

```typescript
// Before:
import { obstacles } from '@core/state';
const index = obstacles.findIndex((o) => !o.active);
obstacles.splice(index, 1);

// After:
import { entityState } from '@core/state';
entityState.removeObstacle(index);
```

**Update game modules:**

```typescript
// Before:
import { score, playerLives } from '@core/state';
score.value += 10;
playerLives.value--;

// After:
import { addScore, loseLife } from '@core/state';
addScore(10);
loseLife();
```

### 1.3 Update Existing Tests

All tests that import from `@core/state` need to be updated to use the new API:

```typescript
// Before:
import { bullets, obstacles } from '@core/state';
bullets.length = 0;
obstacles.push(testAsteroid);

// After:
import { entityState } from '@core/state';
entityState.clearBullets();
entityState.addObstacle(testAsteroid);
```

---

## Part 2: Main.ts Decomposition

### Problem Statement

Current `src/core/main.ts` has 140+ lines handling canvas setup, audio initialization, input setup, UI initialization, and game loop start. This violates single responsibility principle and makes initialization hard to test.

### 2.1 Create Focused Initialization Modules

**Step 1: Create src/core/init/canvasInit.ts**

```typescript
import { getById } from '@utils/dom';
import { log } from '@core/logger';

export interface CanvasSetup {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

/**
 * Initializes the game canvas and 2D rendering context
 *
 * @returns Canvas setup object or null if initialization failed
 */
export function initializeCanvas(): CanvasSetup | null {
  const canvas = getById<HTMLCanvasElement>('gameCanvas');
  if (!canvas) {
    log.error('Canvas element #gameCanvas not found in DOM');
    return null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    log.error('Failed to get 2D rendering context from canvas');
    return null;
  }

  // Set canvas size to viewport
  resizeCanvas(canvas);

  // Listen for window resize
  window.addEventListener('resize', () => resizeCanvas(canvas));

  log.info('Canvas initialized', { width: canvas.width, height: canvas.height });
  return { canvas, ctx };
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
```

**Step 2: Create src/core/init/audioInit.ts**

```typescript
import { forceAudioUnlock, startMusic, setVolume, muteAll } from '@systems/soundManager';
import { loadSettings } from '@ui/settings/settingsManager';
import { log } from '@core/logger';

/**
 * Initializes the audio system with user settings
 *
 * @param userGesture - Whether initialization is triggered by user gesture
 * @returns Promise that resolves when audio is ready
 */
export async function initializeAudio(userGesture: boolean = false): Promise<void> {
  try {
    // Attempt audio unlock if user gesture detected
    if (userGesture) {
      await forceAudioUnlock();
      log.info('Audio unlocked via user gesture');
    }

    // Apply saved settings
    const settings = loadSettings();
    setVolume(settings.volume);

    if (settings.isMuted) {
      muteAll();
    }

    log.info('Audio initialized', { volume: settings.volume, muted: settings.isMuted });
  } catch (err) {
    log.error('Audio initialization failed', err);
    // Non-fatal error, game can continue without audio
  }
}

/**
 * Starts background music if audio is unlocked and not muted
 */
export function startBackgroundMusic(): void {
  try {
    startMusic();
    log.info('Background music started');
  } catch (err) {
    log.warn('Failed to start background music', err);
  }
}
```

**Step 3: Create src/core/init/inputInit.ts**

```typescript
import { isMobile } from '@core/state';
import { initializeInputManager } from '@input/inputManager';
import { initializeMobileControls } from '@input/mobileControls';
import { log } from '@core/logger';

/**
 * Initializes input handling based on platform
 *
 * @param canvas - Canvas element for coordinate mapping
 */
export function initializeInput(canvas: HTMLCanvasElement): void {
  if (isMobile) {
    initializeMobileControls(canvas);
    log.info('Mobile touch controls initialized');
  } else {
    initializeInputManager(canvas);
    log.info('Desktop keyboard/mouse controls initialized');
  }
}
```

**Step 4: Create src/core/init/uiInit.ts**

```typescript
import { initializeOverlays } from '@ui/overlays/overlayManager';
import { initializeAudioControls } from '@ui/controls/audioControls';
import { initializeSettingsUI } from '@ui/settings/settingsUI';
import { initializeScoreDisplay } from '@ui/hud/scoreDisplay';
import { log } from '@core/logger';

/**
 * Initializes all UI components
 */
export function initializeUI(): void {
  initializeOverlays();
  initializeAudioControls();
  initializeSettingsUI();
  initializeScoreDisplay();

  log.info('UI components initialized');
}
```

### 2.2 Refactor src/core/main.ts

Replace the existing main.ts with a clean orchestration:

```typescript
import { initializeCanvas } from './init/canvasInit';
import { initializeAudio, startBackgroundMusic } from './init/audioInit';
import { initializeInput } from './init/inputInit';
import { initializeUI } from './init/uiInit';
import { startGameLoop } from '@game/gameLoop';
import { log } from './logger';

/**
 * Application entry point
 * Orchestrates initialization of all subsystems
 */
async function main() {
  log.info('Spaceship Dodge starting...');

  // 1. Initialize canvas (required for everything else)
  const canvasSetup = initializeCanvas();
  if (!canvasSetup) {
    log.error('Fatal: Canvas initialization failed');
    return;
  }

  const { canvas, ctx } = canvasSetup;

  // 2. Initialize input handling
  initializeInput(canvas);

  // 3. Initialize UI components
  initializeUI();

  // 4. Initialize audio (async, non-blocking)
  await initializeAudio();

  // 5. Start game loop
  startGameLoop(ctx);

  log.info('Spaceship Dodge initialized successfully');
}

// Start the application
main().catch((err) => {
  log.error('Fatal error during initialization', err);
});
```

---

## Part 3: Service Layer Introduction

### Problem Statement

Direct imports of `soundManager`, `poolManager`, `collisionHandler` create hard dependencies that are difficult to mock in tests. We need abstraction via interfaces.

### 3.1 Create Service Interfaces

**Step 1: Create src/services/interfaces/IAudioService.ts**

```typescript
/**
 * Audio service interface
 * Abstracts audio playback for testing and flexibility
 */
export interface IAudioService {
  /**
   * Unlocks audio context (required for mobile browsers)
   */
  unlock(): Promise<void>;

  /**
   * Plays a sound effect by name
   * @param name - Sound identifier (e.g., 'fire', 'break')
   */
  playSound(name: string): void;

  /**
   * Starts background music loop
   */
  startMusic(): void;

  /**
   * Stops background music
   */
  stopMusic(): void;

  /**
   * Sets master volume
   * @param value - Volume level (0.0 to 1.0)
   */
  setVolume(value: number): void;

  /**
   * Mutes all audio
   */
  muteAll(): void;

  /**
   * Unmutes all audio
   */
  unmuteAll(): void;

  /**
   * Checks if audio is currently muted
   */
  isMuted(): boolean;
}
```

**Step 2: Create src/services/interfaces/ICollisionService.ts**

```typescript
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
```

**Step 3: Create src/services/interfaces/IPoolService.ts**

```typescript
/**
 * Object pool service interface
 * Abstracts object pooling for performance
 */
export interface IPoolService<T> {
  /**
   * Acquires an inactive object from the pool
   * @returns Pooled object or null if pool exhausted
   */
  acquire(): T | null;

  /**
   * Returns an object to the pool for reuse
   * @param item - Object to return to pool
   */
  release(item: T): void;

  /**
   * Resets the entire pool
   */
  reset(): void;

  /**
   * Gets current pool statistics
   */
  getStats(): { total: number; active: number; available: number };
}
```

### 3.2 Create Service Provider

**Step 1: Create src/services/ServiceProvider.ts**

```typescript
import type { IAudioService } from './interfaces/IAudioService';
import type { ICollisionService } from './interfaces/ICollisionService';
import type { IPoolService } from './interfaces/IPoolService';
import { SoundManager } from '@systems/soundManager';
import { CollisionHandler } from '@systems/collisionHandler';
import { PoolManager } from '@systems/poolManager';
import { log } from '@core/logger';

/**
 * Service provider (singleton)
 * Manages service instances and allows swapping implementations (e.g., for tests)
 */
class ServiceProvider {
  private static instance: ServiceProvider | null = null;

  public audioService: IAudioService;
  public collisionService: ICollisionService;
  public bulletPool: IPoolService<any>;
  public asteroidPool: IPoolService<any>;

  private constructor() {
    // Initialize with default implementations
    this.audioService = new SoundManager();
    this.collisionService = new CollisionHandler();
    this.bulletPool = new PoolManager(() => this.createBullet());
    this.asteroidPool = new PoolManager(() => this.createAsteroid());

    log.debug('ServiceProvider initialized with default implementations');
  }

  static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }

  /**
   * Swaps audio service implementation (useful for testing)
   */
  setAudioService(service: IAudioService): void {
    this.audioService = service;
    log.debug('Audio service implementation swapped');
  }

  /**
   * Swaps collision service implementation
   */
  setCollisionService(service: ICollisionService): void {
    this.collisionService = service;
    log.debug('Collision service implementation swapped');
  }

  /**
   * Resets all services (useful for tests)
   */
  resetServices(): void {
    this.collisionService.reset();
    this.bulletPool.reset();
    this.asteroidPool.reset();
    log.debug('All services reset');
  }

  // Factory methods for pooled objects
  private createBullet() {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      active: false,
    };
  }

  private createAsteroid() {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      sizeLevel: 0,
      points: 0,
      rotation: 0,
      rotationSpeed: 0,
      active: false,
    };
  }
}

export const services = ServiceProvider.getInstance();
```

**Step 2: Implement IAudioService in SoundManager**

Update `src/systems/soundManager.ts` to implement the interface:

```typescript
import type { IAudioService } from '@services/interfaces/IAudioService';

export class SoundManager implements IAudioService {
  // ... existing implementation ...

  unlock(): Promise<void> {
    return forceAudioUnlock();
  }

  playSound(name: string): void {
    // Existing playSound logic
  }

  startMusic(): void {
    // Existing startMusic logic
  }

  stopMusic(): void {
    // Existing stopMusic logic
  }

  setVolume(value: number): void {
    // Existing setVolume logic
  }

  muteAll(): void {
    // Existing muteAll logic
  }

  unmuteAll(): void {
    // Existing unmuteAll logic
  }

  isMuted(): boolean {
    return isMutedFlag;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
```

### 3.3 Update Service Usage

**Before:**

```typescript
import { playSound } from '@systems/soundManager';
playSound('fire');
```

**After:**

```typescript
import { services } from '@services/ServiceProvider';
services.audioService.playSound('fire');
```

---

## Part 4: Event System for Decoupling

### Problem Statement

Direct function calls between modules create tight coupling. For example, `collisionHandler.ts` directly calls `showScore()` from `scorePopups.ts`. This makes it impossible to test collision logic without the UI layer.

### 4.1 Create Event Bus System

**Step 1: Create src/core/events/EventBus.ts**

```typescript
import { log } from '@core/logger';

type EventHandler<T = any> = (data: T) => void;

/**
 * Event bus for decoupled communication between modules
 * Implements publish-subscribe pattern
 */
class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  /**
   * Registers an event handler
   *
   * @param event - Event name
   * @param handler - Callback function
   * @returns Unsubscribe function
   */
  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    const handlers = this.handlers.get(event)!;
    handlers.push(handler);

    log.debug(`Event handler registered for: ${event}`);

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  /**
   * Unregisters an event handler
   *
   * @param event - Event name
   * @param handler - Callback function to remove
   */
  off<T>(event: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      log.debug(`Event handler unregistered for: ${event}`);
    }
  }

  /**
   * Emits an event to all registered handlers
   *
   * @param event - Event name
   * @param data - Event data payload
   */
  emit<T>(event: string, data: T): void {
    const handlers = this.handlers.get(event);
    if (!handlers || handlers.length === 0) {
      return;
    }

    log.debug(`Event emitted: ${event}`, data);

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        log.error(`Error in event handler for ${event}:`, err);
      }
    });
  }

  /**
   * Clears all handlers for a specific event
   */
  clear(event: string): void {
    this.handlers.delete(event);
  }

  /**
   * Clears all registered handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
```

**Step 2: Create src/core/events/GameEvents.ts**

```typescript
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
  GAME_OVER = 'game:over',
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
```

### 4.2 Update Modules to Use Events

**Example: Collision Handler Emits Events**

Before:

```typescript
// src/systems/collisionHandler.ts
import { showScore } from '@ui/hud/scorePopups';
import { score } from '@core/state';

// When asteroid destroyed
score.value += scoreValue;
showScore(x, y, scoreValue);
```

After:

```typescript
// src/systems/collisionHandler.ts
import { eventBus, GameEvent, type AsteroidDestroyedEvent } from '@core/events';
import { addScore } from '@core/state';

// When asteroid destroyed
const newScore = addScore(scoreValue);
eventBus.emit<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, {
  position: { x, y },
  score: scoreValue,
  size: asteroid.size,
  sizeLevel: asteroid.sizeLevel,
});
```

**Example: Score Popups Subscribe to Events**

```typescript
// src/ui/hud/scorePopups.ts
import { eventBus, GameEvent, type AsteroidDestroyedEvent } from '@core/events';

export function initializeScorePopups(): void {
  eventBus.on<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, (data) => {
    showScore(data.position.x, data.position.y, data.score);
  });
}
```

### 4.3 Event-Driven Architecture Benefits

1. **Loose coupling**: Collision handler doesn't know about score popups
2. **Testability**: Can test collision logic without UI dependencies
3. **Flexibility**: Easy to add new listeners (e.g., achievements, analytics)
4. **Clear contracts**: Typed event payloads ensure data consistency

---

## Part 5: Migration Checklist

### Phase 1: State Refactor (2-4 hours)

- [ ] Create `src/core/reactive.ts`
- [ ] Create `src/core/state/gameState.ts`
- [ ] Create `src/core/state/entityState.ts`
- [ ] Create `src/core/state/playerState.ts`
- [ ] Update `src/core/state.ts` to barrel export
- [ ] Update all imports in entity modules
- [ ] Update all imports in game modules
- [ ] Update all imports in system modules
- [ ] Update test files to use new state API
- [ ] Run tests: `npm run test`
- [ ] Run typecheck: `npm run typecheck`

### Phase 2: Main.ts Decomposition (2-3 hours)

- [ ] Create `src/core/init/canvasInit.ts`
- [ ] Create `src/core/init/audioInit.ts`
- [ ] Create `src/core/init/inputInit.ts`
- [ ] Create `src/core/init/uiInit.ts`
- [ ] Refactor `src/core/main.ts`
- [ ] Test game initialization manually
- [ ] Verify all subsystems work correctly

### Phase 3: Service Layer (3-5 hours)

- [ ] Create `src/services/interfaces/IAudioService.ts`
- [ ] Create `src/services/interfaces/ICollisionService.ts`
- [ ] Create `src/services/interfaces/IPoolService.ts`
- [ ] Create `src/services/ServiceProvider.ts`
- [ ] Update `src/systems/soundManager.ts` to implement interface
- [ ] Update `src/systems/collisionHandler.ts` to implement interface
- [ ] Update `src/systems/poolManager.ts` to implement interface
- [ ] Update all service usage across codebase
- [ ] Create mock service implementations for tests
- [ ] Update tests to use ServiceProvider

### Phase 4: Event System (3-4 hours)

- [ ] Create `src/core/events/EventBus.ts`
- [ ] Create `src/core/events/GameEvents.ts`
- [ ] Update collision handler to emit events
- [ ] Update score system to emit events
- [ ] Update level progression to emit events
- [ ] Update powerup system to emit events
- [ ] Update UI modules to subscribe to events
- [ ] Remove direct function calls between decoupled modules
- [ ] Test event flow manually

### Phase 5: Testing & Validation (2-3 hours)

- [ ] Run full test suite: `npm run test`
- [ ] Verify all tests still pass
- [ ] Run type checking: `npm run typecheck`
- [ ] Run linting: `npm run lint`
- [ ] Manual gameplay testing (15 minutes)
- [ ] Test all game states (start, playing, pause, level up, game over)
- [ ] Test audio controls
- [ ] Test mobile controls (if applicable)
- [ ] Verify no console errors
- [ ] Check performance (60 FPS desktop, 30 FPS mobile)

---

## Success Criteria

✅ **Architecture Goals:**

- State management split into domain-specific modules
- Main.ts reduced from 140+ lines to ~40 lines
- Service layer with interfaces implemented
- Event bus operational with typed events
- All modules independently testable

✅ **Code Quality:**

- All existing tests pass
- No TypeScript errors
- No linting errors
- No runtime errors or warnings

✅ **Functionality:**

- Game plays identically to before refactor
- All features work (movement, shooting, collisions, audio, UI)
- Performance unchanged (60 FPS desktop target)

✅ **Documentation:**

- All new modules have JSDoc comments
- Complex logic explained with inline comments
- README.md updated if architecture changed

---

## Testing the Refactor

### Unit Test Updates

Update existing tests to use new APIs:

```typescript
// Example: Updating collision tests
import { entityState } from '@core/state';
import { services } from '@services/ServiceProvider';

beforeEach(() => {
  entityState.clearAll();
  services.resetServices();
});

it('should detect collisions using service', () => {
  // Create test entities
  entityState.addObstacle(testAsteroid);

  // Check collisions via service
  services.collisionService.checkCollisions();

  // Assert results
  expect(entityState.obstacles.length).toBe(0);
});
```

### Integration Test

Create a comprehensive integration test to verify the refactored architecture:

```typescript
// tests/integration/architectureIntegration.test.ts
describe('Refactored Architecture Integration', () => {
  it('should complete full game flow with new architecture', () => {
    // 1. Initialize services
    // 2. Spawn entities via entityState
    // 3. Trigger collisions via collisionService
    // 4. Verify events emitted
    // 5. Check state updates
  });
});
```

---

## Common Pitfalls to Avoid

### ❌ Don't:

1. **Mix old and new state APIs** - Migrate completely, don't leave mixed usage
2. **Skip updating tests** - Tests must pass after refactor
3. **Forget event cleanup** - Always unsubscribe from events when done
4. **Bypass service layer** - Always use services, not direct imports
5. **Leave console.log statements** - Use the logger system

### ✅ Do:

1. **Migrate incrementally** - One phase at a time
2. **Test after each phase** - Don't accumulate breaking changes
3. **Update documentation** - Keep CLAUDE.md in sync
4. **Verify performance** - Ensure no regressions
5. **Use TypeScript fully** - Leverage type safety

---

## Files to Create

```
src/
├── core/
│   ├── reactive.ts (new)
│   ├── state/
│   │   ├── gameState.ts (new)
│   │   ├── entityState.ts (new)
│   │   └── playerState.ts (new)
│   ├── events/
│   │   ├── EventBus.ts (new)
│   │   └── GameEvents.ts (new)
│   └── init/
│       ├── canvasInit.ts (new)
│       ├── audioInit.ts (new)
│       ├── inputInit.ts (new)
│       └── uiInit.ts (new)
├── services/
│   ├── ServiceProvider.ts (new)
│   └── interfaces/
│       ├── IAudioService.ts (new)
│       ├── ICollisionService.ts (new)
│       └── IPoolService.ts (new)
tests/
└── integration/
    └── architectureIntegration.test.ts (new)
```

---

## Estimated Effort

**12-19 hours total** of focused implementation:

- Phase 1 (State): 2-4 hours
- Phase 2 (Main.ts): 2-3 hours
- Phase 3 (Services): 3-5 hours
- Phase 4 (Events): 3-4 hours
- Phase 5 (Testing): 2-3 hours

---

## Next Steps After Completion

With the architecture refactored:

1. **Sprint 3** will add comprehensive tests to reach 85% coverage
2. **Sprint 4** will focus on code quality and documentation
3. The codebase will be easier to maintain, test, and extend

---

## Validation Before Submitting

Run this checklist before considering Sprint 2 complete:

```bash
# 1. Type checking
npm run typecheck

# 2. Linting
npm run lint

# 3. All tests pass
npm run test:run

# 4. Build succeeds
npm run build

# 5. Manual gameplay test
npm run dev
# Play for 2 minutes, verify:
# - Game starts correctly
# - Movement works
# - Shooting works
# - Collisions work
# - Audio works
# - Level progression works
# - Pause/resume works
# - Game over works
```

If all checks pass, Sprint 2 is complete! 🎉
