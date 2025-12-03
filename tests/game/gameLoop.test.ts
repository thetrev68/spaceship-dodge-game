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
    stopGameLoop();
    vi.clearAllMocks();
  });

  it('should start game loop when game state is PLAYING', () => {
    // Mock requestAnimationFrame to track calls
    const mockRaf = vi.fn((cb) => {
      cb(16); // Call with timestamp
      return 1;
    });
    global.requestAnimationFrame = mockRaf;

    // Start game loop
    restartGameLoop();

    // Verify requestAnimationFrame was called
    expect(mockRaf).toHaveBeenCalled();
  });

  it('should stop game loop when game state is not PLAYING', () => {
    gameState.value = 'PAUSED';

    // Mock requestAnimationFrame
    const mockRaf = vi.fn((cb) => {
      cb(16);
      return 1;
    });
    global.requestAnimationFrame = mockRaf;

    // Start game loop
    restartGameLoop();

    // Change state to non-PLAYING
    gameState.value = 'GAME_OVER';

    // Advance time
    vi.advanceTimersByTime(16);

    // Verify game loop stopped (no further animation frames)
    expect(mockRaf).toHaveBeenCalledTimes(1); // Only initial call
  });

  it('should handle canvas rendering', () => {
    // Mock requestAnimationFrame to allow one frame
    const mockRaf = vi.fn((cb) => {
      cb(16);
      return 1;
    });
    global.requestAnimationFrame = mockRaf;

    // Start game loop
    restartGameLoop();

    // Advance time
    vi.advanceTimersByTime(16);

    // Verify animation frame was requested
    expect(mockRaf).toHaveBeenCalled();
  });
});