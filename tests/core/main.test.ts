import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mutable mocks so we can reconfigure between tests
let mockIsMobile = false;
let initializeCanvasMock: ReturnType<typeof vi.fn>;
let initializeAudioMock: ReturnType<typeof vi.fn>;
let startBackgroundMusicMock: ReturnType<typeof vi.fn>;
let initializeInputMock: ReturnType<typeof vi.fn>;
let initializeUIMock: ReturnType<typeof vi.fn>;
let setupStarfieldMock: ReturnType<typeof vi.fn>;
let setCanvasMock: ReturnType<typeof vi.fn>;
let restartGameLoopMock: ReturnType<typeof vi.fn>;
let startGameMock: ReturnType<typeof vi.fn>;
let continueGameMock: ReturnType<typeof vi.fn>;
let showOverlayMock: ReturnType<typeof vi.fn>;
let setOverlayDimensionsMock: ReturnType<typeof vi.fn>;
let quitGameMock: ReturnType<typeof vi.fn>;
let initializeSettingsMock: ReturnType<typeof vi.fn>;
let hideSettingsMock: ReturnType<typeof vi.fn>;
let getByIdElements: Record<string, HTMLElement>;
const unmuteAllMock = vi.fn();

vi.mock('@core/init/canvasInit.js', () => ({
  initializeCanvas: (...args: unknown[]) => initializeCanvasMock(...args),
}));

vi.mock('@core/init/audioInit.js', () => ({
  initializeAudio: (...args: unknown[]) => initializeAudioMock(...args),
  startBackgroundMusic: (...args: unknown[]) => startBackgroundMusicMock(...args),
}));

vi.mock('@core/init/inputInit.js', () => ({
  initializeInput: (...args: unknown[]) => initializeInputMock(...args),
}));

vi.mock('@core/init/uiInit.js', () => ({
  initializeUI: (...args: unknown[]) => initializeUIMock(...args),
}));

vi.mock('@effects/starfield.js', () => ({
  setupStarfield: (...args: unknown[]) => setupStarfieldMock(...args),
}));

vi.mock('@game/gameLoop.js', () => ({
  setCanvas: (...args: unknown[]) => setCanvasMock(...args),
  restartGameLoop: (...args: unknown[]) => restartGameLoopMock(...args),
}));

vi.mock('@game/gameStateManager.js', () => ({
  startGame: (...args: unknown[]) => startGameMock(...args),
  continueGame: (...args: unknown[]) => continueGameMock(...args),
}));

const mockState = {
  gameState: { value: 'START' as 'START' | 'PLAYING' | 'PAUSED' | 'LEVEL_TRANSITION' | 'GAME_OVER' },
  score: { value: 0 },
  gameLevel: { value: 1 },
  allowSpawning: { value: true },
  lastObstacleSpawnTime: 0,
};

vi.mock('@core/state.js', () => mockState);

vi.mock('@utils/platform.js', () => ({
  isMobile: () => mockIsMobile,
}));

vi.mock('@core/logger.js', () => ({
  debug: vi.fn(),
  warn: vi.fn(),
}));

vi.mock('@ui/settings/settingsManager.js', () => ({
  initializeSettings: (...args: unknown[]) => initializeSettingsMock(...args),
}));

vi.mock('@ui/settings/settingsUI.js', () => ({
  showSettings: vi.fn(),
  hideSettings: (...args: unknown[]) => hideSettingsMock(...args),
}));

vi.mock('@utils/dom.js', () => ({
  getById: <T extends HTMLElement>(id: string) => getByIdElements[id] as T,
}));

vi.mock('@ui/overlays/overlayManager.js', () => ({
  showOverlay: (...args: unknown[]) => showOverlayMock(...args),
  setOverlayDimensions: (...args: unknown[]) => setOverlayDimensionsMock(...args),
  quitGame: (...args: unknown[]) => quitGameMock(...args),
}));

vi.mock('@services/ServiceProvider.js', () => ({
  services: {
    audioService: {
      unmuteAll: (...args: unknown[]) => unmuteAllMock(...args),
    },
  },
}));

function buildDom() {
  getByIdElements = {
    startButton: document.createElement('button'),
    restartButton: document.createElement('button'),
    continueButton: document.createElement('button'),
    quitButton: document.createElement('button'),
    startOverlay: document.createElement('div'),
    pauseOverlay: document.createElement('div'),
    levelTransitionOverlay: document.createElement('div'),
    starfieldCanvas: document.createElement('canvas'),
    settingsButtonStart: document.createElement('button'),
    settingsButtonLevel: document.createElement('button'),
    settingsButtonPause: document.createElement('button'),
    settingsButtonGameOver: document.createElement('button'),
  };

  document.body.innerHTML = '';
  Object.values(getByIdElements).forEach((el) => document.body.appendChild(el));
}

