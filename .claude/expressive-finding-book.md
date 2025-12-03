# World-Class Codebase Transformation Plan
## Spaceship Dodge Game - Quality Excellence Initiative

---

## Executive Summary

This plan transforms the spaceship-dodge-game from a well-structured TypeScript game into a **world-class showcase project** demonstrating professional software engineering excellence. The current codebase scores **7.2/10** overall. This plan targets **9.5/10** through systematic improvements across architecture, testing, documentation, tooling, and code quality.

**Current Strengths:**
- Strong domain-driven design with clear module boundaries
- Comprehensive TypeScript usage with strict mode (no `any` types)
- Excellent high-level documentation (CLAUDE.md)
- Modern build tooling (Vite, Vitest, ESLint 9)

**Critical Gaps:**
- **Test coverage: 3/10** - Only 8 tests; core game systems untested
- **Architecture coupling** - 140-line main.ts initialization, global state mutations
- **Documentation depth** - Complex algorithms lack inline explanations
- **No CI/CD pipeline** - Manual deployment, no automated quality gates

---

## Phase 1: Testing Infrastructure (Priority: CRITICAL)
**Goal:** Achieve 85%+ test coverage with comprehensive unit, integration, and E2E tests

### 1.1 Testing Foundation Setup

**Create Test Utilities and Helpers:**
- `tests/helpers/mockCanvas.ts` - Mock canvas/2D context for entity rendering tests
- `tests/helpers/mockAudio.ts` - Mock Web Audio API for soundManager tests
- `tests/helpers/gameStateFactory.ts` - Factory functions for test state setup
- `tests/helpers/testUtils.ts` - Common assertions and matchers

**Configure Coverage Reporting:**
- Add coverage thresholds to `vitest.config.ts`:
  ```typescript
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85
    }
  }
  ```
- Add `npm run test:coverage` script

### 1.2 Core Game Systems Tests (18 test files, ~150 tests)

**Game Loop Tests** (`tests/game/gameLoop.test.ts`):
- Frame rate throttling (60 FPS desktop, 30 FPS mobile)
- Accumulator pattern with TIME_STEP
- Pause state handling (no updates when paused)
- Spawn interval calculations per level
- Frame skipping on mobile (render every 2nd frame)
- Integration test: Full loop cycle from update to render

**Game State Machine Tests** (`tests/game/gameStateManager.test.ts`):
- All state transitions (START → PLAYING → PAUSED → LEVEL_TRANSITION → GAME_OVER)
- `pauseGame()` / `unpauseGame()` toggle behavior
- `resetGame()` state cleanup verification
- `handlePlayerHit()` lives decrement and game-over trigger
- Invalid transition rejection (e.g., GAME_OVER → PAUSED)

**Level Flow Tests** (`tests/game/flowManager.test.ts`):
- Spawn gating: `allowSpawning` toggles during transitions
- Level-up timing (15 second intervals)
- Screen clear detection before level advance
- `waitForScreenClear()` obstacle polling logic
- Difficulty scaling: spawn interval and speed progression

**Collision Detection Tests** (`tests/systems/collisionHandler.test.ts`):
- Spatial grid cell assignment for entities
- Player-asteroid collision detection
- Bullet-asteroid collision with fragmentation
- Player-powerup collision and pickup
- Edge cases: overlapping entities, out-of-bounds positions
- Performance test: 1000+ entities without frame drop

**Sound Manager Tests** (`tests/systems/soundManager.test.ts`):
- Audio unlock flow with gesture simulation
- `startMusic()` BGM playback
- `playSound()` SFX cloning and playback
- Volume control (0-1 range validation)
- Mute/unmute state persistence
- Error handling: missing audio files, locked audio context

**Render Manager Tests** (`tests/systems/renderManager.test.ts`):
- `renderAll()` orchestration order (starfield → entities → HUD)
- Canvas clearing between frames
- Conditional rendering based on game state
- Draw call verification for each entity type
- Performance: render time < 16ms budget

### 1.3 Entity Tests (6 test files, ~80 tests)

**Player Tests** (`tests/entities/player.test.ts`):
- Movement within canvas bounds
- `fireBullet()` cooldown enforcement
- Bullet direction vector calculation
- Shield visual indicator rendering
- Double blaster firing pattern (2 bullets)
- Invulnerability state during shield

