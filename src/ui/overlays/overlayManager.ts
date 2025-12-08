/**
 * @module ui/overlays/overlayManager
 * Game overlay management with accessibility helpers.
 */

import type { OverlayState, PowerUpKey } from '@types';
import { playerLives, gameState, obstacles, powerUps, score, gameLevel } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { setOverlayDimensions as setOverlayDims } from '@utils/canvasUtils.js';
import { clearAllBullets } from '@entities/bullet.js';
import { getPlatformText } from '@ui/settings/settingsManager.js';
import { getById, isHTMLElement } from '@utils/dom.js';
import { services } from '@services/ServiceProvider.js';
import { formatNumber } from '@utils/formatNumber.js';

const focusableSelector = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let activeOverlay: HTMLElement | null = null;
let lastFocusedElement: HTMLElement | null = null;

const liveRegionStatus = getById<HTMLElement>('liveRegionStatus');
const liveRegionScore = getById<HTMLElement>('liveRegionScore');

function announce(message: string): void {
  if (!liveRegionStatus) return;
  liveRegionStatus.textContent = message;
}

function announceScore(): void {
  if (!liveRegionScore) return;
  liveRegionScore.textContent = `Score ${score.value}, Level ${gameLevel.value + 1}, Lives ${playerLives.value}`;
}

function restoreFocus(): void {
  const canvas = getById<HTMLCanvasElement>('gameCanvas');
  const target = lastFocusedElement ?? canvas;
  target?.focus({ preventScroll: true });
}

const handleFocusTrap = (e: KeyboardEvent): void => {
  if (!activeOverlay || !activeOverlay.classList.contains('visible') || e.key !== 'Tab') return;

  const focusable = Array.from(activeOverlay.querySelectorAll<HTMLElement>(focusableSelector));
  if (!focusable.length) {
    e.preventDefault();
    activeOverlay.focus({ preventScroll: true });
    return;
  }

  const first = focusable.at(0);
  const last = focusable.at(-1);
  if (!first || !last) return;
  const active = document.activeElement;
  const isShift = e.shiftKey;

  if (isShift && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!isShift && active === last) {
    e.preventDefault();
    first.focus();
  }
};

document.addEventListener('keydown', handleFocusTrap);

score.watch(announceScore);
gameLevel.watch(announceScore);
playerLives.watch(announceScore);

function hideAllOverlays(): void {
  const activeElement = document.activeElement;
  document.querySelectorAll<HTMLElement>('.game-overlay').forEach((overlay) => {
    if (activeElement instanceof HTMLElement && overlay.contains(activeElement)) {
      activeElement.blur();
    }
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('inert', '');
  });
}

function show(overlay: HTMLElement | null): void {
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.removeAttribute('inert');
  overlay.classList.add('visible');
  const focusable = overlay.querySelector<HTMLElement>(focusableSelector);
  lastFocusedElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  requestAnimationFrame(() => {
    const focusTarget = focusable ?? overlay;
    focusTarget.focus({ preventScroll: true });
    activeOverlay = overlay;
  });
}

