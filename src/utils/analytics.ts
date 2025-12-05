import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { log } from '@core/logger';

/**
 * Performance Analytics System
 *
 * Tracks Core Web Vitals and custom game performance metrics.
 * Integrates with the logger for centralized reporting.
 *
 * **Core Web Vitals:**
 * - LCP (Largest Contentful Paint): Loading performance (target: < 2.5s)
 * - INP (Interaction to Next Paint): Interactivity (target: < 200ms)
 * - CLS (Cumulative Layout Shift): Visual stability (target: < 0.1)
 *
 * **Additional Metrics:**
 * - FCP (First Contentful Paint): Initial rendering (target: < 1.8s)
 * - TTFB (Time to First Byte): Server response (target: < 600ms)
 *
 * @see https://web.dev/vitals/
 */

/**
 * @internal
 */
type AnalyticsEvent = {
  category: 'performance' | 'gameplay' | 'user-interaction';
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
};

/**
 * @internal
 */
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
    onINP(this.handleMetric.bind(this));
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
      ...(label !== undefined && { label }),
      ...(value !== undefined && { value }),
    });
  }

  /**
   * Track user interaction
   */
  public trackInteraction(action: string, label?: string): void {
    this.trackEvent({
      category: 'user-interaction',
      action,
      ...(label !== undefined && { label }),
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
