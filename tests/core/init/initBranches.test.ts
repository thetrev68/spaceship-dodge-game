import { describe, it, expect, vi } from 'vitest';

describe('init module branches', () => {
  it('handles missing canvas and context failures', async () => {
    vi.resetModules();
    const getById = vi.fn().mockReturnValue(null);
    vi.doMock('@utils/dom.js', () => ({ getById }));
    const { initializeCanvas } = await import('@core/init/canvasInit.js');
    expect(initializeCanvas()).toBeNull();

    const badCtx = { getContext: vi.fn(() => null) };
    getById.mockReturnValue(badCtx as unknown as HTMLCanvasElement);
    expect(initializeCanvas()).toBeNull();
  });

  it('respects audio settings and mute paths', async () => {
    vi.resetModules();
    const audioService = {
      unlock: vi.fn().mockResolvedValue(undefined),
      unmuteAll: vi.fn(),
      setSoundEffectsVolume: vi.fn(),
      setBackgroundMusicVolume: vi.fn(),
      muteAll: vi.fn(),
      startMusic: vi.fn(),
    };
    vi.doMock('@services/ServiceProvider.js', () => ({ services: { audioService } }));
    vi.doMock('@ui/settings/settingsManager.js', () => ({
      getSettings: vi.fn(() => ({ backgroundMusicVolume: 0.2, soundEffectsVolume: 0.4, isMuted: true })),
    }));

    const { initializeAudio, startBackgroundMusic } = await import('@core/init/audioInit.js');
    await initializeAudio(true);
    expect(audioService.unlock).toHaveBeenCalled();
    expect(audioService.muteAll).toHaveBeenCalled();

    // Trigger catch path
    audioService.setSoundEffectsVolume.mockImplementation(() => { throw new Error('fail'); });
    await initializeAudio(true);
    startBackgroundMusic();
    expect(audioService.startMusic).toHaveBeenCalled();
  });

  it('initializes input for mobile devices', async () => {
    vi.resetModules();
    const setupInput = vi.fn();
    const setupMobileInput = vi.fn();
    vi.doMock('@input/inputManager.js', () => ({ setupInput }));
    vi.doMock('@input/mobileControls.js', () => ({ setupMobileInput }));
    vi.doMock('@core/state.js', async () => {
      const actual = await vi.importActual<typeof import('@core/state.js')>('@core/state.js');
      return { ...actual, isMobile: true };
    });

    const { initializeInput } = await import('@core/init/inputInit.js');
    const canvas = document.createElement('canvas');
    initializeInput(canvas);
    expect(setupMobileInput).toHaveBeenCalledWith(canvas);
    expect(setupInput).not.toHaveBeenCalled();
  });
});
