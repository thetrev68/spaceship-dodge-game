# Sprint 6: Advanced Features & Polish

## Goal

Transform the spaceship-dodge-game into a **showcase-ready project** with advanced features that demonstrate professional polish, accessibility excellence, and performance monitoring. Target: A world-class codebase that stands out as a portfolio piece.

## Prerequisites

- Sprint 1-5 completed (85%+ test coverage, clean architecture, comprehensive docs, CI/CD)
- All tests passing (`npm run test` - 96/96)
- TypeScript + ESLint clean
- CI/CD workflows operational
- GitHub Pages deployment working

## Overview

Sprint 6 focuses on advanced features and final polish:

1. **Performance Monitoring** - Web Vitals tracking and real-time performance metrics
2. **Accessibility Enhancements** - ARIA announcements, keyboard shortcuts guide, screen reader support
3. **Storybook for UI Components** - Visual component development and documentation (Optional)
4. **Advanced Analytics** - Player behavior tracking and game metrics
5. **Final Polish** - Code cleanup, optimization, and showcase preparation

After this sprint, the project will be a **world-class showcase** demonstrating senior-level software engineering skills.

---

## Part 1: Performance Monitoring & Web Vitals

### 1.1 Install Web Vitals

**Purpose**: Track Core Web Vitals (LCP, FID, CLS) for performance monitoring

**Install**:

```bash
npm install web-vitals
```

### 1.2 Create Analytics Module

**File**: `src/utils/analytics.ts`

**Purpose**: Centralized performance tracking and reporting

````typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { log } from '@core/logger';

/**
 * Performance Analytics System
 *
 * Tracks Core Web Vitals and custom game performance metrics.
 * Integrates with the logger for centralized reporting.
 *
 * **Core Web Vitals:**
 * - LCP (Largest Contentful Paint): Loading performance (target: < 2.5s)
 * - FID (First Input Delay): Interactivity (target: < 100ms)
 * - CLS (Cumulative Layout Shift): Visual stability (target: < 0.1)
 *
 * **Additional Metrics:**
 * - FCP (First Contentful Paint): Initial rendering (target: < 1.8s)
 * - TTFB (Time to First Byte): Server response (target: < 600ms)
 *
 * @see https://web.dev/vitals/
 */

type AnalyticsEvent = {
  category: 'performance' | 'gameplay' | 'user-interaction';
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
};

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionStart: number;

  constructor() {
    this.sessionStart = Date.now();
    this.initializeWebVitals();
  }

  /**
   * Initialize Web Vitals tracking
   * Reports metrics to the logger for debugging/monitoring
   */
  private initializeWebVitals(): void {
    // Core Web Vitals
    onCLS(this.handleMetric.bind(this), { reportAllChanges: true });
    onFID(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this), { reportAllChanges: true });

    // Additional metrics
    onFCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    log.info('Web Vitals tracking initialized');
  }

  /**
   * Handle Web Vitals metric reporting
   */
  private handleMetric(metric: Metric): void {
    const { name, value, rating } = metric;

    // Log with appropriate level based on rating
    if (rating === 'good') {
      log.info(`[Web Vital] ${name}: ${value.toFixed(2)}ms`, { rating });
    } else if (rating === 'needs-improvement') {
      log.warn(`[Web Vital] ${name}: ${value.toFixed(2)}ms`, { rating });
    } else {
      log.error(`[Web Vital] ${name}: ${value.toFixed(2)}ms`, { rating });
    }

    // Track as analytics event
    this.trackEvent({
      category: 'performance',
      action: name,
      value: Math.round(value),
      timestamp: Date.now(),
    });
  }

  /**
   * Track custom analytics event
   *
   * @example
   * ```typescript
   * analytics.trackEvent({
   *   category: 'gameplay',
   *   action: 'level-completed',
   *   label: 'level-5',
   *   value: 12500
   * });
   * ```
   */
  public trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    log.debug('[Analytics]', {
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
    });
  }

  /**
   * Track gameplay milestone
   */
  public trackGameplay(action: string, label?: string, value?: number): void {
    this.trackEvent({
      category: 'gameplay',
      action,
      label,
      value,
    });
  }

  /**
   * Track user interaction
   */
  public trackInteraction(action: string, label?: string): void {
    this.trackEvent({
      category: 'user-interaction',
      action,
      label,
    });
  }

  /**
   * Get session duration in seconds
   */
  public getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStart) / 1000);
  }

  /**
   * Get all tracked events
   */
  public getEvents(): readonly AnalyticsEvent[] {
    return this.events;
  }

  /**
   * Export analytics data for analysis
   */
  public exportData(): {
    sessionDuration: number;
    events: AnalyticsEvent[];
    summary: {
      totalEvents: number;
      performanceEvents: number;
      gameplayEvents: number;
      interactionEvents: number;
    };
  } {
    return {
      sessionDuration: this.getSessionDuration(),
      events: this.events,
      summary: {
        totalEvents: this.events.length,
        performanceEvents: this.events.filter((e) => e.category === 'performance').length,
        gameplayEvents: this.events.filter((e) => e.category === 'gameplay').length,
        interactionEvents: this.events.filter((e) => e.category === 'user-interaction').length,
      },
    };
  }

  /**
   * Clear all tracked events
   */
  public clear(): void {
    this.events = [];
    log.debug('Analytics events cleared');
  }
}

// Singleton instance
export const analytics = new Analytics();
````

### 1.3 Integrate Analytics with Game Events

