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
      gain: { value: 1 },
    })),
  };

  globalThis.AudioContext = vi.fn(() => audioContextMock) as unknown as typeof AudioContext;

  // Create mock Audio constructor that properly mimics HTMLAudioElement
  type MockAudioInstance = {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    load: ReturnType<typeof vi.fn>;
    volume: number;
    muted: boolean;
    currentTime: number;
    loop: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    src: string;
    cloneNode: ReturnType<typeof vi.fn>;
  };

  const AudioCtor = vi.fn(function MockAudio(this: unknown, src?: string) {
    const mockInstance: MockAudioInstance = {
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
      cloneNode: vi.fn(),
    };

    mockInstance.cloneNode.mockImplementation(() => {
      const clone: MockAudioInstance = {
        ...mockInstance,
        play: vi.fn(() => Promise.resolve(undefined)),
        pause: vi.fn(),
        load: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        remove: vi.fn(),
        cloneNode: vi.fn(),
      };
      return clone as unknown as HTMLAudioElement;
    });

    return mockInstance as unknown as HTMLAudioElement;
  }) as unknown as typeof Audio;

  globalThis.Audio = AudioCtor;

  return audioContextMock;
}
