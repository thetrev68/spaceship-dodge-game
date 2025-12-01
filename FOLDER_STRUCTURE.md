# Folder Structure

This document describes the new modular folder structure for the Spaceship Dodge Game codebase.

## Overview

The codebase is organized by domain concern rather than technical type, making it easier to navigate and maintain. Path aliases (`@core`, `@game`, etc.) are configured for cleaner imports.

## Structure

```
src/
├── core/           # Application bootstrap, global state, configuration
├── game/           # Game loop, state machine, level progression
├── entities/       # Game objects (player, asteroids, bullets, powerups)
├── systems/        # Cross-cutting concerns (collision, rendering, audio)
├── input/          # Input handling (desktop, mobile)
├── ui/             # User interface components
│   ├── overlays/   # Game overlays (start, pause, level transition, game over)
│   ├── hud/        # Heads-up display (score, lives, powerup timers)
│   └── controls/   # UI controls (audio controls)
├── effects/        # Visual effects (starfield background)
└── utils/          # Pure utility functions (math, platform detection, canvas)
```

## Module Categories

### core/ - Application Core (4 modules planned)
- **main.js** - Entry point, initialization
- **state.js** - Reactive state management
- **constants.js** - Game configuration constants
- **logger.js** - Debug logging utility

**Purpose:** Bootstrap the application, manage global state, provide configuration.

### game/ - Game Logic (4 modules planned)
- **gameLoop.js** - Main game loop orchestration
- **gameStateManager.js** - State transitions (START → PLAYING → PAUSED → GAME_OVER)
- **flowManager.js** - Level progression logic
- **levelConfig.js** (future) - Level definitions and difficulty scaling

**Purpose:** Control game flow, state machines, and progression rules.

### entities/ - Game Objects (5 modules planned)
- **player.js** - Player entity (update, draw, movement)
- **asteroid.js** - Asteroid entity (spawning, pooling, fragmentation)
- **bullet.js** - Bullet entity (pooling, update)
- **powerup.js** - Powerup entity (types, spawning, effects)
- **entity.js** (future) - Base entity interface/class

**Purpose:** Encapsulate game object behavior and rendering.

### systems/ - Cross-Cutting Systems (4 modules planned)
- **collisionHandler.js** - Collision detection (spatial grid, AABB)
- **renderManager.js** - Rendering orchestration
- **soundManager.js** - Audio system (BGM, SFX, muting)
- **poolManager.js** (future) - Generic object pooling

**Purpose:** Provide shared services used by multiple entities.

### input/ - Input Handling (3 modules planned)
- **inputManager.js** - Desktop input (keyboard, mouse)
- **mobileControls.js** - Mobile input (touch, drag)
- **inputMapper.js** (future) - Unified input abstraction

**Purpose:** Abstract input sources, handle platform-specific controls.

### ui/ - User Interface (10 modules planned)

#### ui/overlays/ - Game Overlays
- **overlayManager.js** (future) - Unified overlay management
- **startOverlay.js** (future) - Start screen
- **pauseOverlay.js** (future) - Pause screen
- **levelTransitionOverlay.js** (future) - Level up screen
- **gameOverOverlay.js** (future) - Game over screen

#### ui/hud/ - Heads-Up Display
- **scoreDisplay.js** - Score, lives, level HUD
- **scorePopups.js** - Floating score animations
- **powerupHUD.js** - Powerup timer display
- **hudManager.js** (future) - Coordinate all HUD elements

#### ui/controls/ - UI Controls
- **audioControls.js** - Audio UI controls (mute, volume)

**Purpose:** Manage all user-facing UI elements and overlays.

### effects/ - Visual Effects (1 module)
- **starfield.js** - Animated background starfield

**Purpose:** Decorative visual effects.

### utils/ - Utilities (3 modules planned)
- **mathUtils.js** (future) - Random range, clamping, vector math
- **canvasUtils.js** (future) - Canvas sizing, positioning helpers
- **platform.js** (future) - Platform detection (mobile, touch support)

**Purpose:** Pure utility functions with no game state dependencies.

## Path Aliases

Import modules using path aliases for clearer dependencies:

```javascript
// Instead of:
import { gameState } from './state.js';
import { playSound } from './soundManager.js';

// Use:
import { gameState } from '@core/state.js';
import { playSound } from '@systems/soundManager.js';
```

### Configured Aliases

- `@core` → `./src/core`
- `@game` → `./src/game`
- `@entities` → `./src/entities`
- `@systems` → `./src/systems`
- `@input` → `./src/input`
- `@ui` → `./src/ui`
- `@effects` → `./src/effects`
- `@utils` → `./src/utils`

**Configuration Files:**
- `vite.config.js` - Vite resolver
- `jsconfig.json` - VSCode IntelliSense
- `eslint.config.js` - ESLint import resolver (documentation)

## Benefits

1. **Faster Navigation**: Find files by domain concern (e.g., "powerup logic" → `entities/powerup.js`)
2. **Clear Dependencies**: Import paths indicate architectural layers (`@entities` → `@systems`)
3. **Better IDE Support**: Autocomplete groups by folder
4. **Scalability**: Easy to add new features without cluttering existing directories
5. **Separation of Concerns**: Each folder has a single, clear responsibility

## Migration Status

**Phase 1: Setup** ✅ COMPLETE
- [x] Folder structure created
- [x] Path aliases configured
- [x] ESLint updated
- [x] jsconfig.json added

**Phase 2-8: Migration** (In Progress)
- [x] Extract utilities to `utils/`
- [x] Move core modules to `core/`
- [x] Move game logic to `game/`
- [x] Move entities to `entities/`
- [x] Move systems to `systems/`
- [x] Move UI to `ui/`
- [x] Move input to `input/`
- [ ] Move effects to `effects/`

See [TECHNICAL_DEBT_ASSESSMENT.md](TECHNICAL_DEBT_ASSESSMENT.md) for full migration plan.

## Module Count

- **Current:** 21 modules in flat `src/` directory
- **Target:** ~34 modules across 8 organized directories
- **New Modules:** ~13 (utilities, managers, base classes)

## Guidelines

### When Adding New Code

1. **Entities**: Add to `entities/` if it's a game object with update/draw logic
2. **Systems**: Add to `systems/` if it's a shared service used by multiple entities
3. **UI**: Add to `ui/overlays/` or `ui/hud/` for user-facing elements
4. **Utilities**: Add to `utils/` for pure functions with no game state
5. **Game Logic**: Add to `game/` for state machines or progression rules

### Import Conventions

- Use **named imports** for specific functions (tree-shaking friendly)
- Use **namespace imports** (`import * as`) only when calling 5+ functions
- Use **path aliases** for all cross-directory imports
- Avoid **dynamic imports** except for code-splitting

### Examples

```javascript
// Good: Named import with path alias
import { debug, warn } from '@core/logger.js';

// Good: Namespace import for heavy usage
import * as soundManager from '@systems/soundManager.js';

// Bad: Relative path without context
import { debug } from '../logger.js';

// Bad: Dynamic import for circular dependency workaround
import('./soundManager.js').then(m => m.playSound('click'));
```

## Next Steps

Continue with Phase 2 of the migration:
1. Extract utility functions to `utils/`
2. Move `state.js`, `constants.js`, `logger.js` to `core/`
3. Update all import statements to use path aliases

See migration phases in [TECHNICAL_DEBT_ASSESSMENT.md](TECHNICAL_DEBT_ASSESSMENT.md) Section 4.
