import { getById } from '@utils/dom.js';
import { error, info } from '@core/logger.js';

export interface CanvasSetup {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

/**
 * Initializes the game canvas and 2D rendering context
 *
 * @returns Canvas setup object or null if initialization failed
 */
export function initializeCanvas(): CanvasSetup | null {
  const canvas = getById<HTMLCanvasElement>('gameCanvas');
  if (!canvas) {
    error('ui', 'Canvas element #gameCanvas not found in DOM');
    return null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    error('ui', 'Failed to get 2D rendering context from canvas');
    return null;
  }

  // Set canvas size to viewport
  resizeCanvas(canvas);

  // Listen for window resize
  window.addEventListener('resize', () => resizeCanvas(canvas));

  info('ui', `Canvas initialized (${canvas.width}x${canvas.height})`);
  return { canvas, ctx };
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
