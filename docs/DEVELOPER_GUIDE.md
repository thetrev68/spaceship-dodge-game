# Developer Guide

Welcome to the Spaceship Dodge Game development team! This guide will help you understand the codebase architecture, development workflow, and best practices.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Development Environment Setup](#development-environment-setup)
4. [Code Organization Principles](#code-organization-principles)
5. [Core Systems Deep Dive](#core-systems-deep-dive)
6. [Testing Strategy](#testing-strategy)
7. [Debugging Techniques](#debugging-techniques)
8. [Common Development Tasks](#common-development-tasks)
9. [Performance Optimization](#performance-optimization)
10. [Common Pitfalls](#common-pitfalls)

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern browser with HTML5 Canvas support
- Git for version control

### First Time Setup

````bash
# Clone repository
git clone https://github.com/thetrev68/spaceship-dodge-game.git
cd spaceship-dodge-game

# Install dependencies
npm install

# Start development server
npm run dev
```bash

Visit `http://localhost:5173` to see the game running.

### Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run typecheck        # TypeScript type checking
npm run typecheck:watch  # Type check in watch mode
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run knip             # Find unused code/dependencies

# Testing
npm run test             # Run Vitest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Documentation
npm run docs             # Generate TypeDoc documentation

# Deployment
npm run deploy           # Deploy to GitHub Pages
```bash

---

## Architecture Overview

### High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Overlays │  │    HUD    │  │ Controls │  │  Settings  │ │
│  │ Manager  │  │ (Score,   │  │ (Audio,  │  │    UI      │ │
│  │          │  │  Lives)   │  │  Volume) │  │            │ │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬─────┘ │
└───────┼──────────────┼─────────────┼────────────────┼──────┘
        │              │             │                │
        └──────────────┴─────────────┴────────────────┘
                       │
                  ┌────▼────┐
                  │ Event   │◄──────────────────────┐
                  │  Bus    │                       │
                  └────┬────┘                       │
                       │                            │
        ┌──────────────┴─────────────┬──────────────┴─────┐
        │                            │                    │
   ┌────▼────┐                 ┌────▼────┐         ┌────▼────┐
   │  Game   │                 │ Entity  │         │ Service │
   │ State   │                 │ State   │         │Provider │
   │Manager  │                 │ Manager │         │(DI)     │
   └────┬────┘                 └────┬────┘         └────┬────┘
        │                           │                   │
        ├───► Game Loop ────────────┤                   │
        │         │                 │                   │
        │         ▼                 ▼                   │
        │    ┌─────────┐      ┌─────────┐              │
        │    │ Update  │      │ Render  │              │
        │    │ Systems │      │ Manager │              │
        │    └────┬────┘      └────┬────┘              │
        │         │                │                   │
        └─────────┴────────────────┴───────────────────┘
                  │                │
            ┌─────┴────┐     ┌─────┴────┐
            │Collision │     │ Canvas   │
            │Detection │     │Rendering │
            └──────────┘     └──────────┘
```text

### Key Architectural Patterns

**1. Modular Domain-Driven Design**

- Code organized by domain (entities, systems, ui, game logic)
- Clear separation of concerns
- Each module has single responsibility

**2. Reactive State Management**

- Custom lightweight reactive system ([src/core/reactive.ts](../src/core/reactive.ts))
- Zero dependencies, synchronous updates
- See [ADR-001](./architecture/decisions/ADR-001-custom-reactive-state.md)

**3. Event-Driven Architecture**

- EventBus for loose coupling between systems
- UI components subscribe to game events
- Enables easy testing and mocking

**4. Dependency Injection**

- ServiceProvider pattern for testability
- Easy mocking of services in tests
- Centralized service configuration

**5. Object Pooling**

- Bullets and asteroids use object pools
- Reduces GC pressure by 95%
- See [ADR-003](./architecture/decisions/ADR-003-object-pooling.md)

---

## Development Environment Setup

### IDE Configuration

**Recommended: VS Code**

Install these extensions:

- **ESLint** - JavaScript/TypeScript linting
- **TypeScript Vue Plugin (Volar)** - Enhanced TypeScript support
- **Prettier** - Code formatting
- **Error Lens** - Inline error display
- **GitLens** - Git integration

### VS Code Settings

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
````

### TypeScript Configuration

The project uses **strict mode** for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

See [ADR-005](./architecture/decisions/ADR-005-typescript-strict-mode.md) for rationale.

### Git Workflow

**Branch Naming:**

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

**Commit Message Format:**

```text
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Example:

````text
feat: Add shield powerup with visual glow effect

- Implements 5-second invulnerability on pickup
- Adds glowing visual effect around player
- Updates HUD to show active shield indicator

Closes #42
```typescript

---

## Code Organization Principles

### Folder Structure Philosophy

The codebase follows **domain-driven design** with these principles:

1. **Entities** - Game objects with state and behavior (player, asteroids, bullets)
2. **Systems** - Cross-cutting concerns (collision, rendering, audio)
3. **UI** - User interface components (HUD, overlays, controls)
4. **Game** - Game loop and state management
5. **Core** - Application bootstrap and configuration
6. **Utils** - Pure utility functions (no side effects)

See [FOLDER_STRUCTURE.md](../FOLDER_STRUCTURE.md) for detailed breakdown.

### Module Design Guidelines

**✅ DO:**

- Keep modules focused on single responsibility
- Export only what's needed (prefer named exports)
- Use TypeScript interfaces for public APIs
- Document complex algorithms inline
- Add JSDoc for public functions

**❌ DON'T:**

- Create circular dependencies
- Export mutable state directly (use getters/setters)
- Mix rendering and business logic
- Use `any` type (strict mode enforced)
- Add features without tests

### Import Organization

Organize imports in this order:

```typescript
// 1. External dependencies
import { log } from '@core/logger';

// 2. Type imports
import type { Asteroid, Bullet } from '@types';

// 3. Internal modules
import { bulletPool, asteroidPool } from '@systems/poolManager';
import { ASTEROID_CONFIG } from '@core/constants';

// 4. Relative imports (avoid when possible)
import { helper } from './utils';
````

Use path aliases from `tsconfig.json`:

- `@core/*` - Core modules
- `@game/*` - Game logic
- `@entities/*` - Game entities
- `@systems/*` - Cross-cutting systems
- `@ui/*` - UI components
- `@utils/*` - Utility functions
- `@types` - Type definitions

---

## Core Systems Deep Dive

### 1. Game Loop Architecture

The game uses a **fixed timestep loop with accumulator pattern** for deterministic physics.

**File:** [src/game/gameLoop.ts](../src/game/gameLoop.ts)

```typescript
const TIME_STEP = 1000 / 60; // 60 FPS (16.67ms)
let accumulator = 0;

function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Cap delta to prevent spiral of death
  const cappedDelta = Math.min(deltaTime, TIME_STEP * 5);
  accumulator += cappedDelta;

  // Run fixed updates until accumulator depleted
  while (accumulator >= TIME_STEP) {
    updateGameState(TIME_STEP); // Always use TIME_STEP
    accumulator -= TIME_STEP;
  }

  renderAll(ctx); // Render at variable rate
  requestAnimationFrame(gameLoop);
}
```

**Why fixed timestep?**

- **Deterministic physics** - Same inputs always produce same outputs
- **Easier balancing** - Game speed consistent across devices
- **Testable** - Physics reproducible for automated tests

See [ADR-004](./architecture/decisions/ADR-004-fixed-timestep-game-loop.md) for full rationale.

---

### 2. Collision Detection System

Uses **spatial grid partitioning** for O(n) collision detection instead of naive O(n²) approach.

**File:** [src/systems/collisionHandler.ts](../src/systems/collisionHandler.ts)

```typescript
const CELL_SIZE = 60; // Grid cell size in pixels
const spatialGrid = new Map<string, Array<Asteroid | Bullet>>();

function getCellKey(x: number, y: number): string {
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);
  return `${gridX},${gridY}`;
}

export function checkCollisions(): void {
  // Step 1: Rebuild spatial grid
  spatialGrid.clear();
  for (const obstacle of obstacles) {
    const key = getCellKey(obstacle.x, obstacle.y);
    if (!spatialGrid.has(key)) spatialGrid.set(key, []);
    spatialGrid.get(key)!.push(obstacle);
  }

  // Step 2: Check bullets only against nearby obstacles
  for (const bullet of bullets) {
    const cellKey = getCellKey(bullet.x, bullet.y);

    // Search 3x3 grid around bullet (9 cells)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighborKey = getCellKey(bullet.x + dx * CELL_SIZE, bullet.y + dy * CELL_SIZE);
        const nearbyObstacles = spatialGrid.get(neighborKey) || [];
        for (const obstacle of nearbyObstacles) {
          if (circleCollision(bullet, obstacle)) {
            handleCollision(bullet, obstacle);
          }
        }
      }
    }
  }
}
```

**Performance:**

- 100 entities: ~15 checks/frame (vs 4,950 naive)
- 500 entities: ~75 checks/frame (vs 124,750 naive)
- **~100x reduction** in collision checks

See [ADR-002](./architecture/decisions/ADR-002-spatial-grid-collision.md) for design decisions.

---

### 3. Reactive State System

Custom lightweight reactive implementation for game state.

**File:** [src/core/reactive.ts](../src/core/reactive.ts)

```typescript
export interface ReactiveValue<T> {
  value: T;
  watch(fn: () => void): () => void;
}

export function createReactive<T>(initialValue: T): ReactiveValue<T> {
  let currentValue = initialValue;
  const watchers = new Set<() => void>();

  return {
    get value() {
      return currentValue;
    },
    set value(newValue: T) {
      if (currentValue !== newValue) {
        currentValue = newValue;
        watchers.forEach((fn) => fn()); // Notify synchronously
      }
    },
    watch(fn: () => void) {
      watchers.add(fn);
      return () => watchers.delete(fn);
    },
  };
}
```

**Usage:**

```typescript
import { score, gameState } from '@core/state';

// Watch for changes
score.watch(() => {
  console.log('Score changed:', score.value);
});

// Update value (triggers watchers immediately)
score.value = 100;

// State transitions
gameState.value = 'PLAYING';
```

**Why custom instead of MobX/Zustand?**

- **Size:** 50 lines vs 20KB+ for libraries
- **Sync updates:** Game loop needs immediate notifications
- **Zero deps:** Smaller bundle, faster load

See [ADR-001](./architecture/decisions/ADR-001-custom-reactive-state.md) for comparison.

---

### 4. Object Pooling System

Reuses objects instead of creating/destroying for performance.

**File:** [src/systems/poolManager.ts](../src/systems/poolManager.ts)

```typescript
export class ObjectPool<T> {
  private pool: T[] = [];

  constructor(private readonly factory: () => T) {}

  acquire(): T {
    return this.pool.pop() ?? this.factory();
  }

  release(obj: T): void {
    this.pool.push(obj);
  }
}
```

**Usage:**

```typescript
// Create pool
const bulletPool = new ObjectPool<Bullet>(() => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  active: false,
}));

// Acquire from pool
const bullet = bulletPool.acquire();
bullet.x = player.x;
bullet.active = true;
bullets.push(bullet);

// Release back to pool
bullet.active = false;
bulletPool.release(bullet);
bullets.splice(bullets.indexOf(bullet), 1);
```

**Performance impact:**

- Without pooling: ~100 GC collections/min, 5-10ms pauses
- With pooling: ~5 GC collections/min, <1ms pauses

See [ADR-003](./architecture/decisions/ADR-003-object-pooling.md) for details.

---

## Testing Strategy

### Test Coverage Goals

The project maintains high test coverage:

- **Statements:** 85%+
- **Branches:** 85%+
- **Functions:** 80%+
- **Lines:** 85%+

### Test Organization

Tests are colocated with source files:

```text
src/
├── core/
│   ├── reactive.ts
│   └── reactive.test.ts          # Unit tests
├── systems/
│   ├── collisionHandler.ts
│   └── collisionHandler.test.ts  # Unit tests
└── game/
    ├── gameLoop.ts
    └── gameLoop.test.ts          # Integration tests
```

### Writing Unit Tests

**Template:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { functionUnderTest } from './module';

describe('ModuleName', () => {
  beforeEach(() => {
    // Setup test state
  });

  afterEach(() => {
    // Cleanup
  });

  describe('functionUnderTest', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = createInput();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });

    it('should handle edge case', () => {
      // Test edge cases
    });

    it('should throw on invalid input', () => {
      expect(() => functionUnderTest(invalidInput)).toThrow('Expected error message');
    });
  });
});
```

### Mocking Dependencies

Use Vitest mocking for external dependencies:

```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('@systems/soundManager', () => ({
  playSound: vi.fn(),
  startMusic: vi.fn(),
}));

// Verify mock calls
import { playSound } from '@systems/soundManager';
expect(playSound).toHaveBeenCalledWith('fire');
```

### Testing Reactive State

```typescript
import { createReactive } from '@core/reactive';

it('should notify watchers on value change', () => {
  const value = createReactive(0);
  const watcher = vi.fn();

  value.watch(watcher);
  value.value = 100;

  expect(watcher).toHaveBeenCalledOnce();
});
```

---

## Debugging Techniques

### 1. Enable Debug Mode

Edit [src/core/gameConstants.ts](../src/core/gameConstants.ts):

```typescript
export const DEV_CONFIG = {
  DEBUG_MODE: true,
  SHOW_PERFORMANCE_METRICS: true,
  LOG_LEVEL: 'debug',
};
```

### 2. Use the Logger

```typescript
import { debug, info, warn, error } from '@core/logger';

debug('collision', 'Detailed debug info', { data });
info('game', 'General information');
warn('input', 'Warning message');
error('game', 'Error occurred', error);
```

### 3. Performance Profiling

Enable performance HUD to see:

- FPS (frames per second)
- Frame time (ms)
- Entity counts (bullets, asteroids, powerups)
- Collision check count

### 4. Browser DevTools

**Performance Tab:**

- Record gameplay session
- Identify frame drops
- Check GC frequency
- Profile JavaScript execution

**Memory Tab:**

- Take heap snapshots
- Check for memory leaks
- Verify object pooling is working

**Network Tab:**

- Verify asset loading
- Check audio file caching
- Monitor bundle size

### 5. Common Debug Scenarios

**Issue: Frame rate drops**

```typescript
// Enable performance metrics
DEV_CONFIG.SHOW_PERFORMANCE_METRICS = true;

// Check entity counts
log.debug('Entity count:', {
  bullets: bullets.length,
  asteroids: obstacles.length,
  collisionChecks: collisionCheckCount,
});
```

**Issue: Objects not releasing from pool**

```typescript
// Check pool size
log.debug('Pool stats:', {
  bulletPool: bulletPool.size(),
  activeBullets: bullets.length,
});
```

**Issue: State updates not triggering UI**

```typescript
// Verify watcher is registered
score.watch(() => {
  log.debug('Score changed:', score.value);
});
```

---

## Common Development Tasks

### Adding a New Game Entity

**Example: Adding an "Enemy" entity**

**1. Define type** ([src/types/index.ts](../src/types/index.ts)):

```typescript
export interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  active: boolean;
}
```

**2. Create entity module** ([src/entities/enemy.ts](../src/entities/enemy.ts)):

```typescript
import { Enemy } from '@types';
import { ObjectPool } from '@systems/poolManager';

const enemyPool = new ObjectPool<Enemy>(() => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  health: 3,
  active: false,
}));

export function spawnEnemy(x: number, y: number): Enemy {
  const enemy = enemyPool.acquire();
  enemy.x = x;
  enemy.y = y;
  enemy.active = true;
  return enemy;
}

export function updateEnemies(enemies: Enemy[], deltaTime: number): void {
  for (const enemy of enemies) {
    if (!enemy.active) continue;

    enemy.x += enemy.vx * deltaTime;
    enemy.y += enemy.vy * deltaTime;

    // Remove if off-screen
    if (enemy.y > canvas.height) {
      enemy.active = false;
      enemyPool.release(enemy);
    }
  }
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  ctx.fillStyle = 'red';
  ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20);
}
```

**3. Add to game state** ([src/core/state.ts](../src/core/state.ts)):

```typescript
export const enemies: Enemy[] = [];
```

**4. Integrate into game loop** ([src/game/gameLoop.ts](../src/game/gameLoop.ts)):

```typescript
import { updateEnemies } from '@entities/enemy';
import { enemies } from '@core/state';

function updateGameState(deltaTime: number): void {
  // ... existing updates
  updateEnemies(enemies, deltaTime);
}
```

**5. Add to render manager** ([src/systems/renderManager.ts](../src/systems/renderManager.ts)):

```typescript
import { drawEnemy } from '@entities/enemy';

export function renderAll(ctx: CanvasRenderingContext2D): void {
  // ... existing rendering
  for (const enemy of enemies) {
    if (enemy.active) drawEnemy(ctx, enemy);
  }
}
```

**6. Add collision detection** ([src/systems/collisionHandler.ts](../src/systems/collisionHandler.ts)):

```typescript
// Add enemy collision checks
for (const bullet of bullets) {
  for (const enemy of enemies) {
    if (circleCollision(bullet, enemy)) {
      enemy.health--;
      if (enemy.health <= 0) {
        enemy.active = false;
        enemyPool.release(enemy);
      }
    }
  }
}
```

---

### Adding a New Sound Effect

**1. Add audio file** to `public/sounds/explosion.mp3`

**2. Register sound** ([src/systems/soundManager.ts](../src/systems/soundManager.ts)):

```typescript
const soundFiles = {
  // ... existing sounds
  explosion: '/sounds/explosion.mp3',
};
```

**3. Use in game logic:**

```typescript
import { playSound } from '@systems/soundManager';

function destroyEnemy(enemy: Enemy): void {
  enemy.active = false;
  playSound('explosion');
  addScore(100);
}
```

---

### Modifying Game Difficulty

Edit [src/core/gameConstants.ts](../src/core/gameConstants.ts):

```typescript
export const LEVEL_CONFIG = {
  // Spawn rate (lower = faster)
  BASE_SPAWN_INTERVAL_DESKTOP: 1500, // ms
  BASE_SPAWN_INTERVAL_MOBILE: 2400, // ms

  // Difficulty scaling
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: 70, // ms faster per level
  MIN_SPAWN_INTERVAL: 300, // Cap at 300ms

  // Asteroid speed scaling
  ASTEROID_SPEED_INCREASE_PER_LEVEL: 0.5,
  MAX_ASTEROID_SPEED: 3.0,
};
```

---

### Adding a New Power-up

**1. Define type:**

```typescript
export type PowerupType = 'shield' | 'doubleBlaster' | 'rapidFire';
```

**2. Add configuration:**

```typescript
export const POWERUP_CONFIG = {
  // ... existing
  RAPID_FIRE_DURATION: 8000, // 8 seconds
  RAPID_FIRE_COOLDOWN_MULTIPLIER: 0.5, // Half cooldown
};
```

**3. Implement effect** ([src/entities/player.ts](../src/entities/player.ts)):

```typescript
export function applyPowerup(type: PowerupType): void {
  switch (type) {
    case 'rapidFire':
      activePowerups.set('rapidFire', Date.now());
      setTimeout(() => {
        activePowerups.delete('rapidFire');
      }, POWERUP_CONFIG.RAPID_FIRE_DURATION);
      break;
  }
}
```

**4. Update firing logic:**

```typescript
export function fireBullet(): void {
  const cooldown = activePowerups.has('rapidFire')
    ? BULLET_CONFIG.FIRE_COOLDOWN * 0.5
    : BULLET_CONFIG.FIRE_COOLDOWN;

  if (Date.now() - lastFireTime < cooldown) return;

  // Fire bullet
}
```

---

## Performance Optimization

### Profiling Checklist

**1. Enable Performance Metrics**

```typescript
DEV_CONFIG.SHOW_PERFORMANCE_METRICS = true;
```

**2. Check Entity Counts**

- Keep bullets < 50 active
- Keep asteroids < 100 active
- Use object pooling for frequent spawns

**3. Optimize Collision Detection**

- Spatial grid should have ~60px cells
- Collision checks should be < 100 per frame
- Profile `checkCollisions()` function

**4. Reduce Canvas Operations**

- Batch draw calls when possible
- Use `ctx.save()`/`ctx.restore()` sparingly
- Avoid unnecessary `clearRect()` calls

**5. Monitor Garbage Collection**

- Check GC frequency in browser DevTools
- Pool objects to reduce allocations
- Avoid creating objects in hot paths

### Mobile Performance

Mobile devices have lower performance. Optimizations:

- **Longer spawn intervals** (2400ms vs 1500ms)
- **Simpler asteroid shapes** (5 points vs 11)
- **No starfield** (background rendering disabled)
- **FPS capping** (30 FPS on low-end devices)

---

## Common Pitfalls

### 1. Forgetting to Reset Pooled Objects

**❌ Wrong:**

```typescript
const bullet = bulletPool.acquire();
bullets.push(bullet); // State from last use!
```

**✅ Correct:**

```typescript
const bullet = bulletPool.acquire();
bullet.x = player.x;
bullet.y = player.y;
bullet.active = true;
bullets.push(bullet);
```

---

### 2. Circular Dependencies

**❌ Wrong:**

```typescript
// entityState.ts
import { updateCollisions } from './collisionHandler';

// collisionHandler.ts
import { entities } from './entityState'; // Circular!
```

**✅ Correct:**

```typescript
// entityState.ts
export function getEntities() {
  return entities;
}

// collisionHandler.ts
import { getEntities } from './entityState'; // No circular dep
```

---

### 3. Mutating Reactive State Directly

**❌ Wrong:**

```typescript
import { score } from '@core/state';
score += 100; // Doesn't trigger watchers!
```

**✅ Correct:**

```typescript
import { score } from '@core/state';
score.value += 100; // Triggers watchers
```

---

### 4. Not Handling Null/Undefined

TypeScript strict mode enforces null checks:

**❌ Wrong:**

```typescript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // Error: canvas might be null
```

**✅ Correct:**

```typescript
const canvas = getElementById<HTMLCanvasElement>('gameCanvas');
if (!canvas) {
  log.error('Canvas not found');
  return;
}
const ctx = canvas.getContext('2d');
```

---

### 5. Using Console Instead of Logger

**❌ Wrong:**

```typescript
console.log('Score:', score.value);
```

**✅ Correct:**

```typescript
import { log } from '@core/logger';
log.info('Score:', score.value);
```

The logger provides:

- Log levels (debug/info/warn/error)
- Structured logging
- Easy filtering in production

---

## Additional Resources

- **[FOLDER_STRUCTURE.md](../FOLDER_STRUCTURE.md)** - Detailed folder structure
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[UPGRADE_NOTES.md](../UPGRADE_NOTES.md)** - Migration notes
- **[LOGGER_USAGE.md](../LOGGER_USAGE.md)** - Logger documentation
- **[Architecture Decision Records](./architecture/decisions/)** - Design decisions

### External References

- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

---

## Getting Help

**Found a bug?** Open an issue on [GitHub](https://github.com/thetrev68/spaceship-dodge-game/issues)

**Have questions?** Check existing issues or open a discussion

**Want to contribute?** See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Happy coding! 🚀**
