# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spaceship Dodge is a browser-based arcade game built with TypeScript, Tailwind CSS v4, and Vite. Players pilot a vector-style spaceship, dodge/shoot asteroids, and progress through increasingly difficult levels. The game supports both desktop (mouse/keyboard) and mobile (touch) controls with full audio management.

**Recently refactored from vanilla JavaScript to TypeScript with a modular, domain-driven architecture for better scalability and maintainability.**

## Development Commands

### Start Development Server
```bash
npm run dev
```
Runs Vite dev server on port 5173.

### Build for Production
```bash
npm run build
```
Outputs to `dist/` directory. Base path is set to `/spaceship-dodge-game/` for GitHub Pages deployment.

### Preview Production Build
```bash
npm run preview
```

### Deploy to GitHub Pages
```bash
npm run deploy
```
Builds and deploys to `gh-pages` branch.

### Build Tailwind CSS
```bash
npm run build:css
```
Compiles Tailwind v4 styles from `src/input.css` to `styles/tailwind.css`.

### Type Checking
```bash
npm run typecheck         # Type check once
npm run typecheck:watch   # Type check in watch mode
```

### Linting and Code Quality
```bash
npm run lint        # Check for ESLint issues
npm run lint:fix    # Auto-fix ESLint issues
npm run knip        # Find unused exports and dependencies
```

ESLint is configured for TypeScript with typescript-eslint. Knip helps identify dead code and unused exports.

### Testing
```bash
npm run test        # Run tests with Vitest
```

### Generate Documentation
```bash
npm run docs        # Generate TypeDoc documentation
```

## Architecture

### Folder Structure

The codebase follows a modular, domain-driven structure with TypeScript. For detailed breakdown, see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md).

```
src/
├── core/           # Application bootstrap, global state, configuration
│   ├── main.ts           # Entry point
│   ├── state.ts          # Global reactive state
│   ├── constants.ts      # All configuration constants
│   ├── gameConstants.ts  # Game-specific constants
│   ├── uiConstants.ts    # UI-specific constants
│   └── logger.ts         # Logging utility
│
├── game/           # Game loop, state machine, level progression
│   ├── gameLoop.ts           # Main game loop (RAF)
│   ├── gameStateManager.ts  # State transitions
│   └── flowManager.ts        # Level progression logic
│
├── entities/       # Game objects (player, asteroids, bullets, powerups)
│   ├── player.ts
│   ├── asteroid.ts
│   ├── bullet.ts
│   └── powerup.ts
│
├── systems/        # Cross-cutting concerns (collision, rendering, audio)
│   ├── collisionHandler.ts  # Spatial grid collision detection
│   ├── renderManager.ts      # Centralized rendering
│   ├── soundManager.ts       # Audio management
│   └── poolManager.ts        # Object pooling
│
├── input/          # Input handling (desktop, mobile)
│   ├── inputManager.ts
│   └── mobileControls.ts
│
├── ui/             # User interface components
│   ├── overlays/
│   │   └── overlayManager.ts   # Start, pause, level transition overlays
│   ├── hud/
│   │   ├── scoreDisplay.ts     # Score, lives, level display
│   │   ├── scorePopups.ts      # Floating score text
│   │   ├── powerupHUD.ts       # Active powerup indicators
│   │   └── perfHUD.ts          # Performance metrics display
│   ├── controls/
│   │   └── audioControls.ts    # Volume and mute controls
│   └── settings/
│       ├── settingsManager.ts  # Settings persistence
│       └── settingsUI.ts       # Settings UI components
│
├── effects/        # Visual effects
│   └── starfield.ts
│
├── utils/          # Pure utility functions
│   ├── mathUtils.ts
│   ├── canvasUtils.ts
│   ├── dom.ts
│   └── platform.ts
│
└── types/          # TypeScript type definitions
    └── index.ts
```

### Core Game Loop Pattern