**Asteroid Tests** (`tests/entities/asteroid.test.ts`):
- `spawnAsteroid()` pooling behavior
- `updateAsteroids()` position updates
- Fragmentation logic: 2-3 smaller pieces on hit
- Fragment velocity inheritance + offset
- Screen wrapping at boundaries
- Size-based scoring (large: 10, medium: 25, small: 50)

**Bullet Tests** (`tests/entities/bullet.test.ts`):
- `fireBullet()` pooling and reuse
- `updateBullets()` velocity application
- Bullet lifespan and auto-removal
- Out-of-bounds culling
- Pool exhaustion handling

**Powerup Tests** (`tests/entities/powerup.test.ts`):
- `spawnPowerup()` random type selection
- Fall speed and Y-axis movement
- Collection detection and removal
- `activatePowerup()` effect application
- Timer expiration and cleanup
- HUD indicator updates

### 1.4 UI Component Tests (8 test files, ~60 tests)

**Overlay Manager Tests** (`tests/ui/overlays/overlayManager.test.ts`):
- `showOverlay()` / `hideOverlay()` visibility toggling
- Accessibility: focus trap activation, ARIA live regions
- Overlay text content injection
- Resume button event wiring
- Multiple overlay management (only one visible at a time)

**HUD Tests** (`tests/ui/hud/scoreDisplay.test.ts`, `scorePopups.test.ts`, `powerupHUD.test.ts`):
- Score display updates on reactive state change
- Lives and level display rendering
- Floating score popup animations
- Powerup timer countdown visuals
- Layout positioning (top-left, top-right)

**Settings Tests** (`tests/ui/settings/settingsManager.test.ts`, `settingsUI.test.ts`):
- `loadSettings()` / `saveSettings()` localStorage persistence
- Default settings fallback
- Settings UI volume slider synchronization
- Mobile visibility toggle persistence

**Audio Controls Tests** (`tests/ui/controls/audioControls.test.ts`):
- Volume slider value binding
- Mute button toggle behavior
- Visual state updates (muted icon)

### 1.5 Input System Tests (2 test files, ~30 tests)

**Input Manager Tests** (`tests/input/inputManager.test.ts`):
- Keyboard event routing (WASD, arrows, spacebar, P key)
- Mouse position tracking and player movement
- Mouse click firing
- Fire rate cooldown enforcement
- Input state cleanup on game state changes

**Mobile Controls Tests** (`tests/input/mobileControls.test.ts`):
- Touch drag player movement
- Tap-to-shoot firing
- Touch pause button
- Multi-touch handling
- Overlay interaction blocking

### 1.6 Integration and E2E Tests (4 test files, ~25 tests)

**Full Game Flow Integration** (`tests/integration/gameFlow.test.ts`):
- Complete game session: start → play → level-up → game-over
- Asteroid spawning and clearing across levels
- Score accumulation and lives depletion
- Powerup spawn and collection
- Audio playback throughout lifecycle

**Performance Tests** (`tests/integration/performance.test.ts`):
- Frame rate stability under load (100+ asteroids)
- Memory leak detection (10 minute session)
- Garbage collection pressure measurement
- Pool allocation efficiency

**Accessibility Tests** (`tests/integration/accessibility.test.ts`):
- Keyboard navigation through overlays
- Screen reader announcements (ARIA live regions)
- Focus management in pause/unpause
- Color contrast verification

**Cross-Browser Compatibility** (`tests/e2e/compatibility.test.ts`):
- Canvas rendering across Chrome, Firefox, Safari
- Audio unlock on mobile browsers
- Touch event handling on iOS/Android
- Viewport resizing behavior

### 1.7 Test Scripts and CI Integration

**Add npm scripts:**
```json
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:ui": "vitest --ui",
"test:integration": "vitest run tests/integration",
"test:e2e": "vitest run tests/e2e"
```

**Estimated Test Count:** 350+ tests across 40+ test files

---

## Phase 2: Architecture Refactoring (Priority: HIGH)
**Goal:** Eliminate tight coupling, improve modularity, enhance testability

### 2.1 State Management Refactor

**Problem:** `src/core/state.ts` mixes reactive values with entity arrays; no encapsulation

**Solution: Split into Domain-Specific State Modules**

**Create `src/core/state/gameState.ts`:**
```typescript
// Reactive game state only (scores, lives, levels, game phase)
export const gameState = createReactive<GameState>('PLAYING');
export const score = createReactive<number>(0);
export const gameLevel = createReactive<number>(1);
export const playerLives = createReactive<number>(3);
```