**File**: `src/core/main.ts` - Update initialization

```typescript
import { analytics } from '@utils/analytics';

async function main() {
  // Track app initialization
  analytics.trackEvent({
    category: 'performance',
    action: 'app-initialized',
    value: Date.now(),
  });

  // ... existing initialization code ...

  // Track audio unlock
  analytics.trackInteraction('audio-unlock-attempted');
}
```

**File**: `src/game/gameStateManager.ts` - Track state transitions

```typescript
import { analytics } from '@utils/analytics';

export function startGame(): void {
  analytics.trackGameplay('game-started', `level-${gameLevel.value}`);
  // ... existing code ...
}

export function handlePlayerHit(): void {
  analytics.trackGameplay('player-hit', undefined, playerLives.value);
  // ... existing code ...
}

export function gameOver(): void {
  const finalScore = score.value;
  const finalLevel = gameLevel.value;
  analytics.trackGameplay('game-over', `level-${finalLevel}`, finalScore);
  // ... existing code ...
}
```

**File**: `src/game/flowManager.ts` - Track level progression

```typescript
import { analytics } from '@utils/analytics';

export function advanceLevel(): void {
  const newLevel = gameLevel.value + 1;
  analytics.trackGameplay('level-completed', `level-${newLevel}`, score.value);
  // ... existing code ...
}
```

### 1.4 Add Performance Budget Monitoring

**File**: `src/utils/performanceBudget.ts`

**Purpose**: Monitor and enforce performance budgets in development

```typescript
import { log } from '@core/logger';
import { DEV_CONFIG } from '@core/constants';

/**
 * Performance Budget Monitor
 *
 * Tracks frame times and alerts when budgets are exceeded.
 * Uses a sliding window to calculate average performance over time.
 *
 * **Design Rationale:**
 * - 60 FPS target = 16.67ms budget per frame
 * - 30 FPS minimum = 33.33ms budget per frame
 * - Sliding window of 60 frames for smooth averaging
 * - Real-time alerts in dev mode for performance regression detection
 */

interface PerformanceBudgetConfig {
  targetFrameTime: number; // ms (16.67ms = 60 FPS)
  maxFrameTime: number; // ms (33.33ms = 30 FPS)
  windowSize: number; // Number of frames to average
}

const DEFAULT_CONFIG: PerformanceBudgetConfig = {
  targetFrameTime: 16.67,
  maxFrameTime: 33.33,
  windowSize: 60,
};

export class PerformanceBudget {
  private frameTimes: number[] = [];
  private config: PerformanceBudgetConfig;
  private violationCount = 0;
  private lastWarningTime = 0;

  constructor(config: Partial<PerformanceBudgetConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record a frame's duration
   * @param duration - Frame time in milliseconds
   */
  recordFrame(duration: number): void {
    this.frameTimes.push(duration);

    // Maintain sliding window
    if (this.frameTimes.length > this.config.windowSize) {
      this.frameTimes.shift();
    }

    // Check budget in dev mode
    if (DEV_CONFIG.SHOW_PERFORMANCE_METRICS) {
      this.checkBudget(duration);
    }
  }

  /**
   * Check if frame time exceeds budget
   */
  private checkBudget(frameTime: number): void {
    if (frameTime > this.config.maxFrameTime) {
      this.violationCount++;

      // Throttle warnings to once per second
      const now = Date.now();
      if (now - this.lastWarningTime > 1000) {
        log.warn(
          `Performance budget exceeded: ${frameTime.toFixed(2)}ms (max: ${this.config.maxFrameTime}ms)`,
          {
            violations: this.violationCount,
            avgFrameTime: this.getAverageFrameTime(),
          }
        );
        this.lastWarningTime = now;
      }
    }
  }

  /**
   * Get average frame time over the window
   */
  public getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  /**
   * Get current FPS based on average frame time
   */
  public getAverageFPS(): number {
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }

  /**
   * Check if performance is within budget
   */
  public isWithinBudget(): {
    withinTarget: boolean;
    withinMax: boolean;
    avgFrameTime: number;
    avgFPS: number;
  } {
    const avgFrameTime = this.getAverageFrameTime();
    return {
      withinTarget: avgFrameTime <= this.config.targetFrameTime,
      withinMax: avgFrameTime <= this.config.maxFrameTime,
      avgFrameTime,
      avgFPS: this.getAverageFPS(),
    };
  }

  /**
   * Get performance statistics
   */
  public getStats(): {
    avgFrameTime: number;
    minFrameTime: number;
    maxFrameTime: number;
    avgFPS: number;
    violations: number;
  } {
    return {
      avgFrameTime: this.getAverageFrameTime(),
      minFrameTime: Math.min(...this.frameTimes),
      maxFrameTime: Math.max(...this.frameTimes),
      avgFPS: this.getAverageFPS(),
      violations: this.violationCount,
    };
  }

  /**
   * Reset all tracking data
   */
  public reset(): void {
    this.frameTimes = [];
    this.violationCount = 0;
    this.lastWarningTime = 0;
  }
}

// Singleton instance
export const performanceBudget = new PerformanceBudget();
```

### 1.5 Integrate Performance Budget with Game Loop

**File**: `src/game/gameLoop.ts` - Update game loop

```typescript
import { performanceBudget } from '@utils/performanceBudget';

function gameLoop(ctx: CanvasRenderingContext2D): void {
  const frameStart = performance.now();

  // ... existing game loop logic ...

  const frameEnd = performance.now();
  const frameDuration = frameEnd - frameStart;

  // Track frame time
  performanceBudget.recordFrame(frameDuration);

  requestAnimationFrame(() => gameLoop(ctx));
}
```

