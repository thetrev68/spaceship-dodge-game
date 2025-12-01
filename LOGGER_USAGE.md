# Logger Usage Guide

The centralized logger utility provides structured, categorized logging with configurable levels and colors.

## Quick Start

```javascript
import { debug, info, warn, error } from './logger.js';

// Basic usage with categories
debug('audio', 'Audio system initialized');
info('game', 'Level completed', { level: 5, score: 1000 });
warn('collision', 'Near miss detected');
error('network', 'Failed to load asset', err);
```

## Features

### Log Levels
- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
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

```javascript
import { createLogger } from './logger.js';

const log = createLogger('powerup');

log.debug('Shield spawned');
log.info('Double blaster activated');
log.warn('Power-up expired');
log.error('Failed to apply effect');
```

### Performance Timing

```javascript
import { Timer } from './logger.js';

function processCollisions() {
  const timer = new Timer('collision', 'Collision detection');

  // ... your code ...

  timer.end(); // Logs: [collision][DEBUG] Collision detection took 2.34ms
}

// Or with scoped logger:
const log = createLogger('render');
const timer = log.timer('Draw asteroids');
// ... rendering code ...
timer.end();
```

### Configuration

```javascript
import { logger } from './logger.js';

// Disable all logging (production)
logger.setEnabled(false);

// Set minimum log level (only show WARN and ERROR)
logger.setLevel('WARN');
logger.setLevel(logger.LogLevel.WARN); // or use enum

// Enable/disable specific categories
logger.setCategory('render', false); // Disable verbose render logs
logger.setCategory('audio', true);   // Enable audio logs

// Toggle timestamps and colors
logger.setTimestamps(false);
logger.setColors(false);

// Reset to defaults
logger.reset();
```

### Quick Setups

```javascript
import { setupProduction, setupDevelopment } from './logger.js';

// Production mode: logging disabled
setupProduction();

// Development mode: all logs enabled, render disabled
setupDevelopment();
```

## Environment Auto-Configuration

The logger automatically configures based on Vite environment:

- **Production** (`import.meta.env.MODE === 'production'`): Logging disabled
- **Development**: All logging enabled, render category disabled by default

## Migration from console.log

Before:
```javascript
console.log('[DEBUG] Starting game');
console.warn('[WARN] Audio unlock failed:', err);
console.error('[ERROR] Canvas not found');
```

After:
```javascript
import { debug, warn, error } from './logger.js';

debug('game', 'Starting game');
warn('audio', 'Audio unlock failed:', err);
error('ui', 'Canvas not found');
```

## Best Practices

1. **Choose appropriate levels**:
   - `debug()` for detailed tracing
   - `info()` for significant events
   - `warn()` for recoverable issues
   - `error()` for failures

2. **Use meaningful categories**: Match the system component

3. **Include context**: Pass objects as additional parameters
   ```javascript
   debug('game', 'Player hit', { lives: playerLives.value, position: { x: player.x, y: player.y } });
   ```

4. **Avoid logging in tight loops**: Use timers instead
   ```javascript
   // Bad
   obstacles.forEach(o => debug('render', 'Drawing obstacle', o));

   // Good
   const timer = new Timer('render', `Drawing ${obstacles.length} obstacles`);
   obstacles.forEach(o => drawObstacle(o));
   timer.end();
   ```

5. **Disable verbose categories in production**:
   ```javascript
   logger.setCategory('render', false);
   logger.setCategory('input', false);
   ```

## TypeScript Support

The logger is written in vanilla JavaScript but provides clear patterns for TypeScript projects:

```typescript
import { debug, info, warn, error, createLogger, Timer } from './logger.js';

type LogCategory = 'audio' | 'game' | 'input' | 'collision' | 'ui' | 'powerup' | 'level' | 'render';

const log = createLogger('game' as LogCategory);
```

## Current Implementation Status

✅ Logger module created ([src/logger.js](src/logger.js))
✅ Integrated into:
- [src/soundManager.js](src/soundManager.js) - Audio category
- [src/main.js](src/main.js) - Game and UI categories
- [src/player.js](src/player.js) - Game category

⏳ Pending integration:
- Flow manager (level category)
- Mobile controls (input category)
- Collision handler (collision category)
- Other modules as needed

## Bundle Impact

- **Size**: ~2.5 KB minified (~1 KB gzipped)
- **Performance**: Negligible overhead when logging disabled
- **Tree-shaking**: Unused functions eliminated in production builds
