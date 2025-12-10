import { describe, it, beforeEach, expect, vi } from 'vitest';

type OverlayElements = {
  startButton: HTMLButtonElement;
  restartButton: HTMLButtonElement;
  continueButton: HTMLButtonElement;
  quitButton: HTMLButtonElement;
  startOverlay: HTMLElement;
  pauseOverlay: HTMLElement;
  levelTransitionOverlay: HTMLElement;
  starfieldCanvas: HTMLCanvasElement;
  settingsButtonStart: HTMLButtonElement;
  settingsButtonLevel: HTMLButtonElement;
  settingsButtonPause: HTMLButtonElement;
  settingsButtonGameOver: HTMLButtonElement;
};

const buildElements = (): OverlayElements => {
  const els: OverlayElements = {
    startButton: Object.assign(document.createElement('button'), { id: 'startButton' }),
    restartButton: Object.assign(document.createElement('button'), { id: 'restartButton' }),
    continueButton: Object.assign(document.createElement('button'), { id: 'continueButton' }),
    quitButton: Object.assign(document.createElement('button'), { id: 'quitButton' }),
    startOverlay: Object.assign(document.createElement('div'), { id: 'startOverlay' }),
    pauseOverlay: Object.assign(document.createElement('div'), { id: 'pauseOverlay' }),
    levelTransitionOverlay: Object.assign(document.createElement('div'), {
      id: 'levelTransitionOverlay',
    }),
    starfieldCanvas: Object.assign(document.createElement('canvas'), { id: 'starfieldCanvas' }),
    settingsButtonStart: Object.assign(document.createElement('button'), {
      id: 'settingsButtonStart',
    }),
    settingsButtonLevel: Object.assign(document.createElement('button'), {
      id: 'settingsButtonLevel',
    }),
    settingsButtonPause: Object.assign(document.createElement('button'), {
      id: 'settingsButtonPause',
    }),
    settingsButtonGameOver: Object.assign(document.createElement('button'), {
      id: 'settingsButtonGameOver',
    }),
  };

  Object.values(els).forEach((el) => document.body.appendChild(el));
  return els;
};

