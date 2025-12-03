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
  global.Audio = vi.fn(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    volume: 1,
    muted: false,
    currentTime: 0
  })) as unknown as typeof Audio;

  return audioContextMock;
}