**Create `src/core/state/entityState.ts`:**
```typescript
// Entity collections with encapsulated mutation methods
class EntityState {
  private _bullets: Bullet[] = [];
  private _obstacles: Asteroid[] = [];
  private _powerups: Powerup[] = [];

  get bullets(): readonly Bullet[] { return this._bullets; }
  addBullet(bullet: Bullet): void { /* validation */ }
  removeBullet(index: number): void { /* swap-and-pop */ }
  clearBullets(): void { this._bullets.length = 0; }

  // Similar methods for obstacles and powerups
}

export const entityState = new EntityState();
```

**Create `src/core/state/playerState.ts`:**
```typescript
// Player-specific state (position, active powerups)
export const playerState = {
  player: null as Player | null,
  activePowerups: new Map<PowerupType, number>(),
  hasPowerup(type: PowerupType): boolean { /* */ },
  addPowerup(type: PowerupType, duration: number): void { /* */ }
};
```

**Benefits:**
- Clear separation of concerns
- Testable state mutations
- No direct array access from external modules
- Type-safe state operations

### 2.2 Main.ts Decomposition

**Problem:** 140 lines of initialization code in `src/core/main.ts` handling too many concerns

**Solution: Extract Focused Initialization Modules**

**Create `src/core/init/canvasInit.ts`:**
```typescript
export function initializeCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const canvas = getById<HTMLCanvasElement>('gameCanvas');
  if (!canvas) {
    log.error('Canvas element not found');
    return null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    log.error('2D context not available');
    return null;
  }

  resizeCanvas(canvas);
  return { canvas, ctx };
}
```

**Create `src/core/init/audioInit.ts`:**
```typescript
export async function initializeAudio(userGesture: boolean = false): Promise<void> {
  if (userGesture) {
    await forceAudioUnlock();
  }

  const settings = loadSettings();
  setVolume(settings.volume);
  if (settings.isMuted) muteAll();
}
```

**Create `src/core/init/inputInit.ts`:**
```typescript
export function initializeInput(canvas: HTMLCanvasElement): void {
  if (isMobile) {
    setupMobileControls(canvas);
  } else {
    setupDesktopControls(canvas);
  }
}
```

**Create `src/core/init/uiInit.ts`:**
```typescript
export function initializeUI(): void {
  initializeOverlays();
  initializeAudioControls();
  initializeSettingsUI();
  initializeScoreDisplay();
}
```

**Refactored `src/core/main.ts`:**
```typescript
async function main() {
  const canvasSetup = initializeCanvas();
  if (!canvasSetup) return;

  const { canvas, ctx } = canvasSetup;

  initializeInput(canvas);
  initializeUI();
  await initializeAudio();

  startGameLoop(ctx);
}
```

**Benefits:**
- Each module has single responsibility
- Easier to test in isolation
- Clear dependency flow
- Better error handling per subsystem

### 2.3 Service Layer Introduction

**Problem:** Direct imports of `soundManager`, `poolManager`, `collisionHandler` create hard dependencies

**Solution: Create Service Interfaces and Dependency Injection**

**Create `src/services/interfaces/`:**
```typescript
// src/services/interfaces/IAudioService.ts
export interface IAudioService {
  unlock(): Promise<void>;
  playSound(name: string): void;
  startMusic(): void;
  stopMusic(): void;
  setVolume(value: number): void;
  muteAll(): void;
  unmuteAll(): void;
}

// src/services/interfaces/IPoolService.ts
export interface IPoolService<T> {
  acquire(): T | null;
  release(item: T): void;
  reset(): void;
}

// src/services/interfaces/ICollisionService.ts
export interface ICollisionService {
  checkCollisions(): void;
  registerEntity(entity: Entity): void;
  unregisterEntity(entity: Entity): void;
}
```

**Create `src/services/ServiceProvider.ts`:**
```typescript
class ServiceProvider {
  private static instance: ServiceProvider;

  public audioService: IAudioService;
  public collisionService: ICollisionService;
  public poolService: IPoolService<any>;

  private constructor() {
    // Default implementations
    this.audioService = new SoundManager();
    this.collisionService = new CollisionHandler();
    this.poolService = new PoolManager();
  }

  static getInstance(): ServiceProvider { /* singleton */ }

  // Swap implementations (useful for testing)
  setAudioService(service: IAudioService): void { /* */ }
}

export const services = ServiceProvider.getInstance();
```

**Usage Example:**
```typescript
// Before:
import { playSound } from '@systems/soundManager';
playSound('fire');

// After:
import { services } from '@services/ServiceProvider';
services.audioService.playSound('fire');
```

