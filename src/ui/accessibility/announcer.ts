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
    this.liveRegion.setAttribute('aria-live', config.priority!);

    // Set message
    this.liveRegion.textContent = message;

    log.debug('[ARIA] Announced:', message, { priority: config.priority });

    // Auto-clear after delay
    if (config.clearAfter! > 0) {
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
