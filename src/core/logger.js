/**
 * logger.js
 * Centralized debug logging utility with configurable levels and categories
 * Created: 2025-11-30
 */

// Log levels
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

// Configuration
const config = {
  level: LogLevel.DEBUG, // Current minimum level to log
  enabled: true, // Master switch
  categories: {
    // Category-specific overrides (true = enabled, false = disabled)
    audio: true,
    game: true,
    input: true,
    collision: true,
    ui: true,
    powerup: true,
    level: true,
    render: false, // Usually too verbose
  },
  timestamps: true, // Include timestamps
  colors: true, // Use console colors (browser-only)
};

// Color codes for browser console
const colors = {
  DEBUG: '#888',
  INFO: '#0af',
  WARN: '#fa0',
  ERROR: '#f44',
  audio: '#9c27b0',
  game: '#4caf50',
  input: '#2196f3',
  collision: '#ff5722',
  ui: '#00bcd4',
  powerup: '#ffc107',
  level: '#8bc34a',
  render: '#607d8b',
};

/**
 * Format timestamp for log output
 */
function getTimestamp() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

/**
 * Core logging function
 */
function log(level, category, message, ...args) {
  // Check if logging is enabled
  if (!config.enabled) return;

  // Check log level
  if (level < config.level) return;

  // Check category filter
  if (category && config.categories[category] === false) return;

  const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level) || 'LOG';
  const timestamp = config.timestamps ? `[${getTimestamp()}]` : '';
  const categoryTag = category ? `[${category}]` : '';
  const prefix = `${timestamp}${categoryTag}[${levelName}]`;

  // Use colors in browser console
  if (config.colors && typeof window !== 'undefined') {
    const categoryColor = colors[category] || '#888';
    const levelColor = colors[levelName] || '#888';

    console.log(
      `%c${timestamp}%c${categoryTag}%c[${levelName}]%c ${message}`,
      'color: #888',
      `color: ${categoryColor}; font-weight: bold`,
      `color: ${levelColor}; font-weight: bold`,
      'color: inherit',
      ...args
    );
  } else {
    // Fallback for Node.js or when colors disabled
    console.log(`${prefix} ${message}`, ...args);
  }
}

/**
 * Public API - Debug level
 */
export function debug(category, message, ...args) {
  log(LogLevel.DEBUG, category, message, ...args);
}

/**
 * Public API - Info level
 */
export function info(category, message, ...args) {
  log(LogLevel.INFO, category, message, ...args);
}

/**
 * Public API - Warning level
 */
export function warn(category, message, ...args) {
  log(LogLevel.WARN, category, message, ...args);
}

/**
 * Public API - Error level
 */
export function error(category, message, ...args) {
  log(LogLevel.ERROR, category, message, ...args);
}

/**
 * Configuration helpers
 */
export const logger = {
  // Enable/disable logging globally
  setEnabled(enabled) {
    config.enabled = enabled;
  },

  // Set minimum log level
  setLevel(level) {
    if (typeof level === 'string') {
      config.level = LogLevel[level.toUpperCase()] ?? LogLevel.DEBUG;
    } else {
      config.level = level;
    }
  },

  // Enable/disable specific category
  setCategory(category, enabled) {
    config.categories[category] = enabled;
  },

  // Enable/disable timestamps
  setTimestamps(enabled) {
    config.timestamps = enabled;
  },

  // Enable/disable colors
  setColors(enabled) {
    config.colors = enabled;
  },

  // Get current configuration
  getConfig() {
    return { ...config };
  },

  // Reset to defaults
  reset() {
    config.level = LogLevel.DEBUG;
    config.enabled = true;
    config.timestamps = true;
    config.colors = true;
    Object.keys(config.categories).forEach(cat => {
      config.categories[cat] = true;
    });
  },

  // Expose log levels for external use
  LogLevel,
};

/**
 * Quick setup for production
 */
export function setupProduction() {
  logger.setEnabled(false);
}

/**
 * Quick setup for development
 */
export function setupDevelopment() {
  logger.setEnabled(true);
  logger.setLevel(LogLevel.DEBUG);
  logger.setCategory('render', false); // Too verbose
}

/**
 * Performance timer utility
 */
export class Timer {
  constructor(category, label) {
    this.category = category;
    this.label = label;
    this.startTime = performance.now();
  }

  end() {
    const duration = performance.now() - this.startTime;
    debug(this.category, `${this.label} took ${duration.toFixed(2)}ms`);
    return duration;
  }
}

/**
 * Create a scoped logger for a specific category
 */
export function createLogger(category) {
  return {
    debug: (message, ...args) => debug(category, message, ...args),
    info: (message, ...args) => info(category, message, ...args),
    warn: (message, ...args) => warn(category, message, ...args),
    error: (message, ...args) => error(category, message, ...args),
    timer: (label) => new Timer(category, label),
  };
}

// Auto-configure based on environment
if (import.meta.env?.MODE === 'production') {
  setupProduction();
} else {
  setupDevelopment();
}
