import { vi } from 'vitest';

type MockAudioContext = {
  state: string;
  resume: () => Promise<void>;
  createGain: () => {
    connect: () => void;
    gain: { value: number };
  };
};

export function mockWebAudio() {
  const audioContextMock: MockAudioContext = {
    state: 'suspended',
    resume: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: { value: 1 }
    }))
  };

  global.AudioContext = vi.fn(() => audioContextMock) as unknown as typeof AudioContext;

  // Create mock Audio constructor that properly mimics HTMLAudioElement
  global.Audio = vi.fn(function(this: any, src?: string) {
    const mockInstance = {
      play: vi.fn(() => Promise.resolve(undefined)),
      pause: vi.fn(),
      load: vi.fn(),
      volume: 1,
      muted: false,
      currentTime: 0,
      loop: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      remove: vi.fn(),
      src: src || '',
      cloneNode: vi.fn()
    };

    // cloneNode should return a new mock audio instance with same src
    mockInstance.cloneNode.mockImplementation(() => {
      const clone = new (global.Audio as any)(mockInstance.src);
      return clone;
    });

    // Return the mock instance when used with 'new'
    return mockInstance;
  }) as unknown as typeof Audio;

  return audioContextMock;
}