The game uses a centralized game loop architecture with clear separation of concerns:

1. **State Management** ([src/core/state.ts](src/core/state.ts))
   - Uses a minimal reactive proxy pattern for game state
   - Centralized reactive values: `gameState`, `score`, `gameLevel`, `playerLives`
   - Global entity arrays: `bullets`, `obstacles`, `powerups`
   - Platform detection: `isMobile` constant determines mobile vs desktop behavior

2. **Game Loop** ([src/game/gameLoop.ts](src/game/gameLoop.ts))
   - Single `requestAnimationFrame` loop with FPS throttling (60 FPS target)
   - Orchestrates update/render cycle: update entities → check collisions → render
   - Pauses completely when `gameState.value !== 'PLAYING'`
   - Spawning logic gates asteroid creation based on `allowSpawning.value` reactive flag

3. **Render Manager** ([src/systems/renderManager.ts](src/systems/renderManager.ts))
   - Centralized rendering in `renderAll(ctx)` function
   - Single source of truth for draw call ordering and shared canvas styles
   - Only renders when `gameState.value === 'PLAYING'`

4. **Collision Detection** ([src/systems/collisionHandler.ts](src/systems/collisionHandler.ts))
   - Uses spatial grid partitioning for O(n) collision detection
   - Efficiently handles large numbers of entities
   - Handles player-asteroid, bullet-asteroid, and player-powerup collisions

### Module Responsibilities

**Core**:
- **main.ts**: Entry point, initializes canvas, sets up input handlers, manages audio unlock flow
- **state.ts**: Reactive state management with watchers
- **constants.ts**: Master configuration file
- **gameConstants.ts**: Game-specific tuning values
- **uiConstants.ts**: UI-related constants
- **logger.ts**: Centralized logging with levels (debug, info, warn, error)

**Game**:
- **gameStateManager.ts**: Manages game state transitions (START → PLAYING → PAUSED → LEVEL_TRANSITION → GAME_OVER)
- **flowManager.ts**: Handles level progression timing and gating (waits for obstacles to clear before level-up)
- **gameLoop.ts**: Main RAF loop with FPS throttling

**Entities**:
- **player.ts**: Player movement, drawing, bullet firing logic
- **asteroid.ts**: Asteroid pooling, spawning, movement, fragmentation on hit
- **bullet.ts**: Bullet pool management and updates
- **powerup.ts**: Power-up spawning, pickup detection, effects (shield, double blaster)

**Systems**:
- **collisionHandler.ts**: Spatial grid collision detection
- **renderManager.ts**: Centralized rendering pipeline
- **soundManager.ts**: Audio unlock, playback, volume, mute management
- **poolManager.ts**: Generic object pooling system

**Input**:
- **inputManager.ts**: Desktop keyboard/mouse input handling
- **mobileControls.ts**: Touch input handling with drag-to-move and tap-to-shoot

**UI**:
- **overlayManager.ts**: Overlay management (start, pause, level transition, game over)
- **scoreDisplay.ts**: HUD rendering (lives, level, score)
- **scorePopups.ts**: Floating score text animations
- **powerupHUD.ts**: Active powerup status indicators
- **perfHUD.ts**: FPS and performance metrics display
- **audioControls.ts**: Volume slider and mute controls
- **settingsManager.ts**: Settings persistence (localStorage)
- **settingsUI.ts**: Settings UI components

**Utils**:
- **mathUtils.ts**: Math helpers (distance, angle calculations)
- **canvasUtils.ts**: Canvas drawing utilities
- **dom.ts**: Type-safe DOM helpers
- **platform.ts**: Platform detection utilities

**Effects**:
- **starfield.ts**: Animated starfield background

### State Flow Diagram

```
START → PLAYING → PAUSED → PLAYING
              ↓           ↗
        LEVEL_TRANSITION
              ↓
          GAME_OVER → START
```

### Audio System Architecture

The audio system requires gesture-based unlock due to browser autoplay policies:

1. **Unlock Flow**:
   - Silent audio trick (`silence.mp3`) plays on first user gesture
   - Sets `isAudioUnlocked = true` flag in soundManager
   - BGM only starts after unlock + unmute

2. **Sound Files** (in `public/sounds/`):
   - `bg-music.mp3`: Looping background music
   - `fire.mp3`: Laser shot sound
   - `break.mp3`: Asteroid destruction
   - `levelup.mp3`: Level progression
   - `gameover.mp3`: Death sound
   - `silence.mp3`: Silent unlock file

3. **API**:
   - `forceAudioUnlock()`: Attempts silent audio unlock
   - `startMusic()`: Starts BGM if unlocked and not muted
   - `playSound(name)`: Clones and plays SFX
   - `setVolume(val)`: Updates volume (0-1 range)
   - `muteAll()` / `unmuteAll()`: Toggle mute state

### Mobile vs Desktop Differences

The game adapts behavior based on `isMobile` flag:

**Mobile**:
- Touch events for movement/shooting/pause
- Increased spawn intervals (`BASE_SPAWN_INTERVAL_MOBILE: 2400ms`)
- Simplified asteroid shapes (max 5 points vs 11)
- No starfield background
- Touch overlay handlers for pause/level-transition resume
- FPS capping for performance

**Desktop**:
- Mouse/keyboard input (WASD, arrows, spacebar)
- Faster spawn intervals (`BASE_SPAWN_INTERVAL_DESKTOP: 1500ms`)
- More complex asteroid shapes
- Animated starfield background
- Button-based UI interactions

### Configuration Constants

All configuration is centralized in three constant files:

**[src/core/constants.ts](src/core/constants.ts)** - Master configuration:
- Re-exports from gameConstants and uiConstants
- Central import point for all constants

**[src/core/gameConstants.ts](src/core/gameConstants.ts)** - Game-specific:
- `GAME_CONFIG`: Frame rate, spawn margins
- `PLAYER_CONFIG`: Size, speed, shield radius
- `BULLET_CONFIG`: Speed, fire rate, cooldown
- `ASTEROID_CONFIG`: Sizes, speeds, score values, fragment behavior
- `POWERUP_CONFIG`: Duration timings, spawn rates
- `AUDIO_CONFIG`: Base volume, loop settings
- `LEVEL_CONFIG`: Spawn intervals, difficulty scaling
- `COLLISION_CONFIG`: Spatial grid settings
- `DEV_CONFIG`: Debug flags, performance metrics

**[src/core/uiConstants.ts](src/core/uiConstants.ts)** - UI-specific:
- `VISUAL_CONFIG`: Colors, fonts, stroke widths
- `UI_CONFIG`: Overlay settings, animations

### Level Progression System

Levels advance based on time and obstacle clearing:

1. **Timer-based**: ~15 seconds per level (configurable)
2. **Gating**: Level-up waits until all asteroids are cleared from screen
3. **Difficulty Scaling**:
   - Spawn interval decreases by 70ms per level (capped at 300ms min)
   - Asteroid speed increases by 0.5 per level (capped at 3.0 max)
4. **Spawning Control**: `allowSpawning.value` reactive flag gates asteroid creation during transitions

### TypeScript Integration

The project uses TypeScript throughout with:
- Strict type checking enabled
- JSDoc comments for documentation
- Type definitions in `src/types/index.ts`
- Type-safe DOM helpers in `src/utils/dom.ts`
- Vite environment types in `src/vite-env.d.ts`

### Vite Configuration Notes

- **Base Path**: `/spaceship-dodge-game/` for GitHub Pages
- **Environment**: Uses `import.meta.env.BASE_URL` for asset paths
- **HMR**: Overlay disabled in config
- **TypeScript**: Full TypeScript support via Vite

## Common Development Patterns

### Adding New Game Entities

