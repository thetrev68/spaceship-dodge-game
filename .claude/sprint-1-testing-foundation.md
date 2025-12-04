# Sprint 1: Testing Foundation

## Goal

Achieve 50% test coverage by implementing test infrastructure and core game system tests.

## Prerequisites

- Vitest is already configured in the project
- Project uses TypeScript with strict mode
- Existing codebase structure documented in CLAUDE.md

## Part 1: Test Infrastructure Setup

### 1.1 Create Test Helpers Directory

Create `tests/helpers/` with the following utility files:

**tests/helpers/mockCanvas.ts**

```typescript
export function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

export function createMock2DContext(): CanvasRenderingContext2D {
  const canvas = createMockCanvas();
  const ctx = canvas.getContext('2d')!;

  // Mock methods that aren't implemented in jsdom
  ctx.fillRect = vi.fn();
  ctx.strokeRect = vi.fn();
  ctx.clearRect = vi.fn();
  ctx.beginPath = vi.fn();
  ctx.closePath = vi.fn();
  ctx.arc = vi.fn();
  ctx.fill = vi.fn();
  ctx.stroke = vi.fn();
  ctx.moveTo = vi.fn();
  ctx.lineTo = vi.fn();

  return ctx;
}
```

**tests/helpers/mockAudio.ts**

```typescript
export function mockWebAudio() {
  const audioContextMock = {
    state: 'suspended',
    resume: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: { value: 1 },
    })),
  };

  global.AudioContext = vi.fn(() => audioContextMock) as any;
  global.Audio = vi.fn(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    volume: 1,
    muted: false,
    currentTime: 0,
  })) as any;

  return audioContextMock;
}
```

**tests/helpers/gameStateFactory.ts**

```typescript
import type { Asteroid, Bullet, Powerup } from '@/types';

export function createTestAsteroid(overrides: Partial<Asteroid> = {}): Asteroid {
  return {
    x: 100,
    y: 100,
    vx: 1,
    vy: 1,
    size: 40,
    sizeLevel: 2,
    points: 8,
    rotation: 0,
    rotationSpeed: 0.02,
    active: true,
    ...overrides,
  };
}

export function createTestBullet(overrides: Partial<Bullet> = {}): Bullet {
  return {
    x: 400,
    y: 300,
    vx: 0,
    vy: -5,
    active: true,
    ...overrides,
  };
}

export function createTestPowerup(overrides: Partial<Powerup> = {}): Powerup {
  return {
    x: 400,
    y: 100,
    vy: 2,
    type: 'shield',
    active: true,
    ...overrides,
  };
}
```

**tests/helpers/testUtils.ts**

```typescript
export function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export function advanceTime(ms: number) {
  vi.advanceTimersByTime(ms);
}

export function setupTestEnvironment() {
  // Reset all mocks
  vi.clearAllMocks();

  // Use fake timers
  vi.useFakeTimers();

  return () => {
    vi.useRealTimers();
  };
}
```

### 1.2 Update vitest.config.ts