describe('overlayInit', () => {
  const warnMock = vi.hoisted(() => vi.fn());
  const debugMock = vi.hoisted(() => vi.fn());
  const setOverlayDimensionsMock = vi.hoisted(() => vi.fn());
  const setCanvasMock = vi.hoisted(() => vi.fn());
  const setupStarfieldMock = vi.hoisted(() => vi.fn());
  const showOverlayMock = vi.hoisted(() => vi.fn());
  const startBackgroundMusicMock = vi.hoisted(() => vi.fn());
  const unmuteMock = vi.hoisted(() => vi.fn());
  const startGameMock = vi.hoisted(() => vi.fn());
  const restartGameLoopMock = vi.hoisted(() => vi.fn());
  const continueGameMock = vi.hoisted(() => vi.fn());
  const quitGameMock = vi.hoisted(() => vi.fn());
  const showSettingsMock = vi.hoisted(() => vi.fn());
  const hideSettingsMock = vi.hoisted(() => vi.fn());
  const mobileFlag = vi.hoisted(() => ({ value: false }));

  vi.mock('@core/logger.js', () => ({
    debug: (...args: unknown[]) => debugMock(...args),
    warn: (...args: unknown[]) => warnMock(...args),
    info: vi.fn(),
    error: vi.fn(),
    log: {
      debug: (...args: unknown[]) => debugMock(...args),
      warn: (...args: unknown[]) => warnMock(...args),
      info: vi.fn(),
      error: vi.fn(),
    },
  }));
  vi.mock('@utils/platform.js', () => ({
    isMobile: () => mobileFlag.value,
  }));
  vi.mock('@ui/overlays/overlayManager.js', () => ({
    showOverlay: (...args: unknown[]) => showOverlayMock(...args),
    setOverlayDimensions: (...args: unknown[]) => setOverlayDimensionsMock(...args),
    quitGame: () => quitGameMock(),
  }));
  vi.mock('@effects/starfield.js', () => ({
    setupStarfield: (...args: unknown[]) => setupStarfieldMock(...args),
  }));
  vi.mock('@game/gameLoop.js', () => ({
    setCanvas: (...args: unknown[]) => setCanvasMock(...args),
    restartGameLoop: () => restartGameLoopMock(),
  }));
  vi.mock('@game/gameStateManager.js', () => ({
    startGame: (...args: unknown[]) => startGameMock(...args),
    continueGame: () => continueGameMock(),
  }));
  vi.mock('@ui/settings/settingsUI.js', () => ({
    showSettings: () => showSettingsMock(),
    hideSettings: () => hideSettingsMock(),
  }));
  vi.mock('@services/ServiceProvider.js', () => ({
    services: { audioService: { unmuteAll: () => unmuteMock() } },
  }));
  vi.mock('@core/state.js', () => ({
    gameState: {
      value: 'START' as 'START' | 'PLAYING' | 'PAUSED' | 'LEVEL_TRANSITION' | 'GAME_OVER',
    },
  }));
  vi.mock('@core/init/audioInit.js', () => ({
    startBackgroundMusic: () => startBackgroundMusicMock(),
  }));
  vi.mock('@utils/dom.js', () => ({
    getById: <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null,
  }));

  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
    mobileFlag.value = false;
    warnMock.mockClear();
    debugMock.mockClear();
    setOverlayDimensionsMock.mockClear();
    setCanvasMock.mockClear();
    setupStarfieldMock.mockClear();
    showOverlayMock.mockClear();
    startBackgroundMusicMock.mockClear();
    unmuteMock.mockClear();
    startGameMock.mockClear();
    restartGameLoopMock.mockClear();
    continueGameMock.mockClear();
    quitGameMock.mockClear();
    showSettingsMock.mockClear();
    hideSettingsMock.mockClear();
  });

  it('warns and returns early when start overlay is missing', async () => {
    const { wireOverlayControls } = await import('@core/init/overlayInit.js');
    wireOverlayControls(document.createElement('canvas'));
    expect(warnMock).toHaveBeenCalled();
    expect(setOverlayDimensionsMock).not.toHaveBeenCalled();
  });

  it('wires desktop overlay controls and handlers', async () => {
    const { wireOverlayControls } = await import('@core/init/overlayInit.js');
    const els = buildElements();
    wireOverlayControls(document.createElement('canvas'));

    expect(setOverlayDimensionsMock).toHaveBeenCalled();
    expect(setCanvasMock).toHaveBeenCalled();
    expect(setupStarfieldMock).toHaveBeenCalledWith(els.starfieldCanvas as HTMLCanvasElement);

    els.startButton.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    els.startButton.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    // unmuteAll is no longer called - respects user's mute preference
    expect(startBackgroundMusicMock).toHaveBeenCalled();
    expect(startGameMock).toHaveBeenCalled();
    expect(restartGameLoopMock).toHaveBeenCalled();

    els.restartButton.dispatchEvent(new Event('click'));
    expect(startGameMock).toHaveBeenCalledTimes(2);

    els.quitButton.dispatchEvent(new Event('click'));
    expect(quitGameMock).toHaveBeenCalled();

    els.settingsButtonStart.dispatchEvent(new Event('click', { cancelable: true }));
    expect(showSettingsMock).toHaveBeenCalled();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(hideSettingsMock).toHaveBeenCalled();
  });

  it('handles mobile touch resume flows', async () => {
    mobileFlag.value = true;
    const { wireOverlayControls } = await import('@core/init/overlayInit.js');
    const { gameState } = await import('@core/state.js');
    const els = buildElements();
    wireOverlayControls(document.createElement('canvas'));

    // Background now initializes on mobile (with 0 particles for performance)
    expect(setupStarfieldMock).toHaveBeenCalledWith(els.starfieldCanvas);

    gameState.value = 'PAUSED';
    const pauseEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    els.pauseOverlay.dispatchEvent(pauseEvent);
    expect(showOverlayMock).toHaveBeenCalledWith('PLAYING');
    expect(restartGameLoopMock).toHaveBeenCalled();

    gameState.value = 'LEVEL_TRANSITION';
    const levelEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    (document.getElementById('levelTransitionOverlay') as HTMLElement).dispatchEvent(levelEvent);
    expect(continueGameMock).toHaveBeenCalled();
    expect(restartGameLoopMock).toHaveBeenCalledTimes(2);
  });
});