1. Create entity module in `src/entities/` (e.g., `enemy.ts`)
2. Define entity type in `src/types/index.ts`
3. Create update function (e.g., `updateEnemies()`)
4. Create draw function (e.g., `drawEnemies()`)
5. Import and call update function in [src/game/gameLoop.ts](src/game/gameLoop.ts)
6. Import and call draw function in [src/systems/renderManager.ts](src/systems/renderManager.ts)
7. Add entity state to [src/core/state.ts](src/core/state.ts) if needed
8. Add entity constants to [src/core/gameConstants.ts](src/core/gameConstants.ts)

### Adding New Sounds

1. Add audio file to `public/sounds/`
2. Add entry to `sounds` object in [src/systems/soundManager.ts](src/systems/soundManager.ts)
3. Call `playSound('soundName')` from game logic

### Modifying Game State Transitions

1. Update state value: `gameState.value = 'NEW_STATE'`
2. Handle new state in [src/ui/overlays/overlayManager.ts](src/ui/overlays/overlayManager.ts)
3. Add any state-specific cleanup/initialization in [src/game/gameStateManager.ts](src/game/gameStateManager.ts)

### Working with Reactive State

The minimal reactive system in [src/core/state.ts](src/core/state.ts) auto-notifies watchers:

```typescript
// Reactive values automatically trigger listeners
score.value = 100; // Updates HUD

// Watch for changes
score.watch(() => {
  console.log('Score changed:', score.value);
});
```

### Adding New Configuration

1. Add constant to appropriate section in [src/core/gameConstants.ts](src/core/gameConstants.ts) or [src/core/uiConstants.ts](src/core/uiConstants.ts)
2. Export from [src/core/constants.ts](src/core/constants.ts)
3. Use TypeScript for type safety

### Using the Logger

The centralized logger supports multiple levels:

```typescript
import { log } from '@core/logger';

log.debug('Detailed debug info');
log.info('General information');
log.warn('Warning message');
log.error('Error message', errorObject);
```

See [LOGGER_USAGE.md](./LOGGER_USAGE.md) for detailed documentation.

## Critical Implementation Details

### Spatial Grid Collision Detection

The collision system uses spatial partitioning for efficient collision detection:
- Grid cells divide the canvas into regions
- Entities are binned into cells based on position
- Only entities in same/adjacent cells are tested
- O(n) performance instead of O(n²)

### Asteroid Fragmentation Logic

When an asteroid is hit:
1. If size level > 0, spawns 2-3 smaller fragments
2. Fragments inherit parent velocity + random angle offset
3. Fragments have increased speed multiplier (0.3x parent speed)
4. Bonus score awarded when all fragments of a parent are cleared

### Power-up System

Two power-up types:
- **Shield**: 5 second invulnerability, visual glow effect
- **Double Blaster**: 10 second dual-bullet firing

Power-ups spawn periodically, fall from top of screen, and expire if not collected.

### Object Pooling

The game uses object pooling for performance:
- Bullets and asteroids are pooled and reused
- Generic `poolManager.ts` provides pooling utilities
- Reduces garbage collection pressure
- Improves performance on mobile

### Canvas Sizing

Canvas auto-resizes to viewport:
```typescript
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
```

Overlays use `setOverlayDimensions()` to maintain proper positioning.

## TypeScript Patterns

### Type Definitions

Core types are defined in [src/types/index.ts](src/types/index.ts):
- `GameState`: Game state enum
- `Asteroid`, `Bullet`, `Powerup`: Entity interfaces
- `ReactiveValue<T>`: Reactive state type
- Canvas and DOM types

### Type-Safe DOM Access

Use helpers from [src/utils/dom.ts](src/utils/dom.ts):

```typescript
import { getElementById, queryElement } from '@utils/dom';

const canvas = getElementById<HTMLCanvasElement>('gameCanvas');
const button = queryElement<HTMLButtonElement>('.start-button');
```

### Strict Null Checks

