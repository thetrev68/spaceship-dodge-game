import { vi } from 'vitest';

// Mock canvas globally - simplified approach
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  const mockContext = {
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

  // Add some basic properties to make it more complete
  Object.defineProperty(mockContext, 'canvas', {
    get: () => ({ width: 800, height: 600 }),
    configurable: true
  });

  Object.defineProperty(mockContext, 'globalAlpha', {
    value: 1,
    writable: true
  });

  return mockContext;
}) as any;

// Mock HTMLAudioElement to avoid jsdom audio issues
class MockAudio {
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  cloneNode = vi.fn(() => new MockAudio());
  volume = 1;
  muted = false;
  currentTime = 0;
  loop = false;
}

global.HTMLAudioElement = MockAudio as unknown as typeof HTMLAudioElement;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 0;
});

global.cancelAnimationFrame = vi.fn();