import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupMobileInput } from '@input/mobileControls';
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

describe('mobileControls', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    document.body.innerHTML = '';
    document.body.appendChild(canvas);
    gameState.value = 'PLAYING';

    // Minimal TouchEvent mock for jsdom
    if (typeof TouchEvent === 'undefined') {
      (global as any).TouchEvent = class extends Event {
        touches: any[];
        constructor(type: string, init: any = {}) {
          super(type, init);
          this.touches = init.touches || [];
        }
      };
    }
  });

  it('pauses and mutes on touchend while playing', () => {
    setupMobileInput(canvas);
    const touchStart = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [{ clientX: 0, clientY: 0 }],
    });
    canvas.dispatchEvent(touchStart);

    const touchEnd = new TouchEvent('touchend', { bubbles: true, cancelable: true });
    document.dispatchEvent(touchEnd);
    expect(gameState.value).toBe('PAUSED');
    expect(showOverlay).toHaveBeenCalledWith('PAUSED');
    expect((services.audioService.muteAll as ReturnType<typeof vi.fn>)).toHaveBeenCalled();
  });
});