### 1.6 Update Performance HUD

**File**: `src/ui/hud/perfHUD.ts` - Add Web Vitals display

```typescript
import { performanceBudget } from '@utils/performanceBudget';
import { analytics } from '@utils/analytics';

export function drawPerformanceHUD(ctx: CanvasRenderingContext2D): void {
  const stats = performanceBudget.getStats();
  const budget = performanceBudget.isWithinBudget();

  ctx.save();
  ctx.font = '12px monospace';
  ctx.fillStyle = budget.withinTarget ? '#00ff00' : budget.withinMax ? '#ffaa00' : '#ff0000';

  const x = ctx.canvas.width - 200;
  let y = 20;

  // FPS
  ctx.fillText(`FPS: ${stats.avgFPS.toFixed(1)}`, x, y);
  y += 15;

  // Frame time
  ctx.fillText(`Frame: ${stats.avgFrameTime.toFixed(2)}ms`, x, y);
  y += 15;

  // Min/Max
  ctx.fillText(`Min: ${stats.minFrameTime.toFixed(2)}ms`, x, y);
  y += 15;
  ctx.fillText(`Max: ${stats.maxFrameTime.toFixed(2)}ms`, x, y);
  y += 15;

  // Violations
  if (stats.violations > 0) {
    ctx.fillStyle = '#ff0000';
    ctx.fillText(`Budget violations: ${stats.violations}`, x, y);
  }

  ctx.restore();
}
```

---

## Part 2: Accessibility Enhancements

### 2.1 Create ARIA Announcer System

**File**: `src/ui/accessibility/announcer.ts`

**Purpose**: Announce game events to screen readers

````typescript
import { log } from '@core/logger';

/**
 * ARIA Live Region Announcer
 *
 * Provides screen reader announcements for important game events.
 * Uses ARIA live regions for non-intrusive notifications.
 *
 * **Design Rationale:**
 * - Polite: Announces after current screen reader output (default)
 * - Assertive: Interrupts current output (for critical events)
 * - Auto-clear: Prevents announcement duplication
 *
 * **Accessibility Standards:**
 * - WCAG 2.1 Level AA compliance
 * - ARIA 1.2 live regions specification
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
 */

type AnnounceOptions = {
  priority?: 'polite' | 'assertive';
  clearAfter?: number; // ms
};

const DEFAULT_OPTIONS: AnnounceOptions = {
  priority: 'polite',
  clearAfter: 1000,
};

class Announcer {
  private liveRegion: HTMLElement | null = null;

  constructor() {
    this.initializeLiveRegion();
  }

  /**
   * Initialize ARIA live region in the DOM
   */
  private initializeLiveRegion(): void {
    // Check if already exists
    let region = document.getElementById('aria-live-region');

    if (!region) {
      region = document.createElement('div');
      region.id = 'aria-live-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only'; // Screen reader only
      document.body.appendChild(region);
    }

    this.liveRegion = region;
    log.debug('ARIA live region initialized');
  }

  /**
   * Announce a message to screen readers
   *
   * @param message - Text to announce
   * @param options - Announcement configuration
   *
   * @example
   * ```typescript
   * announcer.announce('Level 5 reached', { priority: 'assertive' });
   * announcer.announce('Score increased by 100 points');
   * ```
   */
  public announce(message: string, options: AnnounceOptions = {}): void {
    if (!this.liveRegion) {
      log.warn('ARIA live region not available');
      return;
    }

    const config = { ...DEFAULT_OPTIONS, ...options };

    // Update live region priority
    this.liveRegion.setAttribute('aria-live', config.priority);

    // Set message
    this.liveRegion.textContent = message;

    log.debug('[ARIA] Announced:', message, { priority: config.priority });

    // Auto-clear after delay
    if (config.clearAfter > 0) {
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = '';
        }
      }, config.clearAfter);
    }
  }

  /**
   * Announce with assertive priority (interrupts current output)
   */
  public announceUrgent(message: string): void {
    this.announce(message, { priority: 'assertive' });
  }

  /**
   * Clear the live region
   */
  public clear(): void {
    if (this.liveRegion) {
      this.liveRegion.textContent = '';
    }
  }
}

// Singleton instance
export const announcer = new Announcer();
````

**File**: `public/index.html` - Add screen reader only CSS

```html
<!-- Add to <head> -->
<style>
  /* Screen reader only class */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
```

### 2.2 Integrate Announcer with Game Events

**File**: `src/game/gameStateManager.ts` - Add announcements

```typescript
import { announcer } from '@ui/accessibility/announcer';

export function startGame(): void {
  announcer.announce('Game started. Use arrow keys or WASD to move, spacebar to fire.');
  // ... existing code ...
}

export function pauseGame(): void {
  announcer.announce('Game paused. Press P to resume.');
  // ... existing code ...
}

export function unpauseGame(): void {
  announcer.announce('Game resumed');
  // ... existing code ...
}

export function handlePlayerHit(): void {
  const livesRemaining = playerLives.value - 1;
  announcer.announceUrgent(
    `Player hit! ${livesRemaining} ${livesRemaining === 1 ? 'life' : 'lives'} remaining.`
  );
  // ... existing code ...
}

export function gameOver(): void {
  announcer.announceUrgent(`Game over! Final score: ${score.value}, Level: ${gameLevel.value}`);
  // ... existing code ...
}
```