Add coverage configuration:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts', '**/*.spec.ts', 'dist/', 'docs/'],
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@game': path.resolve(__dirname, './src/game'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

### 1.3 Create tests/setup.ts

```typescript
import { vi } from 'vitest';

// Mock canvas globally
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
})) as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 0;
});

global.cancelAnimationFrame = vi.fn();
```

### 1.4 Add npm Scripts

Update package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:watch": "vitest"
  }
}
```

## Part 2: Core Game System Tests

### 2.1 Game Loop Tests

**tests/game/gameLoop.test.ts**

Focus areas:

- Frame rate throttling works correctly
- Game loop updates entities when `gameState.value === 'PLAYING'`
- Game loop does NOT update when paused
- Proper orchestration: update → collision → render

Key test cases:

```typescript
describe('Game Loop', () => {
  it('should throttle frame rate to target FPS', () => {
    // Verify TIME_STEP constant is respected
  });

  it('should update entities when game state is PLAYING', () => {
    // Set gameState.value = 'PLAYING'
    // Verify update functions are called
  });

  it('should not update entities when game state is PAUSED', () => {
    // Set gameState.value = 'PAUSED'
    // Verify update functions are NOT called
  });

  it('should call render after updates', () => {
    // Verify render happens after entity updates
  });
});
```

### 2.2 Collision Detection Tests

**tests/systems/collisionHandler.test.ts**

Focus areas:

- Spatial grid correctly bins entities into cells
- Player-asteroid collisions detected
- Bullet-asteroid collisions detected with fragmentation
- Player-powerup collisions detected
- Performance: handles 100+ entities efficiently

Key test cases:

```typescript
describe('Collision Handler', () => {
  it('should detect player-asteroid collision', () => {
    // Create overlapping player and asteroid
    // Verify collision detected
  });

  it('should fragment asteroids when hit by bullet', () => {
    // Fire bullet at large asteroid
    // Verify 2-3 fragments created
  });

  it('should detect player-powerup pickup', () => {
    // Create overlapping player and powerup
    // Verify powerup collected
  });

  it('should bin entities into correct spatial grid cells', () => {
    // Place entities at known positions
    // Verify correct cell assignment
  });

  it('should handle 100+ entities without performance issues', () => {
    // Create 100 asteroids
    // Measure collision check time
    // Verify < 16ms budget
  });
});
```

### 2.3 Entity Tests

**tests/entities/player.test.ts**

Focus areas:

- Movement stays within canvas bounds
- `fireBullet()` respects cooldown
- Shield renders correctly
- Double blaster fires 2 bullets

**tests/entities/asteroid.test.ts**

Focus areas:

- `spawnAsteroid()` uses object pooling
- Asteroids update position correctly
- Fragmentation creates 2-3 smaller pieces
- Screen wrapping at boundaries
- Size-based scoring (large: 10, medium: 25, small: 50)

**tests/entities/bullet.test.ts**

Focus areas:

- `fireBullet()` uses object pooling
- Bullets move at correct velocity
- Out-of-bounds bullets removed
- Bullet lifespan enforced

**tests/entities/powerup.test.ts**

Focus areas:

- Random powerup type selection
- Fall speed and movement
- `activatePowerup()` applies correct effect
- Timer expiration and cleanup

### 2.4 Sound Manager Tests

**tests/systems/soundManager.test.ts**

Focus areas:

- Audio unlock flow (silent audio trick)
- `playSound()` clones and plays audio
- Volume control (0-1 range)
- Mute/unmute state
- Error handling for missing audio files

Mock the Web Audio API using `tests/helpers/mockAudio.ts`

## Part 3: Integration Tests

**tests/integration/gameFlow.test.ts**

One comprehensive integration test:

- Start game
- Spawn asteroid
- Fire bullet and destroy asteroid
- Verify score increases
- Collect powerup
- Verify powerup activates
- Take damage (lose life)
- Verify game over when lives = 0

This test verifies the full game loop works end-to-end.

## Success Criteria

✅ All test files created and passing
✅ Test coverage ≥ 50% (run `npm run test:coverage` to verify)
✅ No TypeScript errors in test files
✅ Tests use mocks appropriately (canvas, audio)
✅ Tests are deterministic (no flaky tests due to timing)
✅ Tests run in < 10 seconds total

## Implementation Notes

### Important Patterns to Follow

1. **Use existing types**: Import types from `@/types` - don't redefine
2. **Test in isolation**: Each test should be independent, use `beforeEach` for setup
3. **Mock external APIs**: Always mock canvas, audio, DOM elements
4. **Use fake timers**: For any time-dependent tests, use `vi.useFakeTimers()`
5. **Test behavior, not implementation**: Focus on observable outcomes

### Path Aliases

The project uses TypeScript path aliases:

- `@/` → `src/`
- `@core/` → `src/core/`
- `@game/` → `src/game/`
- `@entities/` → `src/entities/`
- `@systems/` → `src/systems/`
- `@utils/` → `src/utils/`

Use these in imports, they're configured in both tsconfig.json and vitest.config.ts.

### What NOT to Test Yet

- UI components (overlays, HUD) - Sprint 3
- Input handling - Sprint 3
- Full E2E scenarios - Sprint 3
- Performance benchmarks - Sprint 3

### Test Structure Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';

describe('Feature Name', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
  });

  afterEach(() => {
    cleanup();
  });

  it('should do something specific', () => {
    // Arrange: Set up test data
    // Act: Execute the behavior
    // Assert: Verify the outcome
  });
});
```

## Validation Checklist

Before marking Sprint 1 complete:

- [ ] Run `npm run test:coverage` - verify ≥50% coverage
- [ ] Run `npm run typecheck` - verify no TypeScript errors
- [ ] Run `npm run lint` - verify no linting errors
- [ ] All tests pass consistently (run 3 times to check for flakiness)
- [ ] Test helpers are reusable and well-documented
- [ ] Coverage report identifies which files still need tests

## Files to Create

```
tests/
├── setup.ts
├── helpers/
│   ├── mockCanvas.ts
│   ├── mockAudio.ts
│   ├── gameStateFactory.ts
│   └── testUtils.ts
├── game/
│   └── gameLoop.test.ts
├── systems/
│   └── collisionHandler.test.ts
├── entities/
│   ├── player.test.ts
│   ├── asteroid.test.ts
│   ├── bullet.test.ts
│   └── powerup.test.ts
├── integration/
│   └── gameFlow.test.ts
└── ... (more tests as coverage permits)
```

## Estimated Effort

20-30 hours of focused implementation

## Next Steps After Completion

Sprint 2 will refactor the architecture to improve testability, then Sprint 3 will add remaining tests to reach 85% coverage.
