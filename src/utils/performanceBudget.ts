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
 * @internal
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

class PerformanceBudget {
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