**Benefits:**
- Easy to mock services in tests
- Swappable implementations (e.g., silent audio for tests)
- Clear service boundaries
- Testable without side effects

### 2.4 Event System for Decoupling

**Problem:** Direct function calls between modules create tight coupling (e.g., `scorePopups.showScore()` called from collision handler)

**Solution: Implement Event Bus Pattern**

**Create `src/core/events/EventBus.ts`:**
```typescript
type EventHandler<T = any> = (data: T) => void;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off<T>(event: string, handler: EventHandler<T>): void { /* */ }

  emit<T>(event: string, data: T): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(data));
    }
  }
}

export const eventBus = new EventBus();
```

**Create `src/core/events/GameEvents.ts`:**
```typescript
export enum GameEvent {
  ASTEROID_DESTROYED = 'asteroid:destroyed',
  PLAYER_HIT = 'player:hit',
  LEVEL_UP = 'level:up',
  POWERUP_COLLECTED = 'powerup:collected',
  SCORE_CHANGED = 'score:changed'
}

export type AsteroidDestroyedEvent = {
  position: { x: number; y: number };
  score: number;
  size: number;
};

export type PlayerHitEvent = {
  livesRemaining: number;
};
```

**Usage Example:**
```typescript
// Before (tight coupling):
import { showScore } from '@ui/hud/scorePopups';
showScore(x, y, scoreValue);

// After (decoupled):
import { eventBus, GameEvent } from '@core/events';
eventBus.emit<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, {
  position: { x, y },
  score: scoreValue,
  size: asteroid.size
});
```

**Benefits:**
- Modules don't need to know about each other
- Easy to add new event listeners without changing emitters
- Testable event flow
- Clear data contracts via event types

---

## Phase 3: Code Quality Improvements (Priority: HIGH)

### 3.1 Error Handling Strategy

**Create `src/utils/errors.ts`:**
```typescript
export class GameError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = true
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class AudioError extends GameError {
  constructor(message: string, recoverable = true) {
    super(message, 'AUDIO_ERROR', recoverable);
  }
}

export class CanvasError extends GameError {
  constructor(message: string) {
    super(message, 'CANVAS_ERROR', false);
  }
}

export function handleError(error: Error): void {
  if (error instanceof GameError) {
    log.error(`[${error.code}] ${error.message}`, { recoverable: error.recoverable });

    if (!error.recoverable) {
      // Show fatal error overlay
      showFatalError(error.message);
    }
  } else {
    log.error('Unexpected error', error);
  }
}
```

**Apply to Critical Paths:**
```typescript
// src/systems/soundManager.ts
export async function forceAudioUnlock(): Promise<void> {
  try {
    const silentAudio = sounds.get('silence');
    if (!silentAudio) {
      throw new AudioError('Silent audio file not loaded', true);
    }

    await silentAudio.play();
    isAudioUnlocked = true;
    log.info('Audio unlocked successfully');
  } catch (err) {
    throw new AudioError(`Audio unlock failed: ${err.message}`, true);
  }
}
```

**Add Retry Logic for Audio:**
```typescript
// src/utils/retry.ts
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry exhausted');
}

// Usage:
await retryAsync(() => forceAudioUnlock(), 3, 500);
```

### 3.2 Input Validation Layer

**Create `src/utils/validation.ts`:**
```typescript
export function validateBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

export function validateRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function validateAudioVolume(volume: number): number {
  return validateRange(volume, 0, 1);
}
```

**Apply to Public APIs:**
```typescript
// src/entities/player.ts
export function setPlayerPosition(x: number, y: number): void {
  if (!player) return;

  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!validateBounds(x, y, canvas.width, canvas.height)) {
    log.warn('Player position out of bounds', { x, y });
    return;
  }

  player.x = x;
  player.y = y;
}
```

### 3.3 Remove Code Smells

**Fix Redundant Assignments:**
```typescript
// Before (src/core/main.ts):
const canvasEl = getById<HTMLCanvasElement>('gameCanvas');
if (!canvasEl) { warn(...); return; }
const canvas = canvasEl;

// After:
const canvas = getById<HTMLCanvasElement>('gameCanvas');
if (!canvas) { warn(...); return; }
```

**Replace Console Calls with Logger:**
```typescript
// Find and replace all console.warn/error with log.warn/error
// Pattern: console\.(warn|error)\(
// Replacement: log.$1(
```

