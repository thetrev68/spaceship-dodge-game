/**
 * @module utils/canvasUtils
 * Canvas sizing and positioning utilities.
 */
import { CANVAS_CONSTANTS } from '@core/uiConstants.js';

/**
 * Initialize canvas size based on viewport and device type.
 */
export function initializeCanvas(canvas: HTMLCanvasElement): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw < CANVAS_CONSTANTS.MOBILE_THRESHOLD) {
    // Mobile: fixed resolution
    canvas.width = CANVAS_CONSTANTS.MOBILE_WIDTH;
    canvas.height = CANVAS_CONSTANTS.MOBILE_HEIGHT;

    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.objectFit = 'contain';
  } else {
    // Desktop: match screen resolution
    canvas.width = vw;
    canvas.height = vh;

    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    canvas.style.objectFit = 'contain';
  }

  canvas.style.display = 'block';
  canvas.style.backgroundColor = 'black';
}

/**
 * Set overlay dimensions to match canvas position and size
 */
export function setOverlayDimensions(canvas: HTMLCanvasElement, overlays: HTMLElement[]): void {
  const canvasRect = canvas.getBoundingClientRect();
  overlays.forEach((overlay) => {
    if (overlay) {
      overlay.style.width = canvasRect.width + 'px';
      overlay.style.height = canvasRect.height + 'px';
      overlay.style.left = canvasRect.left + 'px';
      overlay.style.top = canvasRect.top + 'px';
    }
  });
}

/**
 * Check if a point is within canvas bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
