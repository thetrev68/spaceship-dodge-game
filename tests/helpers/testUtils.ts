import { vi } from 'vitest';

export function waitForNextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

export function advanceTime(ms: number) {
  vi.advanceTimersByTime(ms);
}

export function setupTestEnvironment() {
  // Reset all mocks
  vi.clearAllMocks();

  // Use fake timers
  vi.useFakeTimers();

  return () => {
    vi.useRealTimers();
  };
}