**Extract Hardcoded Strings:**
```typescript
// Create src/core/constants/cssClasses.ts
export const CSS_CLASSES = {
  GAME_OVERLAY: 'game-overlay',
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
  AUDIO_CONTROLS: 'audio-controls'
} as const;

// Usage:
element.classList.add(CSS_CLASSES.VISIBLE);
```

### 3.4 Performance Optimizations

**Add Memoization for Expensive Calculations:**
```typescript
// src/utils/memoize.ts
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Usage in collisionHandler.ts:
const getCellKey = memoize((x: number, y: number) => `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`);
```

**Add Performance Budgets:**
```typescript
// src/utils/performance.ts
export class PerformanceBudget {
  private frameTimes: number[] = [];

  recordFrame(duration: number): void {
    this.frameTimes.push(duration);
    if (this.frameTimes.length > 60) this.frameTimes.shift();
  }

  checkBudget(budget: number = 16): { exceeded: boolean; avgTime: number } {
    const avgTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return { exceeded: avgTime > budget, avgTime };
  }
}
```

---

## Phase 4: Documentation Excellence (Priority: MEDIUM)

### 4.1 Inline Documentation for Complex Logic

**Spatial Grid Algorithm Documentation:**
```typescript
// src/systems/collisionHandler.ts

/**
 * Spatial Grid Collision Detection System
 *
 * Uses a uniform grid to partition the game world into cells, dramatically
 * reducing collision checks from O(n²) to O(n) by only testing entities
 * in the same or adjacent cells.
 *
 * **Design Rationale:**
 * - Cell size of 60px chosen based on average entity size (asteroids: 20-40px)
 * - Search radius of 1 cell ensures no collisions missed at max velocity
 * - Grid rebuilt each frame to handle fast-moving entities
 *
 * **Performance:**
 * - 100 entities: ~15 checks/frame (vs 4,950 in naive approach)
 * - 500 entities: ~75 checks/frame (vs 124,750 in naive approach)
 *
 * @see https://gameprogrammingpatterns.com/spatial-partition.html
 */
const CELL_SIZE = 60;
```

**Accumulator Pattern Documentation:**
```typescript
// src/game/gameLoop.ts

/**
 * Fixed Timestep Game Loop with Accumulator Pattern
 *
 * Uses a fixed TIME_STEP (16.67ms = 60 FPS) for deterministic physics,
 * while allowing variable render rates. The accumulator tracks "leftover"
 * time between frames to ensure consistent update intervals.
 *
 * **Why this approach:**
 * - Deterministic physics: same inputs → same outputs
 * - Prevents spiral of death: updates can't fall behind indefinitely
 * - Smooth rendering independent of update rate
 *
 * **Mobile optimization:**
 * - 30 FPS update rate (TIME_STEP = 33.33ms) reduces CPU load
 * - Render skipping (every 2nd frame) saves GPU bandwidth
 *
 * @see https://gafferongames.com/post/fix_your_timestep/
 */
const TIME_STEP = isMobile ? 1000 / 30 : 1000 / 60;
let accumulator = 0;
```

**Reactive System Documentation:**
```typescript
// src/core/state.ts

/**
 * Minimal Reactive State System
 *
 * Provides observable values with automatic change notifications to watchers.
 * Uses ES6 Proxy for transparent reactivity without explicit getters/setters.
 *
 * **Design Decision:**
 * Chose custom implementation over libraries (MobX, Zustand) because:
 * 1. Game state is simple: 5 reactive values, no nested objects
 * 2. Zero dependencies = smaller bundle, faster load
 * 3. Full control over notification timing (synchronous updates)
 *
 * **Trade-offs:**
 * - Pro: Lightweight (50 lines), fast, no learning curve
 * - Con: No computed values, no batched updates, no time-travel debugging
 *
 * **Usage:**
 * ```typescript
 * const score = createReactive(0);
 * score.watch(() => console.log('Score:', score.value));
 * score.value = 100; // Triggers watcher immediately
 * ```
 */
export function createReactive<T>(initialValue: T): ReactiveValue<T> { /* */ }
```

### 4.2 Architecture Decision Records (ADRs)

**Create `docs/architecture/decisions/` directory with ADR template:**

