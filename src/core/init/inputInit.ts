import { isMobile } from '@core/state.js';
import { setupInput } from '@input/inputManager.js';
import { setupMobileInput } from '@input/mobileControls.js';
import { info } from '@core/logger.js';

/**
 * Initializes input handling based on platform
 *
 * @param canvas - Canvas element for coordinate mapping
 */
export function initializeInput(canvas: HTMLCanvasElement): void {
  if (isMobile) {
    setupMobileInput(canvas);
    info('input', 'Mobile touch controls initialized');
  } else {
    setupInput(canvas);
    info('input', 'Desktop keyboard/mouse controls initialized');
  }
}
