// utils/canvasUtils.js
// Canvas sizing and positioning utilities

/**
 * Initialize canvas size based on viewport and device type
 * @param {HTMLCanvasElement} canvas - The canvas element to initialize
 */
export function initializeCanvas(canvas) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw < 600) {
    // Mobile: fixed resolution
    canvas.width = 480;
    canvas.height = 854;

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
 * @param {HTMLCanvasElement} canvas - The canvas element to match
 * @param {HTMLElement[]} overlays - Array of overlay elements to position
 */
export function setOverlayDimensions(canvas, overlays) {
  const canvasRect = canvas.getBoundingClientRect();
  overlays.forEach(overlay => {
    if (overlay) {
      overlay.style.width = canvasRect.width + 'px';
      overlay.style.height = canvasRect.height + 'px';
      overlay.style.left = canvasRect.left + 'px';
      overlay.style.top = canvasRect.top + 'px';
    }
  });
}

/**
 * Get canvas dimensions
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {{width: number, height: number}}
 */
export function getCanvasDimensions(canvas) {
  return {
    width: canvas.width,
    height: canvas.height
  };
}

/**
 * Get canvas center point
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {{x: number, y: number}}
 */
export function getCanvasCenter(canvas) {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2
  };
}

/**
 * Check if a point is within canvas bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {boolean}
 */
export function isPointInCanvas(x, y, canvas) {
  return x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
}

/**
 * Clamp a point to canvas bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} margin - Optional margin from edges (default: 0)
 * @returns {{x: number, y: number}}
 */
export function clampToCanvas(x, y, canvas, margin = 0) {
  return {
    x: Math.max(margin, Math.min(x, canvas.width - margin)),
    y: Math.max(margin, Math.min(y, canvas.height - margin))
  };
}