**ADR-001: Custom Reactive State Over External Libraries**
```markdown
# ADR-001: Custom Reactive State System

## Status
Accepted

## Context
Need reactive state management for game values (score, lives, level) that
update UI automatically. Options: MobX, Zustand, custom solution.

## Decision
Implement minimal custom reactive system using ES6 Proxy.

## Rationale
- Game state is simple: 5 primitive values, no nested objects
- No need for computed values or complex dependency tracking
- Avoiding 50KB+ library for 50 lines of code
- Full control over synchronous vs asynchronous updates

## Consequences
**Positive:**
- Zero dependencies, smaller bundle size
- Fast implementation and no learning curve
- Synchronous updates match game loop requirements

**Negative:**
- No advanced features (computed, time-travel debugging)
- Manual watch cleanup (though not needed in our case)

## Alternatives Considered
- **MobX**: Powerful but overkill for simple state
- **Zustand**: Lightweight but async-first, doesn't fit game loop
```

**Additional ADRs to Create:**
- ADR-002: Spatial Grid Collision Detection (vs Quadtree)
- ADR-003: Object Pooling Strategy (vs On-Demand Allocation)
- ADR-004: Fixed Timestep Game Loop (vs Variable Timestep)
- ADR-005: TypeScript Strict Mode Configuration

### 4.3 API Documentation with TypeDoc

**Add Comprehensive JSDoc to Public APIs:**
```typescript
// src/entities/asteroid.ts

/**
 * Spawns a new asteroid at a random edge position with velocity toward screen center.
 * Uses object pooling to reuse inactive asteroids for performance.
 *
 * @param canvasWidth - Canvas width for boundary calculation
 * @param canvasHeight - Canvas height for boundary calculation
 * @param speedMultiplier - Velocity scale factor (increases per level), default 1.0
 * @returns The spawned asteroid, or null if pool is exhausted
 *
 * @remarks
 * Asteroids spawn from screen edges with random angles. Fragment asteroids
 * (created from destroyed parents) are created via a separate spawn path.
 *
 * @example
 * ```typescript
 * const asteroid = spawnAsteroid(800, 600, 1.5);
 * if (asteroid) {
 *   obstacles.push(asteroid);
 * }
 * ```
 */
export function spawnAsteroid(
  canvasWidth: number,
  canvasHeight: number,
  speedMultiplier: number = 1.0
): Asteroid | null { /* */ }
```

**Configure TypeDoc Options:**
```json
// typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "plugin": ["typedoc-plugin-markdown"],
  "excludePrivate": true,
  "excludeInternal": true,
  "categorizeByGroup": true,
  "categoryOrder": ["Core", "Entities", "Systems", "UI", "Utils"],
  "navigationLinks": {
    "GitHub": "https://github.com/thetrev68/spaceship-dodge-game"
  }
}
```

### 4.4 Onboarding Documentation

**Create `docs/DEVELOPER_GUIDE.md`:**
- Architecture overview with diagrams
- Development environment setup (prerequisites, installation)
- Code organization principles
- Testing strategy and how to add tests
- Debugging techniques and tools
- Common pitfalls and solutions

**Create `docs/GAME_DESIGN.md`:**
- Game mechanics breakdown
- Difficulty tuning guide (how to adjust constants)
- Adding new entities (step-by-step)
- Audio system deep-dive
- Performance optimization tips

---

## Phase 5: CI/CD and Automation (Priority: MEDIUM)

### 5.1 GitHub Actions Workflow

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: npx bundlesize

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Build and deploy
        run: |
          npm ci
          npm run build
          npm run deploy
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Create `.github/workflows/performance.yml`:**
```yaml
name: Performance

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Build
        run: |
          npm ci
          npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:4173
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

### 5.2 Pre-commit Hooks with Husky

**Install and Configure:**
```bash
npm install -D husky lint-staged
npx husky init
```

**Create `.husky/pre-commit`:**
```bash
#!/usr/bin/env sh
npx lint-staged
```

**Add to `package.json`:**
```json
"lint-staged": {
  "*.ts": [
    "eslint --fix",
    "vitest related --run"
  ],
  "*.{ts,json,md}": [
    "prettier --write"
  ]
}
```

### 5.3 Automated Dependency Updates

**Create `.github/dependabot.yml`:**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
    reviewers:
      - "thetrev68"
```

### 5.4 Code Quality Badges

**Add to README.md:**
```markdown
[![CI](https://github.com/thetrev68/spaceship-dodge-game/workflows/CI/badge.svg)](https://github.com/thetrev68/spaceship-dodge-game/actions)
[![codecov](https://codecov.io/gh/thetrev68/spaceship-dodge-game/branch/main/graph/badge.svg)](https://codecov.io/gh/thetrev68/spaceship-dodge-game)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
```

---

## Phase 6: Advanced Features (Priority: LOW)

### 6.1 Storybook for UI Components