export function showOverlay(state: OverlayState, scoreValue = 0, levelValue = 0): void {
  hideAllOverlays();

  const livesInfoStart = getById<HTMLElement>('livesInfoStart');
  const livesInfoLevel = getById<HTMLElement>('livesInfoLevel');
  const livesInfoPause = getById<HTMLElement>('livesInfoPause');

  const livesText = `Lives: ${playerLives.value}`;
  if (livesInfoStart) livesInfoStart.textContent = livesText;
  if (livesInfoLevel) livesInfoLevel.textContent = livesText;
  if (livesInfoPause) livesInfoPause.textContent = livesText;

  const startButton = getById<HTMLButtonElement>('startButton');
  const continueButton = getById<HTMLButtonElement>('continueButton');
  const quitButton = getById<HTMLButtonElement>('quitButton');
  const tapToContinueMobile = getById<HTMLElement>('tapToContinueMobile');

  const mobile = isMobile();
  if (startButton) startButton.style.display = 'block';
  if (continueButton) continueButton.style.display = mobile ? 'none' : 'block';
  if (quitButton) quitButton.style.display = mobile ? 'none' : 'block';
  if (tapToContinueMobile) tapToContinueMobile.style.display = mobile ? 'block' : 'none';

  const desktopControlHint = getById<HTMLElement>('desktopControlHint');
  const mobileControlHint = getById<HTMLElement>('mobileControlHint');
  if (desktopControlHint) desktopControlHint.style.display = mobile ? 'none' : 'block';
  if (mobileControlHint) mobileControlHint.style.display = mobile ? 'block' : 'none';

  switch (state) {
    case 'START': {
      const startText = getById<HTMLElement>('startHint');
      if (startText) {
        startText.textContent = getPlatformText('start');
      }
      announce('Game ready. Press Enter or the Start button to begin.');
      show(getById<HTMLElement>('startOverlay'));
      break;
    }

    case 'GAME_OVER': {
      services.audioService.stopMusic();
      const finalScoreDisplay = getById<HTMLElement>('finalScore');
      if (finalScoreDisplay) {
        finalScoreDisplay.textContent = `Final Score: ${formatNumber(scoreValue)} (Level ${levelValue + 1})`;
      }
      announce(
        `Game over. Final score ${formatNumber(scoreValue)}, level ${levelValue + 1}. Press Enter to play again or open settings.`
      );
      show(getById<HTMLElement>('gameOverOverlay'));
      break;
    }

    case 'DEATH': {
      services.audioService.stopMusic();
      const deathInfo = getById<HTMLElement>('deathInfo');
      const livesInfoDeath = getById<HTMLElement>('livesInfoDeath');

      if (deathInfo) deathInfo.textContent = `You died! But you still have lives remaining.`;
      if (livesInfoDeath) livesInfoDeath.textContent = `Lives: ${playerLives.value}`;
      announce(
        `You died! ${playerLives.value} ${playerLives.value === 1 ? 'life' : 'lives'} remaining. Press Continue to resume or Quit to return to main menu.`
      );
      show(getById<HTMLElement>('deathOverlay'));
      break;
    }

    case 'LEVEL_TRANSITION': {
      services.audioService.stopMusic();
      const levelUpMessage = getById<HTMLElement>('levelUpMessage');
      const currentLevelInfo = getById<HTMLElement>('currentLevelInfo');
      const currentScoreInfo = getById<HTMLElement>('currentScoreInfo');

      if (levelUpMessage) levelUpMessage.textContent = `LEVEL ${levelValue + 1}`;
      if (currentLevelInfo) currentLevelInfo.textContent = 'Get Ready!';
      if (currentScoreInfo) currentScoreInfo.textContent = `Score: ${formatNumber(scoreValue)}`;
      announce(
        `Level ${levelValue + 1} ready. Current score ${formatNumber(scoreValue)}. Press Enter or Continue to resume.`
      );
      show(getById<HTMLElement>('levelTransitionOverlay'));
      break;
    }

    case 'PAUSED': {
      services.audioService.stopMusic();
      const pauseText = getById<HTMLElement>('pauseResumeMessage');
      if (pauseText) {
        pauseText.textContent = getPlatformText('pause');
      }
      announce('Game paused. Press Enter to resume or open settings.');
      show(getById<HTMLElement>('pauseOverlay'));
      break;
    }

    case 'PLAYING': {
      services.audioService.startMusic();
      activeOverlay = null;
      restoreFocus();
      break;
    }
  }

  document.dispatchEvent(new Event('gameStateChange'));
}

export function quitGame(): void {
  const confirmed = confirm('Are you sure you want to quit the game?');
  if (!confirmed) return;

  gameState.value = 'GAME_OVER';
  clearAllBullets();
  obstacles.length = 0;

  (Object.keys(powerUps) as PowerUpKey[]).forEach((key) => {
    powerUps[key].active = false;
    powerUps[key].timer = 0;
  });

  services.audioService.playSound('gameover');
  showOverlay('GAME_OVER', score.value, gameLevel.value);
}

export function setOverlayDimensions(canvas: HTMLCanvasElement): void {
  const overlays = [
    getById<HTMLElement>('startOverlay'),
    getById<HTMLElement>('gameOverOverlay'),
    getById<HTMLElement>('levelTransitionOverlay'),
    getById<HTMLElement>('pauseOverlay'),
    getById<HTMLElement>('fatalErrorOverlay'),
    getById<HTMLElement>('deathOverlay'),
  ].filter(isHTMLElement);

  setOverlayDims(canvas, overlays);
}

/**
 * Shows fatal error overlay with message and error code.
 * Used for non-recoverable errors that require page reload.
 *
 * @param message - User-friendly error message
 * @param code - Error code for debugging (e.g., "CANVAS_ERROR")
 *
 * @example
 * ```typescript
 * showFatalErrorOverlay(
 *   'Canvas element not found. Please ensure your browser supports HTML5.',
 *   'CANVAS_ERROR'
 * );
 * ```
 */
export function showFatalErrorOverlay(message: string, code: string): void {
  hideAllOverlays();

  const errorMessageEl = getById<HTMLElement>('fatalErrorMessage');
  const errorCodeEl = getById<HTMLElement>('fatalErrorCode');
  const reloadButton = getById<HTMLButtonElement>('reloadButton');

  if (errorMessageEl) {
    errorMessageEl.textContent = message;
  }

  if (errorCodeEl) {
    errorCodeEl.textContent = `Error Code: ${code}`;
  }

  if (reloadButton) {
    reloadButton.onclick = () => {
      window.location.reload();
    };
  }

  announce(`Fatal error: ${message}. Error code ${code}. Please reload the page.`);
  show(getById<HTMLElement>('fatalErrorOverlay'));
}