**File**: `src/game/flowManager.ts` - Announce level progression

```typescript
import { announcer } from '@ui/accessibility/announcer';

export function advanceLevel(): void {
  const newLevel = gameLevel.value + 1;
  announcer.announce(`Level ${newLevel} reached! Score: ${score.value}`, { priority: 'assertive' });
  // ... existing code ...
}
```

**File**: `src/entities/powerup.ts` - Announce powerup collection

```typescript
import { announcer } from '@ui/accessibility/announcer';

export function activatePowerup(type: PowerupType): void {
  const messages: Record<PowerupType, string> = {
    shield: 'Shield activated! You are invulnerable for 5 seconds.',
    doubleBlaster: 'Double blaster activated! Firing two bullets for 10 seconds.',
  };

  announcer.announce(messages[type]);
  // ... existing code ...
}
```

### 2.3 Create Keyboard Shortcuts Guide

**File**: `src/ui/accessibility/keyboardHelp.ts`

**Purpose**: Display keyboard shortcuts overlay

```typescript
import { getById } from '@utils/dom';
import { log } from '@core/logger';
import { isMobile } from '@core/state';

/**
 * Keyboard Shortcuts Help System
 *
 * Provides an accessible reference for all keyboard controls.
 * Accessible via '?' key or help button.
 */

interface Shortcut {
  key: string;
  action: string;
  group: 'movement' | 'actions' | 'system';
}

const SHORTCUTS: Shortcut[] = [
  // Movement
  { key: 'W / ↑', action: 'Move up', group: 'movement' },
  { key: 'A / ←', action: 'Move left', group: 'movement' },
  { key: 'S / ↓', action: 'Move down', group: 'movement' },
  { key: 'D / →', action: 'Move right', group: 'movement' },
  { key: 'Mouse', action: 'Move to cursor position', group: 'movement' },

  // Actions
  { key: 'Space', action: 'Fire bullets', group: 'actions' },
  { key: 'Click', action: 'Fire bullets at cursor', group: 'actions' },

  // System
  { key: 'P', action: 'Pause / Resume game', group: 'system' },
  { key: 'M', action: 'Mute / Unmute audio', group: 'system' },
  { key: '?', action: 'Show this help', group: 'system' },
];

export function initializeKeyboardHelp(): void {
  // Skip on mobile
  if (isMobile) return;

  // Add '?' key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      toggleKeyboardHelp();
    }
  });

  log.debug('Keyboard help initialized (press ? to view)');
}

export function toggleKeyboardHelp(): void {
  const overlay = getById<HTMLDivElement>('keyboard-help-overlay');

  if (!overlay) {
    createKeyboardHelpOverlay();
  } else {
    hideKeyboardHelp();
  }
}

export function showKeyboardHelp(): void {
  let overlay = getById<HTMLDivElement>('keyboard-help-overlay');

  if (!overlay) {
    overlay = createKeyboardHelpOverlay();
  }

  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');

  // Focus first close button
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.close-button');
  closeBtn?.focus();

  log.debug('Keyboard help displayed');
}

export function hideKeyboardHelp(): void {
  const overlay = getById<HTMLDivElement>('keyboard-help-overlay');
  if (!overlay) return;

  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');

  log.debug('Keyboard help hidden');
}

function createKeyboardHelpOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'keyboard-help-overlay';
  overlay.className = 'game-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-labelledby', 'keyboard-help-title');
  overlay.setAttribute('aria-modal', 'true');

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce(
    (acc, shortcut) => {
      acc[shortcut.group].push(shortcut);
      return acc;
    },
    { movement: [], actions: [], system: [] } as Record<string, Shortcut[]>
  );

  overlay.innerHTML = `
    <div class="overlay-content">
      <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>

      <div class="shortcuts-container">
        <section>
          <h3>Movement</h3>
          <dl class="shortcuts-list">
            ${groupedShortcuts.movement.map((s) => `<dt>${s.key}</dt><dd>${s.action}</dd>`).join('')}
          </dl>
        </section>

        <section>
          <h3>Actions</h3>
          <dl class="shortcuts-list">
            ${groupedShortcuts.actions.map((s) => `<dt>${s.key}</dt><dd>${s.action}</dd>`).join('')}
          </dl>
        </section>

        <section>
          <h3>System</h3>
          <dl class="shortcuts-list">
            ${groupedShortcuts.system.map((s) => `<dt>${s.key}</dt><dd>${s.action}</dd>`).join('')}
          </dl>
        </section>
      </div>

      <button class="close-button" aria-label="Close keyboard shortcuts">
        Close (Esc)
      </button>
    </div>
  `;

  // Add event listeners
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.close-button');
  closeBtn?.addEventListener('click', hideKeyboardHelp);

  // Escape key to close
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideKeyboardHelp();
    }
  });

  document.body.appendChild(overlay);

  return overlay;
}
```

**File**: `src/input.css` - Add keyboard help styles

```css
/* Keyboard shortcuts overlay */
.shortcuts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.shortcuts-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  margin: 0;
}

.shortcuts-list dt {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.shortcuts-list dd {
  margin: 0;
  display: flex;
  align-items: center;
}
```

### 2.4 Add Focus Management

**File**: `src/ui/overlays/overlayManager.ts` - Enhance focus handling

```typescript
/**
 * Enhanced overlay management with focus trap
 */

function trapFocusInOverlay(overlay: HTMLElement): void {
  const focusableElements = overlay.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab: backwards
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      // Tab: forwards
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  });
}
```

