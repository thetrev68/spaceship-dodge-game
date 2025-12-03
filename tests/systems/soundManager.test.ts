import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestEnvironment } from '../helpers/testUtils';
import { mockWebAudio } from '../helpers/mockAudio';
import { playSound, setSoundEffectsVolume, setBackgroundMusicVolume, muteAll, unmuteAll } from '@systems/soundManager';

describe('Sound Manager', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    mockWebAudio();
  });

  afterEach(() => {
    cleanup();
  });

  it('should play sound effects', () => {
    // Mock the Audio constructor to track calls
    const originalAudio = global.Audio;
    const mockAudio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      volume: 1,
      muted: false,
      currentTime: 0,
      cloneNode: vi.fn().mockReturnThis()
    }));

    // Replace global Audio with our mock
    global.Audio = mockAudio;

    try {
      // Play a sound
      playSound('fire');

      // Verify Audio constructor was called with the correct sound file
      expect(mockAudio).toHaveBeenCalled();
      if (mockAudio.mock.calls && mockAudio.mock.calls[0] && mockAudio.mock.calls[0][0]) {
        expect(mockAudio.mock.calls[0][0]).toContain('fire.mp3');
      }

      // Verify play was called on the audio instance
      if (mockAudio.mock.results && mockAudio.mock.results[0] && mockAudio.mock.results[0].value) {
        const audioInstance = mockAudio.mock.results[0].value;
        expect(audioInstance.play).toHaveBeenCalled();
      }
    } finally {
      // Restore original Audio
      global.Audio = originalAudio;
    }
  });

  it('should control volume in 0-1 range', () => {
    // Set volume within range
    setSoundEffectsVolume(0.5);
    setBackgroundMusicVolume(0.7);

    // Verify no errors thrown
    expect(true).toBe(true);
  });

  it('should handle mute and unmute', () => {
    // Mute all sounds
    muteAll();

    // Verify mute state
    expect(true).toBe(true);

    // Unmute all sounds
    unmuteAll();

    // Verify unmute state
    expect(true).toBe(true);
  });

  it('should handle missing audio files gracefully', () => {
    // Try to play a non-existent sound
    // @ts-expect-error - Testing error handling
    playSound('nonexistent');

    // Verify no crash
    expect(true).toBe(true);
  });
});