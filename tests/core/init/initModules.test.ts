import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeCanvas } from '@core/init/canvasInit';
import { initializeAudio } from '@core/init/audioInit';
import { initializeInput } from '@core/init/inputInit';
import { initializeUI } from '@core/init/uiInit';
import { setupInput } from '@input/inputManager';

vi.mock('@utils/dom.js', () => ({
  getById: vi.fn((id: string) => {
    if (id === 'gameCanvas') {
      return document.createElement('canvas');
    }
    return document.createElement('div');
  }),
}));

vi.mock('@input/inputManager', () => ({
  setupInput: vi.fn(),
}));
vi.mock('@input/mobileControls', () => ({
  setupMobileInput: vi.fn(),
}));
vi.mock('@utils/platform.js', () => ({
  isMobile: vi.fn(() => false),
}));
vi.mock('@core/logger.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@core/logger.js')>();
  return {
    ...actual,
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  };
});
vi.mock('@ui/settings/settingsUI.js', () => ({
  initializeSettingsUI: vi.fn(),
}));
vi.mock('@ui/controls/audioControls.js', () => ({
  createAudioControls: vi.fn(),
}));
vi.mock('@ui/hud/perfHUD.js', () => ({
  initPerfHud: vi.fn(),
}));
vi.mock('@ui/hud/scorePopups.js', () => ({
  initializeScorePopups: vi.fn(),
}));

vi.mock('@services/ServiceProvider.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services/ServiceProvider.js')>();
  return {
    ...actual,
    services: {
      ...actual.services,
      audioService: {
        unlock: vi.fn().mockResolvedValue(undefined),
        unmuteAll: vi.fn(),
        setBackgroundMusicVolume: vi.fn(),
        setSoundEffectsVolume: vi.fn(),
        muteAll: vi.fn(),
        startMusic: vi.fn(),
        stopMusic: vi.fn(),
        playSound: vi.fn(),
        isMuted: vi.fn(() => false),
      },
    },
  };
});

import { services } from '@services/ServiceProvider.js';
import { getSettings } from '@ui/settings/settingsManager.js';

vi.mock('@ui/settings/settingsManager.js', () => ({
  getSettings: vi.fn(() => ({
    backgroundMusicVolume: 0.5,
    soundEffectsVolume: 0.5,
    isMuted: false,
  })),
}));

describe('init modules', () => {
  beforeEach(() => {
    document.body.innerHTML = '<canvas id="gameCanvas"></canvas>';
  });

  it('initializes canvas', () => {
    const setup = initializeCanvas();
    expect(setup?.canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('initializes audio with settings', async () => {
    await initializeAudio(true);
    expect(services.audioService.unlock).toHaveBeenCalled();
    expect(services.audioService.setBackgroundMusicVolume).toHaveBeenCalledWith(getSettings().backgroundMusicVolume);
  });

  it('initializes input (desktop path)', () => {
    const canvas = document.createElement('canvas');
    initializeInput(canvas);
    expect(setupInput).toHaveBeenCalledWith(canvas);
  });

  it('initializes UI components', () => {
    expect(() => initializeUI()).not.toThrow();
  });
});