### 2.5 Update Main Initialization

**File**: `src/core/main.ts` - Initialize accessibility features

```typescript
import { initializeKeyboardHelp } from '@ui/accessibility/keyboardHelp';
import { announcer } from '@ui/accessibility/announcer';

async function main() {
  // ... existing code ...

  // Initialize accessibility features
  initializeKeyboardHelp();

  // Welcome announcement
  announcer.announce(
    'Spaceship Dodge game loaded. Press ? for keyboard shortcuts, or click Start to begin.'
  );
}
```

---

## Part 3: Storybook for UI Components (Optional)

### 3.1 Install Storybook

**Purpose**: Visual component development and documentation

**Install**:

```bash
npx storybook@latest init --type html
```

**This will**:

- Install Storybook dependencies
- Create `.storybook/` configuration
- Add npm scripts (`storybook`, `build-storybook`)

### 3.2 Configure Storybook for TypeScript

**File**: `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### 3.3 Create Component Stories

**File**: `src/ui/hud/scoreDisplay.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/html';
import { score, gameLevel, playerLives } from '@core/state';

const meta: Meta = {
  title: 'UI/HUD/Score Display',
  tags: ['autodocs'],
  argTypes: {
    score: { control: { type: 'number', min: 0, max: 999999 } },
    level: { control: { type: 'number', min: 1, max: 99 } },
    lives: { control: { type: 'number', min: 0, max: 5 } },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    score: 12500,
    level: 5,
    lives: 3,
  },
  render: (args) => {
    // Update reactive state
    score.value = args.score;
    gameLevel.value = args.level;
    playerLives.value = args.lives;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // Draw HUD
    import('@ui/hud/scoreDisplay').then(({ drawScoreDisplay }) => {
      drawScoreDisplay(ctx);
    });

    return canvas;
  },
};

export const HighScore: Story = {
  args: {
    score: 999999,
    level: 99,
    lives: 5,
  },
};

export const LowLives: Story = {
  args: {
    score: 5000,
    level: 3,
    lives: 1,
  },
};

export const GameOver: Story = {
  args: {
    score: 8250,
    level: 4,
    lives: 0,
  },
};
```

**File**: `src/ui/controls/audioControls.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'UI/Controls/Audio Controls',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="audio-controls">
        <label for="volume-slider">Volume:</label>
        <input type="range" id="volume-slider" min="0" max="100" value="50" />
        <button id="mute-button" aria-label="Mute audio">🔊</button>
      </div>
    `;
    return container;
  },
};
```

### 3.4 Add Accessibility Addon

Storybook's a11y addon automatically tests components for accessibility issues.

**Enable in stories**:

```typescript
export default {
  title: 'UI/Component',
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

---

## Part 4: Advanced Game Analytics

### 4.1 Create Game Metrics Tracker

**File**: `src/utils/gameMetrics.ts`

**Purpose**: Track detailed gameplay metrics for analysis

```typescript
import { log } from '@core/logger';

/**
 * Game Metrics Tracker
 *
 * Tracks detailed gameplay statistics for performance analysis
 * and game balance tuning.
 */

interface GameSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  finalScore: number;
  finalLevel: number;
  totalHits: number;
  totalKills: number;
  powerupsCollected: number;
  bulletsFired: number;
  accuracy: number; // percentage
  survivalTime: number; // seconds
}

class GameMetrics {
  private currentSession: Partial<GameSession> | null = null;
  private sessions: GameSession[] = [];

  /**
   * Start a new game session
   */
  public startSession(): void {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      totalHits: 0,
      totalKills: 0,
      powerupsCollected: 0,
      bulletsFired: 0,
    };

