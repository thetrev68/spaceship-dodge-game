# Logger Usage Guide

The centralized logger utility provides structured, categorized logging with configurable levels and colors.

## Quick Start

```typescript
import { debug, info, warn, error } from '@core/logger.js';

// Basic usage with categories
debug('audio', 'Audio system initialized');
info('game', 'Level completed', { level: 5, score: 1000 });
warn('collision', 'Near miss detected');
error('network', 'Failed to load asset', err);
```

## Features

### Log Levels

- **DEBUG**: Detailed diagnostic information (disabled in production by default)
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues (default minimum level)
- **ERROR**: Error messages for failures

### Categories

Predefined categories for organized logging:

- `audio` - Audio system events (purple)
- `game` - Game state and flow (green)
- `input` - User input events (blue)
- `collision` - Collision detection (orange)
- `ui` - UI and overlay events (cyan)
- `powerup` - Power-up system (yellow)
- `level` - Level progression (light green)
- `render` - Rendering operations (gray, disabled by default)
- `perf` - Performance metrics (pink)
- `error` - Error handling (custom category)

### Browser Console Output

Logs are formatted with:

- **Timestamps** - `[HH:MM:SS.mmm]`
- **Color-coded categories** - Visual identification
- **Level indicators** - `[DEBUG]`, `[INFO]`, `[WARN]`, `[ERROR]`

Example output:

```
[19:30:15.342][audio][DEBUG] soundManager BASE_URL /spaceship-dodge-game/
[19:30:15.445][game][DEBUG] init running — DOM loaded
[19:30:16.123][audio][INFO] BGM playback started
```

## Advanced Usage

### Scoped Logger

Create a category-specific logger:

```typescript
import { logger } from '@core/logger.js';

const log = logger.createLogger('powerup');

log.debug('Shield spawned');
log.info('Double blaster activated');
log.warn('Power-up expired');
log.error('Failed to apply effect');
```

Note: The `createLogger` function is available but not exported by default. Use direct imports for most cases.

### Performance Timing

```typescript
import { logger } from '@core/logger.js';

function processCollisions() {
  const timer = logger.timer('Collision detection', 'collision');

  // ... your code ...

  timer.end(); // Logs: [collision][DEBUG] Collision detection took 2.34ms
}
```

### Configuration

```typescript
import { logger } from '@core/logger.js';

// Disable all logging (production)
logger.setEnabled(false);

// Set minimum log level (only show WARN and ERROR)
logger.setLevel('WARN');
logger.setLevel(logger.LogLevel.WARN); // or use enum

// Enable/disable specific categories
logger.setCategory('render', false); // Disable verbose render logs
logger.setCategory('audio', true); // Enable audio logs

// Toggle timestamps and colors
logger.setTimestamps(false);
logger.setColors(false);

// Get current configuration
const config = logger.getConfig();

// Reset to defaults
logger.reset();
```

## TypeScript Support

The logger is fully TypeScript-native with type-safe categories and methods.

```typescript
import { debug, info, warn, error, logger } from '@core/logger.js';

// TypeScript will autocomplete and type-check categories
debug('audio', 'Sound loaded successfully');
info('game', 'Player scored', { points: 100 });
warn('collision', 'High collision count detected');
error('ui', 'Failed to render overlay', errorObject);

// Access logger configuration with full type safety
const config = logger.getConfig();
console.log(config.level); // number
console.log(config.enabled); // boolean
```

## Environment Auto-Configuration

The logger automatically configures based on Vite environment:

- **Production** (`import.meta.env.MODE === 'production'`): Logging disabled
- **Development**: Logging enabled, minimum level WARN, render category disabled

## Migration from console.log

Before:

```javascript
console.log('[DEBUG] Starting game');
console.warn('[WARN] Audio unlock failed:', err);
console.error('[ERROR] Canvas not found');
```

After:

```typescript
import { debug, warn, error } from '@core/logger.js';

debug('game', 'Starting game');
warn('audio', 'Audio unlock failed:', err);
error('ui', 'Canvas not found');
```

## Best Practices

1. **Choose appropriate levels**:
   - `debug()` for detailed tracing (development only)
   - `info()` for significant events
   - `warn()` for recoverable issues
   - `error()` for failures

2. **Use meaningful categories**: Match the system component

3. **Include context**: Pass objects as additional parameters

   ```typescript
   debug('game', 'Player hit', {
     lives: playerLives.value,
     position: { x: player.x, y: player.y },
   });
   ```

4. **Avoid logging in tight loops**: Use timers instead

   ```typescript
   // Bad
   obstacles.forEach((o) => debug('render', 'Drawing obstacle', o));

   // Good
   const timer = logger.timer('Drawing obstacles', 'render');
   obstacles.forEach((o) => drawObstacle(o));
   timer.end();
   ```

5. **Disable verbose categories in production**:

   ```typescript
   logger.setCategory('render', false);
   logger.setCategory('input', false);
   ```

6. **Use path aliases**: Import from `@core/logger.js` (configured in tsconfig.json)

## Module Location

The logger is located at:

- **Source**: [src/core/logger.ts](src/core/logger.ts)
- **Path alias**: `@core/logger.js` (note: use `.js` extension even though source is `.ts`)

## Current Implementation Status

✅ Logger module fully TypeScript-native
✅ Integrated throughout the codebase:

- [src/systems/soundManager.ts](src/systems/soundManager.ts) - Audio category
- [src/core/main.ts](src/core/main.ts) - Game and UI categories
- [src/game/flowManager.ts](src/game/flowManager.ts) - Level category
- [src/input/mobileControls.ts](src/input/mobileControls.ts) - Input category
- [src/utils/errors.ts](src/utils/errors.ts) - Error handling
- [src/core/state/entityState.ts](src/core/state/entityState.ts) - Entity warnings
- [src/ui/settings/settingsManager.ts](src/ui/settings/settingsManager.ts) - Settings
- [src/services/ServiceProvider.ts](src/services/ServiceProvider.ts) - Service initialization

✅ **All modules now use TypeScript logger**

## Bundle Impact

- **Size**: ~2.5 KB minified (~1 KB gzipped)
- **Performance**: Negligible overhead when logging disabled
- **Tree-shaking**: Unused functions eliminated in production builds
- **Type safety**: Full TypeScript type checking at compile time

## Example Usage Patterns

### Error Handling

```typescript
import { error as logError, warn as logWarn } from '@core/logger.js';

try {
  await loadAsset();
} catch (err) {
  logError('audio', 'Failed to load sound', err);
}
```

### Conditional Logging with Aliases

```typescript
import { debug, info } from '@core/logger.js';

export function initializeCanvas(): HTMLCanvasElement {
  debug('ui', 'Initializing canvas');
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

  if (!canvas) {
    throw new CanvasError('Canvas element not found');
  }

  info('ui', 'Canvas initialized successfully', {
    width: canvas.width,
    height: canvas.height,
  });

  return canvas;
}
```

### Settings Persistence

```typescript
import { debug, warn } from '@core/logger.js';

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    debug('ui', 'Settings saved', settings);
  } catch (err) {
    warn('ui', 'Failed to save settings to localStorage', err);
  }
}
```
