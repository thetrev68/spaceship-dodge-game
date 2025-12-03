import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('soundManager branches', () => {
  let createdAudio: unknown[];

  beforeEach(() => {
    vi.resetModules();
    createdAudio = [];
  });

  it('blocks startMusic when muted or locked and applies volumes', async () => {
    class SpyAudio extends (global.HTMLAudioElement as typeof HTMLAudioElement) {
      constructor() {
        super();
        createdAudio.push(this);
      }
    }
    (global as unknown as { Audio: typeof Audio }).Audio = SpyAudio as unknown as typeof Audio;
    const soundManager = await import('@systems/soundManager.js');
    const initialCount = createdAudio.length;

    // Initially locked -> startMusic early return
    soundManager.startMusic();
    expect(createdAudio.length).toBe(initialCount);

    // Unlock and create bgm
    await soundManager.forceAudioUnlock();
    soundManager.unmuteAll();
    soundManager.startMusic();
    expect(createdAudio.length).toBeGreaterThan(0);

    soundManager.setBackgroundMusicVolume(0.2);
    soundManager.setSoundEffectsVolume(0.3);
    soundManager.muteAll();
    soundManager.unmuteAll();

    // Ensure playSound respects unlocked/muted toggles
    soundManager.playSound('fire');
    soundManager.muteAll();
    soundManager.playSound('break'); // muted path should skip
  });

  it('stopMusic and muteAll handle absent bgm safely', async () => {
    class SpyAudio extends (global.HTMLAudioElement as typeof HTMLAudioElement) {
      constructor() {
        super();
        createdAudio.push(this);
      }
    }
    (global as unknown as { Audio: typeof Audio }).Audio = SpyAudio as unknown as typeof Audio;
    const soundManager = await import('@systems/soundManager.js');
    soundManager.stopMusic(); // no bgm yet, should not throw
    soundManager.muteAll();
    expect(soundManager.isAudioMuted()).toBe(true);
  });
});