    log.debug('[Metrics] Session started', { sessionId: this.currentSession.sessionId });
  }

  /**
   * End current session
   */
  public endSession(finalScore: number, finalLevel: number): void {
    if (!this.currentSession) return;

    const session: GameSession = {
      ...(this.currentSession as GameSession),
      endTime: Date.now(),
      finalScore,
      finalLevel,
      survivalTime: Math.floor((Date.now() - this.currentSession.startTime!) / 1000),
      accuracy: this.calculateAccuracy(),
    };

    this.sessions.push(session);
    this.currentSession = null;

    log.info('[Metrics] Session ended', session);
  }

  /**
   * Record a bullet fired
   */
  public recordBulletFired(): void {
    if (this.currentSession) {
      this.currentSession.bulletsFired = (this.currentSession.bulletsFired || 0) + 1;
    }
  }

  /**
   * Record an asteroid destroyed
   */
  public recordKill(): void {
    if (this.currentSession) {
      this.currentSession.totalKills = (this.currentSession.totalKills || 0) + 1;
    }
  }

  /**
   * Record player hit
   */
  public recordHit(): void {
    if (this.currentSession) {
      this.currentSession.totalHits = (this.currentSession.totalHits || 0) + 1;
    }
  }

  /**
   * Record powerup collection
   */
  public recordPowerupCollected(): void {
    if (this.currentSession) {
      this.currentSession.powerupsCollected = (this.currentSession.powerupsCollected || 0) + 1;
    }
  }

  /**
   * Calculate shooting accuracy
   */
  private calculateAccuracy(): number {
    if (!this.currentSession || !this.currentSession.bulletsFired) return 0;
    return (this.currentSession.totalKills! / this.currentSession.bulletsFired!) * 100;
  }

  /**
   * Get all sessions
   */
  public getSessions(): readonly GameSession[] {
    return this.sessions;
  }

  /**
   * Get average statistics across all sessions
   */
  public getAverageStats(): {
    avgScore: number;
    avgLevel: number;
    avgSurvivalTime: number;
    avgAccuracy: number;
    totalSessions: number;
  } {
    if (this.sessions.length === 0) {
      return {
        avgScore: 0,
        avgLevel: 0,
        avgSurvivalTime: 0,
        avgAccuracy: 0,
        totalSessions: 0,
      };
    }

    const totals = this.sessions.reduce(
      (acc, session) => ({
        score: acc.score + session.finalScore,
        level: acc.level + session.finalLevel,
        survivalTime: acc.survivalTime + session.survivalTime,
        accuracy: acc.accuracy + session.accuracy,
      }),
      { score: 0, level: 0, survivalTime: 0, accuracy: 0 }
    );

    const count = this.sessions.length;

    return {
      avgScore: Math.round(totals.score / count),
      avgLevel: Math.round(totals.level / count),
      avgSurvivalTime: Math.round(totals.survivalTime / count),
      avgAccuracy: Math.round(totals.accuracy / count),
      totalSessions: count,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Export metrics data
   */
  public exportMetrics(): string {
    return JSON.stringify(
      {
        sessions: this.sessions,
        averages: this.getAverageStats(),
        exportDate: new Date().toISOString(),
      },
      null,
      2
    );
  }
}

export const gameMetrics = new GameMetrics();
```

### 4.2 Integrate Metrics with Game

**File**: `src/game/gameStateManager.ts`

```typescript
import { gameMetrics } from '@utils/gameMetrics';

export function startGame(): void {
  gameMetrics.startSession();
  // ... existing code ...
}

export function gameOver(): void {
  gameMetrics.endSession(score.value, gameLevel.value);
  // ... existing code ...
}

export function handlePlayerHit(): void {
  gameMetrics.recordHit();
  // ... existing code ...
}
```

**File**: `src/entities/bullet.ts`

```typescript
import { gameMetrics } from '@utils/gameMetrics';

export function fireBullet(): void {
  gameMetrics.recordBulletFired();
  // ... existing code ...
}
```

**File**: `src/entities/asteroid.ts`

```typescript
import { gameMetrics } from '@utils/gameMetrics';

export function destroyAsteroid(): void {
  gameMetrics.recordKill();
  // ... existing code ...
}
```

**File**: `src/entities/powerup.ts`

```typescript
import { gameMetrics } from '@utils/gameMetrics';

export function collectPowerup(): void {
  gameMetrics.recordPowerupCollected();
  // ... existing code ...
}
```

---

## Part 5: Final Polish & Optimization

### 5.1 Add Memoization for Expensive Calculations

**File**: `src/utils/memoize.ts`

```typescript
/**
 * Generic memoization utility
 *
 * Caches function results based on arguments to avoid recalculation.
 * Useful for expensive calculations called frequently with same inputs.
 */

export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * Memoize with size limit (LRU cache)
 */
export function memoizeWithLimit<T extends (...args: any[]) => any>(fn: T, limit: number = 100): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Move to end (most recently used)
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn(...args);

    // Evict oldest if at limit
    if (cache.size >= limit) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  }) as T;
}
```

**Apply to collision detection**:

**File**: `src/systems/collisionHandler.ts`

```typescript
import { memoizeWithLimit } from '@utils/memoize';

// Memoize expensive cell key calculation
const getCellKey = memoizeWithLimit((x: number, y: number) => {
  return `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`;
}, 200);
```

### 5.2 Add Code Quality Utilities

**File**: `src/utils/assertions.ts`

**Purpose**: Runtime type checking and validation in development

```typescript
import { log } from '@core/logger';
import { DEV_CONFIG } from '@core/constants';

/**
 * Development assertions
 * Only active in debug mode for performance
 */

export function assert(condition: boolean, message: string): asserts condition {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (!condition) {
    log.error(`Assertion failed: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertNumber(value: unknown, name: string): asserts value is number {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Expected ${name} to be a number, got ${typeof value}`);
  }
}

export function assertPositive(value: number, name: string): void {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (value < 0) {
    throw new Error(`Expected ${name} to be positive, got ${value}`);
  }
}

export function assertInRange(value: number, min: number, max: number, name: string): void {
  if (!DEV_CONFIG.DEBUG_MODE) return;

  if (value < min || value > max) {
    throw new Error(`Expected ${name} to be in range [${min}, ${max}], got ${value}`);
  }
}
```

### 5.3 Performance Profiling Utilities

**File**: `src/utils/profiler.ts`

```typescript
import { log } from '@core/logger';
import { DEV_CONFIG } from '@core/constants';

/**
 * Simple performance profiler for development
 */

class Profiler {
  private timers = new Map<string, number>();
  private measurements = new Map<string, number[]>();

  /**
   * Start timing a section
   */
  public start(label: string): void {
    if (!DEV_CONFIG.DEBUG_MODE) return;
    this.timers.set(label, performance.now());
  }