**Install Storybook:**
```bash
npx storybook@latest init
```

**Create Stories for UI Components:**
- `src/ui/hud/scoreDisplay.stories.ts`
- `src/ui/overlays/overlayManager.stories.ts`
- `src/ui/controls/audioControls.stories.ts`

**Benefits:**
- Visual regression testing
- Isolated component development
- Living style guide

### 6.2 Performance Monitoring

**Integrate Web Vitals:**
```typescript
// src/utils/analytics.ts
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics(metric: any) {
  log.info('Web Vital', { name: metric.name, value: metric.value });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

**Add Performance Budgets:**
```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 200 },
      { "resourceType": "total", "budget": 500 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 0 }
    ]
  }
]
```

### 6.3 Accessibility Enhancements

**Add ARIA Announcements for Game Events:**
```typescript
// src/ui/accessibility/announcer.ts
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const liveRegion = document.getElementById('aria-live-region');
  if (!liveRegion) return;

  liveRegion.setAttribute('aria-live', priority);
  liveRegion.textContent = message;

  // Clear after announcement
  setTimeout(() => { liveRegion.textContent = ''; }, 1000);
}

// Usage:
eventBus.on(GameEvent.LEVEL_UP, () => {
  announceToScreenReader(`Level ${gameLevel.value} reached`, 'assertive');
});
```

**Add Keyboard Shortcuts Guide:**
```typescript
// src/ui/keyboardHelp.ts
export function showKeyboardHelp(): void {
  const shortcuts = [
    { key: 'WASD / Arrow Keys', action: 'Move spaceship' },
    { key: 'Space / Click', action: 'Fire bullets' },
    { key: 'P', action: 'Pause game' },
    { key: 'M', action: 'Mute audio' },
    { key: '?', action: 'Show this help' }
  ];

  // Render overlay with shortcuts
}
```

---

## Phase 7: Ecosystem and Community (Priority: LOW)

### 7.1 Contribution Guide Enhancement

**Expand `CONTRIBUTING.md`:**
- Code style guide (prettier, eslint rules)
- Git workflow (feature branches, commit message format)
- PR template and review checklist
- How to add tests (examples for each test type)
- How to update documentation

**Create `PULL_REQUEST_TEMPLATE.md`:**
```markdown
## Description
<!-- What does this PR do? -->

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature causing existing functionality to change)

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests passing (npm run test)
- [ ] Type checking passing (npm run typecheck)
- [ ] Lint passing (npm run lint)
```

### 7.2 Code of Conduct and Governance

**Add `CODE_OF_CONDUCT.md`:**
```markdown
# Contributor Covenant Code of Conduct

## Our Pledge
We pledge to make participation in our project a harassment-free experience...

[Standard Contributor Covenant text]
```

### 7.3 Issue Templates

**Create `.github/ISSUE_TEMPLATE/bug_report.md`:**
```markdown
---
name: Bug Report
about: Create a report to help us improve
labels: bug
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows, macOS, iOS]
 - Browser: [e.g. Chrome 120, Safari 17]
 - Device: [e.g. iPhone 12, Desktop]
