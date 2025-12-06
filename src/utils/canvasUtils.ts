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
 * NOTE: Disabled - overlays now use CSS centering for better visual design
 */
export function setOverlayDimensions(_canvas: HTMLCanvasElement, _overlays: HTMLElement[]): void {
  // Overlays are now centered boxes via CSS (see inline.css)
  // No longer forcing them to match canvas dimensions
  // This allows for the nice bordered, centered overlay design
  return;
}

/**
 * Check if a point is within canvas bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
