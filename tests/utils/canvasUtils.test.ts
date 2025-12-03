import { describe, it, expect } from 'vitest';
import { initializeCanvas, setOverlayDimensions } from '@utils/canvasUtils';

describe('canvasUtils', () => {
  it('initializes canvas for desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    const canvas = document.createElement('canvas');
    initializeCanvas(canvas);
    expect(canvas.width).toBe(1200);
    expect(canvas.height).toBe(800);
    expect(canvas.style.display).toBe('block');
  });

  it('initializes canvas for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 700, writable: true });
    const canvas = document.createElement('canvas');
    initializeCanvas(canvas);
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.style.width).toBe('100vw');
    expect(canvas.style.objectFit).toBe('contain');
  });

  it('sets overlay dimensions to match canvas', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => ({ width: 500, height: 400, left: 10, top: 20 }),
    });
    const overlay = document.createElement('div');
    setOverlayDimensions(canvas, [overlay]);
    expect(overlay.style.width).toBe('500px');
    expect(overlay.style.height).toBe('400px');
    expect(overlay.style.left).toBe('10px');
    expect(overlay.style.top).toBe('20px');
  });
});