```

---

## Implementation Roadmap

### Sprint 1 (Weeks 1-2): Testing Foundation
- **Goal:** 50% test coverage
- Tasks:
  - Set up test utilities and mocks
  - Write core game loop tests
  - Write collision detection tests
  - Write entity tests (player, asteroids, bullets)
  - Configure coverage reporting

### Sprint 2 (Weeks 3-4): Architecture Refactor
- **Goal:** Decouple modules, improve testability
- Tasks:
  - Split state management into domain modules
  - Decompose main.ts into focused init modules
  - Introduce service layer with interfaces
  - Implement event bus for decoupling
  - Update tests to use new architecture

### Sprint 3 (Weeks 5-6): Testing Completion
- **Goal:** 85% test coverage
- Tasks:
  - Write integration tests (full game flow)
  - Write UI component tests
  - Write input system tests
  - Write E2E tests
  - Add performance tests

### Sprint 4 (Weeks 7-8): Code Quality & Documentation
- **Goal:** Professional-grade codebase
- Tasks:
  - Implement error handling strategy
  - Add input validation layer
  - Remove code smells
  - Add inline documentation to complex logic
  - Write Architecture Decision Records
  - Enhance JSDoc for public APIs

### Sprint 5 (Week 9): CI/CD & Automation
- **Goal:** Automated quality gates
- Tasks:
  - Set up GitHub Actions workflows
  - Configure pre-commit hooks
  - Set up automated dependency updates
  - Add code quality badges
  - Configure Codecov integration

### Sprint 6 (Week 10): Polish & Advanced Features
- **Goal:** Showcase-ready project
- Tasks:
  - Set up Storybook for UI components
  - Add performance monitoring
  - Enhance accessibility features
  - Expand contribution guide
  - Create issue templates
  - Final documentation review

---

## Success Metrics

### Quantitative Goals
- **Test Coverage:** ≥85% lines, ≥85% functions, ≥80% branches
- **Type Safety:** 100% (no `any` types, strict mode enabled)
- **Performance:** 60 FPS desktop, 30 FPS mobile (100+ entities)
- **Bundle Size:** ≤200KB gzipped
- **Lighthouse Score:** ≥90 performance, ≥95 accessibility
- **Build Time:** ≤30 seconds
- **CI Pipeline:** ≤5 minutes

### Qualitative Goals
- **Code Readability:** Clear naming, well-documented complex logic
- **Maintainability:** Low coupling, high cohesion, modular design
- **Testability:** All modules testable in isolation
- **Developer Experience:** Easy to onboard, clear contribution process
- **Professional Polish:** Comprehensive docs, automated tooling, active maintenance

---

## Estimated Effort

| Phase | Estimated Hours | Priority |
|-------|----------------|----------|
| Phase 1: Testing Infrastructure | 60-80 hours | CRITICAL |
| Phase 2: Architecture Refactoring | 40-50 hours | HIGH |
| Phase 3: Code Quality Improvements | 20-30 hours | HIGH |
| Phase 4: Documentation Excellence | 30-40 hours | MEDIUM |
| Phase 5: CI/CD and Automation | 15-20 hours | MEDIUM |
| Phase 6: Advanced Features | 20-30 hours | LOW |
| Phase 7: Ecosystem and Community | 10-15 hours | LOW |
| **Total** | **195-265 hours** | (5-7 weeks full-time) |

---

## Critical Files for Modification

### Phase 1 (Testing):
- `vitest.config.ts` - Add coverage configuration
- `tests/` - Create 40+ new test files

### Phase 2 (Architecture):
- `src/core/state.ts` - Split into domain modules
- `src/core/main.ts` - Decompose into init modules
- `src/services/` - New directory for service layer
- `src/core/events/` - New directory for event system

### Phase 3 (Code Quality):
- `src/utils/errors.ts` - New error handling utilities
- `src/utils/validation.ts` - New validation layer
- `src/systems/soundManager.ts` - Add error handling and retry logic
- All files - Replace console calls with logger

### Phase 4 (Documentation):
- `src/systems/collisionHandler.ts` - Add spatial grid docs
- `src/game/gameLoop.ts` - Add accumulator pattern docs
- `src/core/state.ts` - Add reactive system docs
- `docs/architecture/decisions/` - New ADR directory

### Phase 5 (CI/CD):
- `.github/workflows/` - New CI/CD workflows
- `.husky/` - Pre-commit hooks
- `package.json` - Add lint-staged configuration

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes during refactor | Medium | High | Incremental refactoring with regression tests |
| Test writing takes longer than estimated | High | Medium | Start with high-value tests (game loop, collisions) |
| Performance regression from new abstractions | Low | Medium | Performance benchmarks in CI |
| CI/CD setup complexity | Low | Low | Use established GitHub Actions templates |

---

## Next Steps

1. **Review and Approve Plan:** Discuss priorities and timeline
2. **Set Up Project Board:** Create GitHub Issues for each phase
3. **Begin Sprint 1:** Start with testing foundation
4. **Weekly Check-ins:** Review progress and adjust plan as needed

---

## Conclusion

This plan transforms the spaceship-dodge-game into a **world-class showcase project** through:
- **Comprehensive testing** (85%+ coverage)
- **Clean architecture** (decoupled, testable modules)
- **Professional documentation** (ADRs, inline docs, developer guides)
- **Automated quality** (CI/CD, pre-commit hooks, performance monitoring)
- **Community-ready** (contribution guides, issue templates, code of conduct)

The result will be a codebase that demonstrates:
- **Engineering Excellence:** Best practices in TypeScript, testing, and architecture
- **Professional Polish:** Automated tooling, comprehensive docs, quality gates
- **Maintainability:** Clear code, low coupling, high testability
- **Portfolio Strength:** A project that showcases senior-level software engineering skills

Estimated completion: **5-7 weeks full-time** or **10-14 weeks part-time**