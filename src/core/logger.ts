/**
 * @fileoverview Centralized debug logging utility with configurable levels and categories.
 */

export type LogCategory = 'audio' | 'game' | 'input' | 'collision' | 'ui' | 'powerup' | 'level' | 'render';
export type LogLevelKey = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

export const LogLevel: Record<LogLevelKey, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

type LoggerConfig = {
  level: number;
  enabled: boolean;
  categories: Record<string, boolean>;
  timestamps: boolean;
  colors: boolean;
};

const config: LoggerConfig = {
  level: LogLevel.WARN,
  enabled: true,
  categories: {
    audio: true,
    game: true,
    input: true,
    collision: true,
    ui: true,
    powerup: true,
    level: true,
    render: false,
  },
  timestamps: true,
  colors: true,
};

const colors: Record<string, string> = {
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

const log = (level: number, category: LogCategory | string, message: string, ...args: unknown[]): void => {
  if (!config.enabled) return;
  if (level < config.level) return;
  if (category && config.categories[category] === false) return;

  const levelName = (Object.keys(LogLevel) as LogLevelKey[]).find((key) => LogLevel[key] === level) ?? 'DEBUG';
  const timestamp = config.timestamps ? `[${getTimestamp()}]` : '';
  const categoryTag = category ? `[${category}]` : '';

  if (config.colors && typeof window !== 'undefined') {
    const categoryColor = colors[category] ?? '#888';
    const levelColor = colors[levelName] ?? '#888';

    console.log(
      `%c${timestamp}%c${categoryTag}%c[${levelName}]%c ${message}`,
      'color: #888',
      `color: ${categoryColor}; font-weight: bold`,
      `color: ${levelColor}; font-weight: bold`,
      'color: inherit',
      ...args,
    );
  } else {
    console.log(`${timestamp}${categoryTag}[${levelName}] ${message}`, ...args);
  }
};

function getTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

export function debug(category: LogCategory | string, message: string, ...args: unknown[]): void {
  log(LogLevel.DEBUG, category, message, ...args);
}

export function info(category: LogCategory | string, message: string, ...args: unknown[]): void {
  log(LogLevel.INFO, category, message, ...args);
}

export function warn(category: LogCategory | string, message: string, ...args: unknown[]): void {
  log(LogLevel.WARN, category, message, ...args);
}

export function error(category: LogCategory | string, message: string, ...args: unknown[]): void {
  log(LogLevel.ERROR, category, message, ...args);
}

export const logger = {
  setEnabled(enabled: boolean): void {
    config.enabled = enabled;
  },
  setLevel(level: number | LogLevelKey): void {
    if (typeof level === 'string') {
      const mapped = LogLevel[level.toUpperCase() as LogLevelKey];
      config.level = typeof mapped === 'number' ? mapped : LogLevel.DEBUG;
    } else {
      config.level = level;
    }
  },
  setCategory(category: LogCategory | string, enabled: boolean): void {
    config.categories[category] = enabled;
  },
  setTimestamps(enabled: boolean): void {
    config.timestamps = enabled;
  },
  setColors(enabled: boolean): void {
    config.colors = enabled;
  },
  getConfig(): LoggerConfig {
    return { ...config, categories: { ...config.categories } };
  },
  reset(): void {
    config.level = LogLevel.DEBUG;
    config.enabled = true;
    config.timestamps = true;
    config.colors = true;
    Object.keys(config.categories).forEach((cat) => {
      config.categories[cat] = true;
    });
  },
  LogLevel,
};

export function setupProduction(): void {
  logger.setEnabled(false);
}

export function setupDevelopment(): void {
  logger.setEnabled(true);
  logger.setCategory('render', false);
}

export class Timer {
  private readonly startTime: number;

  constructor(private readonly category: string, private readonly label: string) {
    this.startTime = performance.now();
  }

  end(): number {
    const duration = performance.now() - this.startTime;
    debug(this.category, `${this.label} took ${duration.toFixed(2)}ms`);
    return duration;
  }
}

export function createLogger(category: string) {
  return {
    debug: (message: string, ...args: unknown[]) => debug(category, message, ...args),
    info: (message: string, ...args: unknown[]) => info(category, message, ...args),
    warn: (message: string, ...args: unknown[]) => warn(category, message, ...args),
    error: (message: string, ...args: unknown[]) => error(category, message, ...args),
    timer: (label: string) => new Timer(category, label),
  };
}

const mode = typeof import.meta !== 'undefined' && typeof import.meta.env?.MODE === 'string'
  ? import.meta.env.MODE
  : 'development';

if (mode === 'production') {
  setupProduction();
} else {
  setupDevelopment();
}
