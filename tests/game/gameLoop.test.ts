import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { gameState } from '@core/state';
import { restartGameLoop, stopGameLoop, setCanvas } from '@game/gameLoop';
import { createMockCanvas } from '../helpers/mockCanvas';

describe('Game Loop', () => {
  let cleanup: () => void;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    canvas = createMockCanvas();
    setCanvas(canvas);
    gameState.value = 'PLAYING';
  });

  afterEach(() => {
    cleanup();
    // Ensure cancelAnimationFrame is mocked before calling stopGameLoop
    if (!global.cancelAnimationFrame) {
      global.cancelAnimationFrame = vi.fn();
    }
    stopGameLoop();
    vi.clearAllMocks();
  });

  it('should start game loop when game state is PLAYING', () => {
    // Mock requestAnimationFrame to track calls without executing
    const mockRaf = vi.fn((cb: FrameRequestCallback) => {
      // Don't execute the callback to avoid infinite loop
      return 1;
    });
    global.requestAnimationFrame = mockRaf as any;

    // Start game loop
    restartGameLoop();

    // Verify requestAnimationFrame was called
    expect(mockRaf).toHaveBeenCalled();
  });

  it('should stop game loop when game state is not PLAYING', () => {
    // Mock requestAnimationFrame and cancelAnimationFrame
    const mockRaf = vi.fn((cb: FrameRequestCallback) => {
      // Don't execute the callback to avoid infinite loop
      return 1;
    });
    const mockCancel = vi.fn();
    global.requestAnimationFrame = mockRaf as any;
    global.cancelAnimationFrame = mockCancel;

    // Start with PLAYING state
    gameState.value = 'PLAYING';
    restartGameLoop();
    expect(mockRaf).toHaveBeenCalledTimes(1);

    // Change state to non-PLAYING should stop loop on next iteration
    gameState.value = 'PAUSED';

    // Manually trigger the loop callback to see it stop
    const callback = mockRaf.mock.calls[0]?.[0] as FrameRequestCallback | undefined;
    if (callback) {
      callback(16);
    }

    // Verify cancelAnimationFrame was called
    expect(mockCancel).toHaveBeenCalled();
  });

  it('should call requestAnimationFrame when game loop runs', () => {
    // Mock performance.now()
    vi.spyOn(performance, 'now').mockReturnValue(0);

    // Mock requestAnimationFrame and cancelAnimationFrame
    const mockRaf = vi.fn((cb: FrameRequestCallback) => 1);
    const mockCancel = vi.fn();
    global.requestAnimationFrame = mockRaf as any;
    global.cancelAnimationFrame = mockCancel;

    // Start game loop
    restartGameLoop();

    // Verify requestAnimationFrame was called to schedule the loop
    expect(mockRaf).toHaveBeenCalledTimes(1);
    expect(mockRaf).toHaveBeenCalledWith(expect.any(Function));
  });
});