async function importMain() {
  await import('@core/main.ts');
}

describe('core/main', () => {
  beforeEach(() => {
    vi.resetModules();
    buildDom();

    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fill: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      ellipse: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const canvas = Object.assign(document.createElement('canvas'), {
      width: 800,
      height: 600,
      getContext: vi.fn(() => ctx),
    }) as HTMLCanvasElement;

    initializeCanvasMock = vi.fn(() => ({ canvas, ctx }));
    initializeAudioMock = vi.fn(() => Promise.resolve());
    startBackgroundMusicMock = vi.fn();
    initializeInputMock = vi.fn();
    initializeUIMock = vi.fn();
    setupStarfieldMock = vi.fn();
    setCanvasMock = vi.fn();
    restartGameLoopMock = vi.fn();
    startGameMock = vi.fn();
    continueGameMock = vi.fn();
    showOverlayMock = vi.fn();
    setOverlayDimensionsMock = vi.fn();
    quitGameMock = vi.fn();
    initializeSettingsMock = vi.fn();
    hideSettingsMock = vi.fn();
    unmuteAllMock.mockClear();
    mockState.gameState.value = 'START';
    mockState.score.value = 0;
    mockState.gameLevel.value = 1;
    mockState.allowSpawning.value = true;
    mockIsMobile = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes canvas, UI, audio and wires desktop overlay actions', async () => {
    await importMain();

    window.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();

    expect(initializeSettingsMock).toHaveBeenCalled();
    expect(initializeCanvasMock).toHaveBeenCalled();
    expect(initializeUIMock).toHaveBeenCalled();
    expect(initializeInputMock).toHaveBeenCalled();
    expect(initializeAudioMock).toHaveBeenCalledWith();
    expect(setOverlayDimensionsMock).toHaveBeenCalled();
    expect(setCanvasMock).toHaveBeenCalled();

    // Start button should trigger start logic (cover both click/touch paths)
    getByIdElements.startButton.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    getByIdElements.startButton.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    expect(unmuteAllMock).toHaveBeenCalled();
    expect(startBackgroundMusicMock).toHaveBeenCalled();
    expect(startGameMock).toHaveBeenCalled();
    expect(restartGameLoopMock).toHaveBeenCalled();

    // Restart button should re-run start flow
    getByIdElements.restartButton.dispatchEvent(new Event('click', { bubbles: true }));
    expect(startGameMock).toHaveBeenCalledTimes(2);

    // Quit on desktop
    getByIdElements.quitButton.dispatchEvent(new Event('click', { bubbles: true }));
    expect(quitGameMock).toHaveBeenCalled();

    // Keyboard Enter from GAME_OVER should restart
    mockState.gameState.value = 'GAME_OVER';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(startGameMock).toHaveBeenCalledTimes(3);

    // Escape should hide settings
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(hideSettingsMock).toHaveBeenCalled();
  });

  it('handles touch unlock flow and mobile overlay resume paths', async () => {
    mockIsMobile = true;
    await importMain();

    window.dispatchEvent(new Event('DOMContentLoaded'));
    await Promise.resolve();

    // First touch should attempt audio unlock and unmute
    document.dispatchEvent(new Event('touchend', { bubbles: true }));
    await Promise.resolve();
    expect(initializeAudioMock).toHaveBeenCalledWith(true);
    expect(unmuteAllMock).toHaveBeenCalled();

    // Mobile pause overlay resume
    mockState.gameState.value = 'PAUSED';
    const pauseEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    getByIdElements.pauseOverlay.dispatchEvent(pauseEvent);
    expect(mockState.gameState.value).toBe('PLAYING');
    expect(showOverlayMock).toHaveBeenCalledWith('PLAYING');
    expect(restartGameLoopMock).toHaveBeenCalled();

    // Level transition continue on touch
    mockState.gameState.value = 'LEVEL_TRANSITION';
    const levelEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    getByIdElements.levelTransitionOverlay.dispatchEvent(levelEvent);
    expect(continueGameMock).toHaveBeenCalled();
    expect(restartGameLoopMock).toHaveBeenCalled();
  });
});
