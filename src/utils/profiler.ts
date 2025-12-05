import { log } from '@core/logger';
import { DEV_CONFIG } from '@core/constants';

/**
 * Simple performance profiler for development
 * @internal
 */
export class Profiler {
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
