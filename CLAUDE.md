# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spaceship Dodge is a browser-based arcade game built with vanilla JavaScript, Tailwind CSS v4, and Vite. Players pilot a vector-style spaceship, dodge/shoot asteroids, and progress through increasingly difficult levels. The game supports both desktop (mouse/keyboard) and mobile (touch) controls with full audio management.

## Development Commands

### Start Development Server
```bash
npm run dev
```
Runs Vite dev server on port 5173 with HTTPS (requires `localhost+2-key.pem` and `localhost+2.pem` certificates).

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

### Linting and Code Quality
```bash
npm run lint        # Check for ESLint issues
npm run lint:fix    # Auto-fix ESLint issues
npm run knip        # Find unused exports and dependencies
```

ESLint is configured for modern ES2022 modules with browser globals. Knip helps identify dead code and unused exports.

## Architecture

### Core Game Loop Pattern

The game uses a centralized game loop architecture with clear separation of concerns:

1. **State Management** ([src/state.js](src/state.js))
   - Uses a minimal reactive proxy pattern for game state
   - Centralized reactive values: `gameState`, `score`, `gameLevel`, `playerLives`
   - Global entity arrays: `bullets`, `obstacles`
   - Platform detection: `isMobile` constant determines mobile vs desktop behavior

2. **Game Loop** ([src/gameLoop.js](src/gameLoop.js))
   - Single `requestAnimationFrame` loop with FPS throttling (60 FPS target)
   - Orchestrates update/render cycle: update entities → check collisions → render
   - Pauses completely when `gameState.value !== 'PLAYING'`
   - Spawning logic gates asteroid creation based on `allowSpawning.value` reactive flag

3. **Render Manager** ([src/renderManager.js](src/renderManager.js))
   - Centralized rendering in `renderAll(ctx)` function
   - Single source of truth for draw call ordering and shared canvas styles
   - Only renders when `gameState.value === 'PLAYING'`

### Module Responsibilities

- **main.js**: Entry point, initializes canvas, sets up input handlers, manages audio unlock flow
- **gameStateManager.js**: Manages game state transitions (START → PLAYING → PAUSED → LEVEL_TRANSITION → GAME_OVER)
- **flowManager.js**: Handles level progression timing and gating (waits for obstacles to clear before level-up)
- **inputManager.js**: Desktop keyboard/mouse input handling
- **mobileControls.js**: Touch input handling with drag-to-move and tap-to-shoot
- **collisionHandler.js**: Collision detection between player/asteroids/bullets
- **soundManager.js**: Audio unlock, playback, volume, and mute management
- **player.js**: Player movement, drawing, and bullet firing logic
- **asteroid.js**: Asteroid pooling, spawning, movement, fragmentation on hit
- **bullet.js**: Bullet pool management and updates
- **powerups.js**: Power-up spawning, pickup detection, and effects (shield, double blaster)
- **ui.js**: Overlay management (start, pause, level transition, game over)
- **scoreDisplay.js**: HUD rendering (lives, level, score)
- **scorePopups.js**: Floating score text animations
- **domCache.js**: Cached DOM element references
- **constants.js**: All game configuration constants organized by category

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

**Desktop**:
- Mouse/keyboard input (WASD, arrows, spacebar)
- Faster spawn intervals (`BASE_SPAWN_INTERVAL_DESKTOP: 1500ms`)
- More complex asteroid shapes
- Animated starfield background
- Button-based UI interactions

### Configuration Constants

All configuration is centralized in [src/constants.js](src/constants.js):

- `GAME_CONFIG`: Frame rate, spawn margins
- `PLAYER_CONFIG`: Size, speed, shield radius
- `BULLET_CONFIG`: Speed, fire rate, cooldown
- `ASTEROID_CONFIG`: Sizes, speeds, score values, fragment behavior
- `POWERUP_CONFIG`: Duration timings
- `AUDIO_CONFIG`: Base volume, loop settings
- `VISUAL_CONFIG`: Colors, fonts, stroke widths
- `LEVEL_CONFIG`: Spawn intervals, difficulty scaling
- `DEV_CONFIG`: Debug flags

### Level Progression System

Levels advance based on time and obstacle clearing:

1. **Timer-based**: ~15 seconds per level (configurable)
2. **Gating**: Level-up waits until all asteroids are cleared from screen
3. **Difficulty Scaling**:
   - Spawn interval decreases by 70ms per level (capped at 300ms min)
   - Asteroid speed increases by 0.5 per level (capped at 3.0 max)
4. **Spawning Control**: `allowSpawning.value` reactive flag gates asteroid creation during transitions

### Vite Configuration Notes

- **Base Path**: `/spaceship-dodge-game/` for GitHub Pages
- **HTTPS Dev Server**: Requires local SSL certificates (`localhost+2-key.pem`, `localhost+2.pem`)
- **Environment**: Uses `import.meta.env.BASE_URL` for asset paths
- **HMR**: Overlay disabled in config

## Common Development Patterns

### Adding New Game Entities

1. Create entity update function in new module (e.g., `updateEnemies()`)
2. Create entity draw function (e.g., `drawEnemies()`)
3. Import and call update function in [src/gameLoop.js](src/gameLoop.js)
4. Import and call draw function in [src/renderManager.js](src/renderManager.js)
5. Add entity state to [src/state.js](src/state.js) if needed

### Adding New Sounds

1. Add audio file to `public/sounds/`
2. Add entry to `sounds` object in [src/soundManager.js](src/soundManager.js)
3. Call `playSound('soundName')` from game logic

### Modifying Game State Transitions

1. Update state value: `gameState.value = 'NEW_STATE'`
2. Call `showOverlay(stateName)` from [src/ui.js](src/ui.js)
3. Handle new state in overlay visibility logic
4. Add any state-specific cleanup/initialization

### Working with Reactive State

The minimal reactive system in [src/state.js](src/state.js) auto-notifies watchers:

```javascript
// Reactive values automatically trigger listeners
score.value = 100; // Updates HUD

// Watch for changes
score.watch(() => {
  console.log('Score changed:', score.value);
});
```

## Critical Implementation Details

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

Power-ups spawn every 10 seconds, fall from top of screen, and expire if not collected.

### Canvas Sizing

Canvas auto-resizes to viewport:
```javascript
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
```

Overlays use `setOverlayDimensions()` to maintain proper positioning.

## Known Technical Debt

1. **Level-up Delay**: Intentional gating waits for all fragments to clear (can feel slow)
2. **Audio Race Conditions**: Rapid pause/unpause may trigger extra SFX
3. **Collision Scoring**: Rare overlap if paused at exact collision frame
4. **Certificate Management**: Dev server requires manual SSL cert setup

## Testing Notes

No automated test suite currently exists. Manual testing checklist:

- Desktop: Mouse, WASD, Arrow keys, Spacebar, P key pause
- Mobile: Touch drag, tap to shoot, touch to resume
- Audio: Mute/unmute, volume slider, gesture unlock
- Collisions: Player hit, bullet hit, powerup pickup
- Progression: Level-up timing, difficulty scaling, score tracking
