import { vi } from 'vitest';

// Mock canvas globally - simplified approach
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  const mockContext: Partial<CanvasRenderingContext2D> = {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillText: vi.fn(),
    font: '',
    textAlign: 'left'
  };

  Object.defineProperty(mockContext, 'canvas', {
    get: () => ({ width: 800, height: 600 }),
    configurable: true
  });

  Object.defineProperty(mockContext, 'globalAlpha', {
    value: 1,
    writable: true
  });

  return mockContext as CanvasRenderingContext2D;
}) as unknown as HTMLCanvasElement['getContext'];

// Mock HTMLAudioElement to avoid jsdom audio issues
class MockAudio {
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  cloneNode = vi.fn(() => new MockAudio());
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  remove = vi.fn();
  volume = 1;
  muted = false;
  currentTime = 0;
  loop = false;
}

global.HTMLAudioElement = MockAudio as unknown as typeof HTMLAudioElement;

// Also mock window.Audio constructor used in soundManager
global.Audio = vi.fn(function MockHTMLAudio(this: any) {
  return new (global.HTMLAudioElement as any)();
}) as unknown as typeof Audio;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 0;
}) as unknown as typeof requestAnimationFrame;

global.cancelAnimationFrame = vi.fn() as unknown as typeof cancelAnimationFrame;
