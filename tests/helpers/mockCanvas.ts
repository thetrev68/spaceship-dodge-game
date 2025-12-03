import { vi } from 'vitest';

export function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

export function createMock2DContext(): CanvasRenderingContext2D {
  const canvas = createMockCanvas();
  const ctx = canvas.getContext('2d')!;

  // Mock methods that aren't implemented in jsdom
  ctx.fillRect = vi.fn();
  ctx.strokeRect = vi.fn();
  ctx.clearRect = vi.fn();
  ctx.beginPath = vi.fn();
  ctx.closePath = vi.fn();
  ctx.arc = vi.fn();
  ctx.fill = vi.fn();
  ctx.stroke = vi.fn();
  ctx.moveTo = vi.fn();
  ctx.lineTo = vi.fn();

  return ctx;
}