  /**
   * End timing and record measurement
   */
  public end(label: string): void {
    if (!DEV_CONFIG.DEBUG_MODE) return;

    const startTime = this.timers.get(label);
    if (!startTime) {
      log.warn(`No timer started for: ${label}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    // Store measurement
    const measurements = this.measurements.get(label) || [];
    measurements.push(duration);
    this.measurements.set(label, measurements);

    log.debug(`[Profile] ${label}: ${duration.toFixed(2)}ms`);
  }

  /**
   * Get statistics for a label
   */
  public getStats(label: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) return null;

    return {
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length,
    };
  }

  /**
   * Log all statistics
   */
  public logStats(): void {
    if (!DEV_CONFIG.DEBUG_MODE) return;

    log.info('[Profiler] Performance Statistics:');
    this.measurements.forEach((_, label) => {
      const stats = this.getStats(label);
      if (stats) {
        log.info(`  ${label}:`, {
          avg: `${stats.avg.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`,
          samples: stats.count,
        });
      }
    });
  }

  /**
   * Clear all measurements
   */
  public clear(): void {
    this.timers.clear();
    this.measurements.clear();
  }
}

export const profiler = new Profiler();
```

---

## Part 6: Documentation Updates

### 6.1 Create Sprint 6 Completion Checklist

**File**: `.claude/sprint-6-completion-checklist.md`

```markdown
# Sprint 6 Completion Checklist

## Performance Monitoring ✅

- [ ] `web-vitals` installed
- [ ] `src/utils/analytics.ts` created with Web Vitals tracking
- [ ] Analytics integrated with game events
- [ ] `src/utils/performanceBudget.ts` created
- [ ] Performance budget integrated with game loop
- [ ] Performance HUD updated with Web Vitals display
- [ ] All performance metrics logging correctly

## Accessibility Enhancements ✅

- [ ] `src/ui/accessibility/announcer.ts` created
- [ ] ARIA live region initialized in HTML
- [ ] Screen reader announcements for all game events
- [ ] `src/ui/accessibility/keyboardHelp.ts` created
- [ ] Keyboard shortcuts guide accessible via '?'
- [ ] Focus trap implemented in overlays
- [ ] All interactive elements keyboard accessible

## Storybook (Optional) ✅

- [ ] Storybook installed and configured
- [ ] Stories created for HUD components
- [ ] Stories created for UI controls
- [ ] Stories created for overlays
- [ ] A11y addon configured and testing
- [ ] Storybook builds and runs (`npm run storybook`)

## Game Analytics ✅

- [ ] `src/utils/gameMetrics.ts` created
- [ ] Metrics tracking integrated with game events
- [ ] Session tracking working
- [ ] Statistics calculation accurate
- [ ] Metrics export functionality working

## Performance Optimizations ✅

- [ ] `src/utils/memoize.ts` created
- [ ] Memoization applied to collision detection
- [ ] `src/utils/assertions.ts` created
- [ ] `src/utils/profiler.ts` created
- [ ] Development profiling working

## Documentation ✅

- [ ] All new utilities documented with JSDoc
- [ ] CLAUDE.md updated with Sprint 6 features
- [ ] README.md updated (if needed)
- [ ] Sprint 6 completion checklist created

## Testing ✅

- [ ] All new utilities tested
- [ ] Analytics tracking verified
- [ ] Accessibility features tested with screen reader
- [ ] Keyboard navigation tested
- [ ] Performance monitoring verified
- [ ] All tests passing (`npm run test`)

## Code Quality ✅

- [ ] TypeScript type checking passes
- [ ] ESLint clean
- [ ] Prettier formatting applied
- [ ] No console.log statements (use logger)
- [ ] All code reviewed

## Final Validation ✅

- [ ] `npm run validate` passes
- [ ] CI/CD pipeline passes
- [ ] Manual gameplay testing complete
- [ ] Accessibility testing with keyboard only
- [ ] Performance metrics within budget
- [ ] All features working on desktop and mobile
```

### 6.2 Update CLAUDE.md

Add section on advanced features:

```markdown
## Advanced Features (Sprint 6)

### Performance Monitoring

- **Web Vitals**: Tracks LCP, FID, CLS, FCP, TTFB
- **Performance Budget**: Real-time frame time monitoring
- **Analytics**: Gameplay metrics and session tracking
- See [analytics.ts](src/utils/analytics.ts) and [performanceBudget.ts](src/utils/performanceBudget.ts)

### Accessibility

- **ARIA Announcements**: Screen reader support for game events
- **Keyboard Shortcuts**: Press '?' to view all keyboard controls
- **Focus Management**: Proper focus trapping in overlays
- **WCAG 2.1 AA Compliant**: Full keyboard navigation, screen reader support
- See [announcer.ts](src/ui/accessibility/announcer.ts) and [keyboardHelp.ts](src/ui/accessibility/keyboardHelp.ts)

### Game Analytics

- **Session Tracking**: Records all gameplay sessions
- **Metrics**: Accuracy, survival time, powerups collected
- **Statistics**: Average scores, levels, and player performance
- See [gameMetrics.ts](src/utils/gameMetrics.ts)

### Development Tools

- **Memoization**: Performance optimization for expensive calculations
- **Assertions**: Runtime type checking in development
- **Profiler**: Performance profiling utilities
- See [memoize.ts](src/utils/memoize.ts), [assertions.ts](src/utils/assertions.ts), [profiler.ts](src/utils/profiler.ts)
```

### 6.3 Update DEVELOPER_GUIDE.md

Add accessibility testing section:

````markdown
## Accessibility Testing

### Screen Reader Testing

Test with NVDA (Windows) or VoiceOver (Mac):

1. Start screen reader
2. Navigate to game
3. Verify announcements for:
   - Game start/pause/resume
   - Level progression
   - Player hits
   - Powerup collection
   - Game over

### Keyboard Navigation

Test all functionality without mouse:

1. Tab through all interactive elements
2. Press '?' for keyboard shortcuts
3. Verify focus trap in overlays
4. Test game controls (WASD, Space, P)

### Automated Testing

Run Lighthouse accessibility audit:

```bash
npm run lighthouse
```
````

Target: Accessibility score ≥ 95

```

---

## Validation Checklist

### Performance Monitoring ✅

- [ ] Web Vitals tracking implemented
- [ ] Analytics module created and integrated
- [ ] Performance budget monitoring active
- [ ] Performance HUD displays metrics
- [ ] All metrics logging correctly

### Accessibility ✅

- [ ] ARIA announcer system implemented
- [ ] Screen reader announcements working
- [ ] Keyboard shortcuts guide functional
- [ ] Focus management in overlays
- [ ] All controls keyboard accessible
- [ ] Tested with screen reader

### Storybook (Optional) ✅

- [ ] Storybook installed and configured
- [ ] Component stories created
- [ ] A11y addon configured
- [ ] Visual regression testing setup

### Analytics ✅

- [ ] Game metrics tracking implemented
- [ ] Session tracking functional
- [ ] Statistics accurate
- [ ] Export functionality working

### Optimization ✅

- [ ] Memoization utilities created
- [ ] Applied to performance-critical code
- [ ] Assertions for development
- [ ] Profiler implemented

### Documentation ✅

- [ ] CLAUDE.md updated
- [ ] DEVELOPER_GUIDE.md updated
- [ ] All code documented with JSDoc
- [ ] Completion checklist created

### Testing ✅

- [ ] All tests passing
- [ ] Accessibility tested manually
- [ ] Performance metrics verified
- [ ] CI/CD passing

---

## Files to Create/Update

```

src/
├── utils/
│ ├── analytics.ts # NEW - Web Vitals tracking
│ ├── performanceBudget.ts # NEW - Performance monitoring
│ ├── gameMetrics.ts # NEW - Gameplay analytics
│ ├── memoize.ts # NEW - Memoization utilities
│ ├── assertions.ts # NEW - Development assertions
│ └── profiler.ts # NEW - Performance profiling
│
├── ui/
│ └── accessibility/
│ ├── announcer.ts # NEW - ARIA announcements
│ └── keyboardHelp.ts # NEW - Keyboard shortcuts guide
│
├── core/
│ └── main.ts # UPDATE - Initialize new features
│
├── game/
│ ├── gameLoop.ts # UPDATE - Integrate performance budget
│ ├── gameStateManager.ts # UPDATE - Add analytics/announcements
│ └── flowManager.ts # UPDATE - Add analytics/announcements
│
├── entities/
│ ├── bullet.ts # UPDATE - Track metrics
│ ├── asteroid.ts # UPDATE - Track metrics
│ └── powerup.ts # UPDATE - Track metrics
│
├── systems/
│ └── collisionHandler.ts # UPDATE - Apply memoization
│
└── ui/
└── hud/
└── perfHUD.ts # UPDATE - Add Web Vitals display

public/
└── index.html # UPDATE - Add .sr-only styles

.storybook/ # NEW - Storybook configuration
├── main.ts
└── preview.ts

src/\*_/_.stories.ts # NEW - Component stories

.claude/
└── sprint-6-completion-checklist.md # NEW

CLAUDE.md # UPDATE - Sprint 6 section
DEVELOPER_GUIDE.md # UPDATE - Accessibility testing

```

---

## Success Metrics

After Sprint 6 completion:

- ✅ Web Vitals tracked and within target ranges
- ✅ Lighthouse accessibility score ≥ 95
- ✅ Full keyboard navigation support
- ✅ Screen reader announcements for all game events
- ✅ Game analytics tracking sessions and metrics
- ✅ Performance optimizations applied
- ✅ Development tools (profiler, assertions) functional
- ✅ Storybook with component stories (optional)
- ✅ All tests passing
- ✅ CI/CD pipeline green

---

## Sprint 6 Timeline

**Estimated Time**: 1-2 weeks part-time

### Week 1: Core Features

- Day 1: Performance monitoring (Web Vitals, performance budget)
- Day 2: Accessibility (ARIA announcer, keyboard help)
- Day 3: Game analytics integration
- Day 4: Performance optimizations (memoization)
- Day 5: Testing and validation

### Week 2: Polish & Optional Features

- Day 1: Storybook setup (optional)
- Day 2: Component stories (optional)
- Day 3: Development tools (profiler, assertions)
- Day 4: Documentation updates
- Day 5: Final testing and showcase preparation

---

## Next Steps After Sprint 6

With Sprint 6 complete, you'll have:

- **World-class showcase project** ready for portfolio
- **Professional-grade accessibility** (WCAG 2.1 AA)
- **Comprehensive analytics** for game balance tuning
- **Performance monitoring** with real-time metrics
- **Visual component library** (Storybook)

**Optional future enhancements**:

- Multiplayer/leaderboard system
- Additional powerup types
- Progressive Web App (PWA) features
- Cross-browser E2E tests with Playwright
- Security scanning (Snyk, CodeQL)

---

## Sign-off

**Sprint 6 Status**: Ready to begin

**Prerequisites**: Sprint 5 completion verified (CI/CD operational)

**Deliverable**: Showcase-ready world-class codebase with advanced features

**Target Score**: 9.5/10 overall quality (from 7.2/10 baseline)
```