The codebase uses strict null checks. Always handle nullable values:

```typescript
const element = document.getElementById('foo');
if (element) {
  // Safe to use element here
  element.textContent = 'bar';
}
```

## Performance Optimization

### Mobile Performance

- FPS capping when needed
- Simplified rendering (no starfield)
- Reduced asteroid complexity
- Longer spawn intervals
- Object pooling

### Desktop Performance

- Spatial grid collision detection
- RequestAnimationFrame with throttling
- Canvas clearing optimizations
- Efficient rendering pipeline

### Performance Monitoring

Enable performance HUD:
```typescript
// Set in core/gameConstants.ts
DEV_CONFIG: {
  SHOW_PERFORMANCE_METRICS: true
}
```

## Known Technical Debt

1. **Level-up Delay**: Intentional gating waits for all fragments to clear (can feel slow)
2. **Audio Race Conditions**: Rapid pause/unpause may trigger extra SFX
3. **Collision Scoring**: Rare overlap if paused at exact collision frame

See [TECHNICAL_DEBT_ASSESSMENT.md](./TECHNICAL_DEBT_ASSESSMENT.md) for comprehensive analysis.

## Testing

### Manual Testing Checklist

- Desktop: Mouse, WASD, Arrow keys, Spacebar, P key pause
- Mobile: Touch drag, tap to shoot, touch to resume
- Audio: Mute/unmute, volume slider, gesture unlock
- Collisions: Player hit, bullet hit, powerup pickup
- Progression: Level-up timing, difficulty scaling, score tracking
- Settings: Persistence across sessions

### Automated Testing

Vitest is configured for unit testing:

```bash
npm run test
```

Tests are located alongside source files or in `__tests__` directories.

## Documentation

### Core Documentation

- **[DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)**: **START HERE** - Comprehensive developer onboarding guide covering architecture, development workflow, testing, debugging, and common tasks
- **[GAME_DESIGN.md](./docs/GAME_DESIGN.md)**: Game design document with mechanics, difficulty tuning, and future enhancements
- **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)**: Detailed folder structure and module organization
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Contribution guidelines and code standards

### Architecture Decision Records (ADRs)

Located in `docs/architecture/decisions/`, these documents explain **why** key architectural decisions were made:

- **[ADR-001: Custom Reactive State](./docs/architecture/decisions/ADR-001-custom-reactive-state.md)** - Why we built a custom reactive system instead of using MobX/Zustand
- **[ADR-002: Spatial Grid Collision](./docs/architecture/decisions/ADR-002-spatial-grid-collision.md)** - Why spatial grid over quadtree for collision detection
- **[ADR-003: Object Pooling](./docs/architecture/decisions/ADR-003-object-pooling.md)** - Object pooling strategy for bullets and asteroids
- **[ADR-004: Fixed Timestep Game Loop](./docs/architecture/decisions/ADR-004-fixed-timestep-game-loop.md)** - Fixed timestep with accumulator pattern rationale
- **[ADR-005: TypeScript Strict Mode](./docs/architecture/decisions/ADR-005-typescript-strict-mode.md)** - TypeScript strict mode configuration and benefits

### Technical References

- **[UPGRADE_NOTES.md](./UPGRADE_NOTES.md)**: Migration notes from vanilla JS to TypeScript
- **[LOGGER_USAGE.md](./LOGGER_USAGE.md)**: Centralized logger API and usage patterns
- **[TECHNICAL_DEBT_ASSESSMENT.md](./TECHNICAL_DEBT_ASSESSMENT.md)**: Known technical debt and mitigation strategies
- **TypeDoc**: Generate API documentation with `npm run docs`

### Documentation Standards

When adding new features or modifying existing code, follow these documentation standards:

#### 1. Inline Documentation
- **Complex algorithms** must have comprehensive JSDoc explaining:
  - Algorithm rationale (why this approach?)
  - Performance characteristics (Big O notation, benchmarks)
  - Trade-offs (pros/cons)
  - Example usage
