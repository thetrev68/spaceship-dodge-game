import { initializeBackground, setupBackgroundWatcher } from '@effects/backgroundManager.js';
import { setCanvas, restartGameLoop } from '@game/gameLoop.js';
import { startGame, continueGame } from '@game/gameStateManager.js';
import { gameState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { debug, warn } from '@core/logger.js';
import { showSettings, hideSettings } from '@ui/settings/settingsUI.js';
import { getById } from '@utils/dom.js';
import { showOverlay, setOverlayDimensions, quitGame } from '@ui/overlays/overlayManager.js';
import { services } from '@services/ServiceProvider.js';

let keydownHandlerRegistered = false;

/**
 * Wires up all overlay-related interactions and controls for the game.
 *
 * Initializes theme-aware background on all devices, binds event handlers for
 * start, restart, continue, quit, and settings buttons, and sets up
 * keyboard navigation for game state transitions.
 *
 * ## Background Initialization
 * - Uses theme-aware background manager to switch between starfield, ocean, etc.
 * - Sets up automatic background switching when theme changes
 * - Mobile optimization (particle reduction, effect skipping) handled by theme renderers
 *
 * @param canvas - The main game canvas element
 * @returns void
 *
 * @example
 * ```typescript
 * const canvas = getById<HTMLCanvasElement>('gameCanvas');
 * if (canvas) {
 *   wireOverlayControls(canvas);
 * }
 * ```
 */
export function wireOverlayControls(canvas: HTMLCanvasElement): void {
  const startButton = getById<HTMLButtonElement>('startButton');
  const restartButton = getById<HTMLButtonElement>('restartButton');
  const continueButton = getById<HTMLButtonElement>('continueButton');
  const continueButtonDeath = getById<HTMLButtonElement>('continueButtonDeath');
  const quitButton = getById<HTMLButtonElement>('quitButton');
  const quitButtonDeath = getById<HTMLButtonElement>('quitButtonDeath');
  const startOverlay = getById<HTMLElement>('startOverlay');
  const pauseOverlay = getById<HTMLElement>('pauseOverlay');
  const levelTransitionOverlay = getById<HTMLElement>('levelTransitionOverlay');
  const starfieldCanvas = getById<HTMLCanvasElement>('starfieldCanvas');
  const settingsButtonStart = getById<HTMLButtonElement>('settingsButtonStart');
  const settingsButtonLevel = getById<HTMLButtonElement>('settingsButtonLevel');
  const settingsButtonPause = getById<HTMLButtonElement>('settingsButtonPause');
  const settingsButtonGameOver = getById<HTMLButtonElement>('settingsButtonGameOver');
  const settingsButtonDeath = getById<HTMLButtonElement>('settingsButtonDeath');

  if (!startOverlay) {
    warn('ui', 'startOverlay not found in DOM.');
    return;
  }

  // Initialize theme-aware background (starfield, ocean, etc.)
  // Mobile optimization is handled by individual theme renderers
  if (starfieldCanvas) {
    initializeBackground(starfieldCanvas);
    setupBackgroundWatcher(starfieldCanvas);
  }

  setOverlayDimensions(canvas);
  setCanvas(canvas);

  const startEvent: 'touchstart' | 'click' = 'ontouchstart' in window ? 'touchstart' : 'click';

  const playClick = (): void => {
    if (typeof services.audioService.playSound === 'function') {
      services.audioService.playSound('ui_click');
    }
  };

  const startGameHandler = (event: Event): void => {
    event.preventDefault();
    if (gameState.value !== 'START') return;

    debug('game', 'Starting game from overlay');
    // startGame() -> showOverlay('PLAYING') handles music start
    startGame(canvas);
    restartGameLoop();
  };

  startButton?.addEventListener(startEvent, startGameHandler, { passive: false });
  startButton?.addEventListener('click', playClick);

  if (isMobile()) {
    pauseOverlay?.addEventListener(
      'touchstart',
      (event: TouchEvent) => {
        // Allow buttons and interactive elements to work normally
        const target = event.target;
        if (target instanceof HTMLElement) {
          const isInteractive =
            target.tagName === 'BUTTON' ||
            target.closest('button') ||
            target.tagName === 'INPUT' ||
            target.closest('input');
          if (isInteractive) {
            debug('game', 'Touch on interactive element - not resuming');
            return;
          }
        }

        event.preventDefault();
        if (gameState.value !== 'PAUSED') return;
        debug('game', 'Resuming game from overlay touch');
        gameState.value = 'PLAYING';
        showOverlay('PLAYING');
        // Don't force unmute - respect user's mute preference
        restartGameLoop();
      },
      { passive: false }
    );

    levelTransitionOverlay?.addEventListener(
      'touchstart',
      (event: TouchEvent) => {
        event.preventDefault();
        if (gameState.value !== 'LEVEL_TRANSITION') return;
        debug('game', 'Resuming from level transition overlay');
        continueGame();
        restartGameLoop();
      },
      { passive: false }
    );

    // Mobile quit button handler
    quitButton?.addEventListener('click', () => {
      playClick();
      quitGame();
    });
  } else {
    continueButton?.addEventListener('click', () => {
      playClick();
      continueGame();
      restartGameLoop();
    });

    quitButton?.addEventListener('click', () => {
      playClick();
      quitGame();
    });
  }

  restartButton?.addEventListener('click', () => {
    playClick();
    startGame(canvas);
    restartGameLoop();
  });

  // Death overlay button handlers
  continueButtonDeath?.addEventListener('click', () => {
    playClick();
    continueGame();
    restartGameLoop();
  });

  quitButtonDeath?.addEventListener('click', () => {
    playClick();
    quitGame();
  });

  const addSettingsHandler = (button: HTMLButtonElement | null): void => {
    button?.addEventListener('click', (event) => {
      event.preventDefault();
      playClick();
      showSettings();
    });
  };

  addSettingsHandler(settingsButtonStart);
  addSettingsHandler(settingsButtonLevel);
  addSettingsHandler(settingsButtonPause);
  addSettingsHandler(settingsButtonGameOver);
  addSettingsHandler(settingsButtonDeath);

  if (!keydownHandlerRegistered) {
    keydownHandlerRegistered = true;
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const isActivateKey = event.key === 'Enter' || event.key === ' ';
      if (event.key === 'Escape') {
        hideSettings();
        return;
      }

      if (!isActivateKey || gameState.value === 'PLAYING') return;

      if (gameState.value === 'START') {
        startGameHandler(event);
      } else if (gameState.value === 'DEATH') {
        event.preventDefault();
        continueGame();
        restartGameLoop();
      } else if (gameState.value === 'LEVEL_TRANSITION') {
        event.preventDefault();
        continueGame();
        restartGameLoop();
      } else if (gameState.value === 'GAME_OVER') {
        event.preventDefault();
        startGame(canvas);
        restartGameLoop();
      } else if (gameState.value === 'PAUSED') {
        event.preventDefault();
        gameState.value = 'PLAYING';
        showOverlay('PLAYING');
        // Don't force unmute - respect user's mute preference
        restartGameLoop();
      }
    });
  }

  showOverlay('START');
}
