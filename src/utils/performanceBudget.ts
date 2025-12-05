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

/**
 * Configuration for performance budget tracking.
 */
export interface PerformanceBudgetConfig {
  /** Target frame time in milliseconds (e.g., 16.67ms for 60 FPS). */
  targetFrameTime: number;
  /** Maximum acceptable frame time in milliseconds (e.g., 33.33ms for 30 FPS). */
  maxFrameTime: number;
  /** Number of frames to include in the rolling window. */
  windowSize: number;
}

const DEFAULT_CONFIG: PerformanceBudgetConfig = {
  targetFrameTime: 16.67,
  maxFrameTime: 33.33,
  windowSize: 60,
};

/**
 * Snapshot describing whether frame timing is within configured targets.
 */
export interface PerformanceBudgetStatus {
  /** True when the rolling average meets the target frame time. */
  withinTarget: boolean;
  /** True when the rolling average is under the max allowable frame time. */
  withinMax: boolean;
  /** Rolling average frame time (ms). */
  avgFrameTime: number;
  /** Rolling average frames per second. */
  avgFPS: number;
}

/**
 * Aggregated frame timing statistics.
 */
export interface PerformanceBudgetStats {
  /** Rolling average frame time (ms). */
  avgFrameTime: number;
  /** Minimum frame time observed in the window (ms). */
  minFrameTime: number;
  /** Maximum frame time observed in the window (ms). */
  maxFrameTime: number;
  /** Rolling average frames per second. */
  avgFPS: number;
  /** Total number of budget violations observed. */
  violations: number;
}

/**
 * Tracks frame timing against target budgets using a sliding window.
 */
export class PerformanceBudget {
  private frameTimes: number[] = [];
  private config: PerformanceBudgetConfig;
  private violationCount = 0;
  private lastWarningTime = 0;

  constructor(config: Partial<PerformanceBudgetConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record a single frame duration in milliseconds.
   *
   * Maintains a sliding window and checks budgets in dev mode.
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

  /** Check if a frame time exceeds configured budgets and log warnings. */
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

  /** Get average frame time over the sliding window. */
  public getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  /** Get current FPS derived from the average frame time. */
  public getAverageFPS(): number {
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }

  /** Determine whether current averages are within target and max budgets. */
  public isWithinBudget(): PerformanceBudgetStatus {
    const avgFrameTime = this.getAverageFrameTime();
    return {
      withinTarget: avgFrameTime <= this.config.targetFrameTime,
      withinMax: avgFrameTime <= this.config.maxFrameTime,
      avgFrameTime,
      avgFPS: this.getAverageFPS(),
    };
  }

  /** Get a snapshot of performance statistics. */
  public getStats(): PerformanceBudgetStats {
    if (this.frameTimes.length === 0) {
      return {
        avgFrameTime: this.getAverageFrameTime(),
        minFrameTime: 0,
        maxFrameTime: 0,
        avgFPS: this.getAverageFPS(),
        violations: this.violationCount,
      };
    }

    return {
      avgFrameTime: this.getAverageFrameTime(),
      minFrameTime: Math.min(...this.frameTimes),
      maxFrameTime: Math.max(...this.frameTimes),
      avgFPS: this.getAverageFPS(),
      violations: this.violationCount,
    };
  }

  /** Reset all tracked frame times and violations. */
  public reset(): void {
    this.frameTimes = [];
    this.violationCount = 0;
    this.lastWarningTime = 0;
  }
}

/**
 * Singleton performance budget tracker for dev diagnostics.
 */
export const performanceBudget = new PerformanceBudget();
