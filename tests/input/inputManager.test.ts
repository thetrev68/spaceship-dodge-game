import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupInput } from '@input/inputManager';
import { gameState } from '@core/state';
import { showOverlay } from '@ui/overlays/overlayManager';
import { services } from '@services/ServiceProvider';

vi.mock('@ui/overlays/overlayManager', () => ({
  showOverlay: vi.fn(),
}));

vi.mock('@services/ServiceProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services/ServiceProvider')>();
  return {
    ...actual,
    services: {
      ...actual.services,
      audioService: {
        playSound: vi.fn(),
        stopMusic: vi.fn(),
        startMusic: vi.fn(),
        unlock: vi.fn(),
        setBackgroundMusicVolume: vi.fn(),
        setSoundEffectsVolume: vi.fn(),
        muteAll: vi.fn(),
        unmuteAll: vi.fn(),
        isMuted: vi.fn(() => false),
      },
    },
  };
});

describe('inputManager', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.innerHTML = '';
    document.body.appendChild(canvas);
    gameState.value = 'PLAYING';
  });

  it('pauses and mutes on P key press', () => {
    setupInput(canvas);
    const event = new KeyboardEvent('keydown', { key: 'p' });
    document.dispatchEvent(event);
    expect(gameState.value).toBe('PAUSED');
    expect(services.audioService.muteAll as ReturnType<typeof vi.fn>).toHaveBeenCalled();
    expect(showOverlay).toHaveBeenCalledWith('PAUSED');
  });
});
