import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';

type Fn<T extends (...args: any[]) => any> = MockedFunction<T>;

// Mutable mocks so we can reconfigure between tests
let mockIsMobile = false;
let initializeCanvasMock: Fn<
  () => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null
>;
let initializeAudioMock: Fn<(gesture?: boolean) => Promise<void>>;
let startBackgroundMusicMock: Fn<() => void>;
let initializeInputMock: Fn<(canvas: HTMLCanvasElement) => void>;
let initializeUIMock: Fn<() => void>;
let setupStarfieldMock: Fn<(canvas: HTMLCanvasElement) => void>;
let setCanvasMock: Fn<(canvas: HTMLCanvasElement) => void>;
let restartGameLoopMock: Fn<() => void>;
let startGameMock: Fn<(canvas: HTMLCanvasElement) => void>;
let continueGameMock: Fn<() => void>;
let showOverlayMock: Fn<(...args: unknown[]) => unknown>;
let setOverlayDimensionsMock: Fn<(canvas: HTMLCanvasElement) => void>;
let quitGameMock: Fn<() => void>;
let initializeSettingsMock: Fn<() => void>;
let hideSettingsMock: Fn<() => void>;
let getByIdElements: Record<string, HTMLElement>;
const unmuteAllMock = vi.fn();

vi.mock('@core/init/canvasInit.js', () => ({
  initializeCanvas: () => initializeCanvasMock(),
}));

vi.mock('@core/init/audioInit.js', () => ({
  initializeAudio: (gesture?: boolean) => initializeAudioMock(gesture),
  startBackgroundMusic: () => startBackgroundMusicMock(),
}));

vi.mock('@core/init/inputInit.js', () => ({
  initializeInput: (canvas: HTMLCanvasElement) => initializeInputMock(canvas),
}));

vi.mock('@core/init/uiInit.js', () => ({
  initializeUI: () => initializeUIMock(),
}));

vi.mock('@effects/starfield.js', () => ({
  setupStarfield: (canvas: HTMLCanvasElement) => setupStarfieldMock(canvas),
}));

vi.mock('@game/gameLoop.js', () => ({
  setCanvas: (canvas: HTMLCanvasElement) => setCanvasMock(canvas),
  restartGameLoop: () => restartGameLoopMock(),
}));

vi.mock('@game/gameStateManager.js', () => ({
  startGame: (canvas: HTMLCanvasElement) => startGameMock(canvas),
  continueGame: () => continueGameMock(),
}));

const mockState = {
  gameState: {
    value: 'START' as 'START' | 'PLAYING' | 'PAUSED' | 'LEVEL_TRANSITION' | 'GAME_OVER',
  },
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
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@ui/settings/settingsManager.js', () => ({
  initializeSettings: () => initializeSettingsMock(),
}));

vi.mock('@ui/settings/settingsUI.js', () => ({
  showSettings: vi.fn(),
  hideSettings: () => hideSettingsMock(),
}));

vi.mock('@utils/dom.js', () => ({
  getById: <T extends HTMLElement>(id: string) => getByIdElements[id] as T,
}));

vi.mock('@ui/overlays/overlayManager.js', () => ({
  showOverlay: (...args: unknown[]) => showOverlayMock(...args),
  setOverlayDimensions: (canvas: HTMLCanvasElement) => setOverlayDimensionsMock(canvas),
  quitGame: () => quitGameMock(),
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
  await import('@core/main.js');
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

    initializeCanvasMock = vi.fn(() => ({ canvas, ctx })) as Fn<
      () => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null
    >;
    initializeAudioMock = vi.fn(() => Promise.resolve()) as Fn<
      (gesture?: boolean) => Promise<void>
    >;
    startBackgroundMusicMock = vi.fn() as Fn<() => void>;
    initializeInputMock = vi.fn() as Fn<(canvas: HTMLCanvasElement) => void>;
    initializeUIMock = vi.fn() as Fn<() => void>;
    setupStarfieldMock = vi.fn() as Fn<(canvas: HTMLCanvasElement) => void>;
    setCanvasMock = vi.fn() as Fn<(canvas: HTMLCanvasElement) => void>;
    restartGameLoopMock = vi.fn() as Fn<() => void>;
    startGameMock = vi.fn() as Fn<(canvas: HTMLCanvasElement) => void>;
    continueGameMock = vi.fn() as Fn<() => void>;
    showOverlayMock = vi.fn() as Fn<(...args: unknown[]) => unknown>;
    setOverlayDimensionsMock = vi.fn() as Fn<(canvas: HTMLCanvasElement) => void>;
    quitGameMock = vi.fn() as Fn<() => void>;
    initializeSettingsMock = vi.fn() as Fn<() => void>;
    hideSettingsMock = vi.fn() as Fn<() => void>;
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
    expect(initializeAudioMock).toHaveBeenCalled();
    expect(setOverlayDimensionsMock).toHaveBeenCalled();
    expect(setCanvasMock).toHaveBeenCalled();

    // Start button should trigger start logic (cover both click/touch paths)
    getByIdElements.startButton!.dispatchEvent(
      new Event('click', { bubbles: true, cancelable: true })
    );
    getByIdElements.startButton!.dispatchEvent(
      new Event('touchstart', { bubbles: true, cancelable: true })
    );
    expect(unmuteAllMock).toHaveBeenCalled();
    expect(startBackgroundMusicMock).toHaveBeenCalled();
    expect(startGameMock).toHaveBeenCalled();
    expect(restartGameLoopMock).toHaveBeenCalled();

    // Restart button should re-run start flow
    getByIdElements.restartButton!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(startGameMock).toHaveBeenCalledTimes(2);

    // Quit on desktop
    getByIdElements.quitButton!.dispatchEvent(new Event('click', { bubbles: true }));
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
    getByIdElements.pauseOverlay!.dispatchEvent(pauseEvent);
    expect(mockState.gameState.value).toBe('PLAYING');
    expect(showOverlayMock).toHaveBeenCalledWith('PLAYING');
    expect(restartGameLoopMock).toHaveBeenCalled();

    // Level transition continue on touch
    mockState.gameState.value = 'LEVEL_TRANSITION';
    const levelEvent = new Event('touchstart', { bubbles: true, cancelable: true });
    getByIdElements.levelTransitionOverlay!.dispatchEvent(levelEvent);
    expect(continueGameMock).toHaveBeenCalled();
    expect(restartGameLoopMock).toHaveBeenCalled();
  });
});