- See [collisionHandler.ts](./src/systems/collisionHandler.ts), [gameLoop.ts](./src/game/gameLoop.ts), and [poolManager.ts](./src/systems/poolManager.ts) for examples

#### 2. JSDoc for Public APIs
All exported functions/classes must have JSDoc with:
- **Summary** - One-line description
- **@param** - Each parameter with type and description
- **@returns** - Return value description
- **@throws** - Documented exceptions (if any)
- **@example** - Usage example (especially for complex APIs)

Example:
```typescript
/**
 * Spawns a new asteroid at a random edge position
 *
 * @param canvasWidth - Canvas width for boundary calculation
 * @param canvasHeight - Canvas height for boundary calculation
 * @param speedMultiplier - Velocity scale factor (increases per level)
 * @returns The spawned asteroid, or null if pool exhausted
 *
 * @example
 * ```typescript
 * const asteroid = spawnAsteroid(800, 600, 1.5);
 * if (asteroid) entityState.addObstacle(asteroid);
 * ```
 */
export function spawnAsteroid(
  canvasWidth: number,
  canvasHeight: number,
  speedMultiplier: number = 1.0
): Asteroid | null {
  // Implementation...
}
```

#### 3. Architecture Decision Records (ADRs)
When making significant architectural choices, create an ADR:
- Use the [ADR template](./docs/architecture/decisions/ADR-TEMPLATE.md)
- Explain **context**, **decision**, **rationale**, **consequences**, and **alternatives**
- Link related code files and issues

#### 4. Configuration Constants
All magic numbers must be extracted to [gameConstants.ts](./src/core/gameConstants.ts) or [uiConstants.ts](./src/core/uiConstants.ts) with:
- Descriptive constant names (ALL_CAPS_SNAKE_CASE)
- Inline comments explaining purpose
- Organized into logical groups

#### 5. Code Comments
- **Avoid obvious comments** ("increment i" is redundant)
- **Explain WHY, not WHAT** - Code shows what, comments explain why
- **Document edge cases** - Unusual conditions or workarounds
- **Mark TODOs** - Use `// TODO: description` for future improvements

## Common Tasks

### Debugging

1. Enable debug mode in `src/core/gameConstants.ts`:
   ```typescript
   DEV_CONFIG: {
     DEBUG_MODE: true,
     SHOW_PERFORMANCE_METRICS: true
   }
   ```

2. Use the logger:
   ```typescript
   import { log } from '@core/logger';
   log.debug('Debug message', { data });
   ```

### Adding New Powerups

1. Define powerup type in `src/types/index.ts`
2. Add configuration to `POWERUP_CONFIG` in `src/core/gameConstants.ts`
3. Implement spawn logic in `src/entities/powerup.ts`
4. Add effect handling in player collision logic
5. Add visual indicator in `src/ui/hud/powerupHUD.ts`

### Modifying Difficulty

Adjust values in `src/core/gameConstants.ts`:
- `LEVEL_CONFIG.BASE_SPAWN_INTERVAL_*`: Spawn rate
- `LEVEL_CONFIG.SPAWN_INTERVAL_DECREASE_PER_LEVEL`: Difficulty ramp
- `ASTEROID_CONFIG`: Asteroid speed/size/score
- `PLAYER_CONFIG`: Player health/speed

### Changing Visual Style

1. Update colors in `src/core/uiConstants.ts` (`VISUAL_CONFIG`)
2. Modify canvas drawing in respective entity/system files
3. Adjust Tailwind classes in HTML/overlay management

## Version History

- **v1.1.0+**: TypeScript migration, modular architecture, spatial grid collisions
- **v1.0.0**: Initial vanilla JavaScript version

## Repository

[https://github.com/thetrev68/spaceship-dodge-game](https://github.com/thetrev68/spaceship-dodge-game)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.
