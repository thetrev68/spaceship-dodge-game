/**
 * @fileoverview Game overlay management.
 */

import { playerLives, gameState, obstacles, powerUps, score, gameLevel } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import {
  initializeCanvas as initCanvas,
  setOverlayDimensions as setOverlayDims
} from '@utils/canvasUtils.js';
import { stopMusic, startMusic, playSound } from '@systems/soundManager.js';
import { clearAllBullets } from '@entities/bullet.js';
import { getPlatformText } from '@ui/settings/settingsManager.js';

const getStartOverlay = () => document.getElementById('startOverlay');
const getGameOverOverlay = () => document.getElementById('gameOverOverlay');
const getFinalScoreDisplay = () => document.getElementById('finalScore');
const getLevelTransitionOverlay = () => document.getElementById('levelTransitionOverlay');
const getPauseOverlay = () => document.getElementById('pauseOverlay');
const getLevelUpMessage = () => document.getElementById('levelUpMessage');
const getCurrentLevelInfo = () => document.getElementById('currentLevelInfo');
const getCurrentScoreInfo = () => document.getElementById('currentScoreInfo');

const getLivesInfoStart = () => document.getElementById('livesInfoStart');
const getLivesInfoLevel = () => document.getElementById('livesInfoLevel');
const getLivesInfoPause = () => document.getElementById('livesInfoPause');

const getPauseText = () => document.getElementById('pauseResumeMessage');
const getStartText = () => document.getElementById('startHint');
const getTapToContinueMobile = () => document.getElementById('tapToContinueMobile');
const getContinueButton = () => document.getElementById('continueButton');
const getStartButton = () => document.getElementById('startButton');
const getQuitButton = () => document.getElementById('quitButton');
const liveRegionStatus = document.getElementById('liveRegionStatus');
const liveRegionScore = document.getElementById('liveRegionScore');

const focusableSelector = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

let activeOverlay = null;
let lastFocusedElement = null;

/**
 * Sends an update to the live region for screen readers.
 * @param {string} message - The message to announce.
 */
function announce(message) {
  if (!liveRegionStatus) return;
  liveRegionStatus.textContent = message;
}

/**
 * Updates the score live region for screen readers.
 */
function announceScore() {
  if (!liveRegionScore) return;
  liveRegionScore.textContent = `Score ${score.value}, Level ${gameLevel.value + 1}, Lives ${playerLives.value}`;
}

/**
 * Restores focus to the canvas when overlays are hidden.
 */
function restoreFocus() {
  const canvas = document.getElementById('gameCanvas');
  const target = lastFocusedElement instanceof HTMLElement ? lastFocusedElement : canvas;
  target?.focus?.({ preventScroll: true });
}

/**
 * Traps focus within the active overlay.
 * @param {KeyboardEvent} e - Keydown event.
 */
function handleFocusTrap(e) {
  if (!activeOverlay || !activeOverlay.classList.contains('visible') || e.key !== 'Tab') return;

  const focusable = activeOverlay.querySelectorAll(focusableSelector);
  if (!focusable.length) {
    e.preventDefault();
    activeOverlay.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const isShift = e.shiftKey;
  const active = document.activeElement;

  if (isShift && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!isShift && active === last) {
    e.preventDefault();
    first.focus();
  }
}

document.addEventListener('keydown', handleFocusTrap);

score.watch(announceScore);
gameLevel.watch(announceScore);
playerLives.watch(announceScore);

/**
 * Hides all game overlays.
 */
function hideAllOverlays() {
  document.querySelectorAll('.game-overlay').forEach(ov => {
    ov.classList.remove('visible');
    ov.setAttribute('aria-hidden', 'true');
  });
}

/**
 * Shows a specific overlay.
 * @param {HTMLElement} overlay - The overlay element to show.
 */
function show(overlay) {
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('visible');
  const focusable = overlay.querySelector(focusableSelector);
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  requestAnimationFrame(() => {
    (focusable || overlay).focus({ preventScroll: true });
    activeOverlay = overlay;
  });
}

/**
 * Shows the appropriate overlay based on game state.
 * @param {string} state - Game state.
 * @param {number} [scoreValue=0] - Current score.
 * @param {number} [levelValue=0] - Current level.
 */
export function showOverlay(state, scoreValue = 0, levelValue = 0) {
  hideAllOverlays();

  const livesInfoStart = getLivesInfoStart();
  const livesInfoLevel = getLivesInfoLevel();
  const livesInfoPause = getLivesInfoPause();

  if (livesInfoStart) livesInfoStart.textContent = `Lives: ${playerLives.value}`;
  if (livesInfoLevel) livesInfoLevel.textContent = `Lives: ${playerLives.value}`;
  if (livesInfoPause) livesInfoPause.textContent = `Lives: ${playerLives.value}`;

  // Always show start button on both platforms
  const startButton = getStartButton();
  const continueButton = getContinueButton();
  const quitButton = getQuitButton();
  const tapToContinueMobile = getTapToContinueMobile();

  if (startButton) startButton.style.display = 'block';
  if (continueButton) continueButton.style.display = isMobile() ? 'none' : 'block';
  if (quitButton) quitButton.style.display = isMobile() ? 'none' : 'block';
  if (tapToContinueMobile) tapToContinueMobile.style.display = isMobile() ? 'block' : 'none';

  // Handle platform-specific control hints
  const desktopControlHint = document.getElementById('desktopControlHint');
  const mobileControlHint = document.getElementById('mobileControlHint');
  if (desktopControlHint) desktopControlHint.style.display = isMobile() ? 'none' : 'block';
  if (mobileControlHint) mobileControlHint.style.display = isMobile() ? 'block' : 'none';

  switch (state) {
    case 'START':
      const startText = getStartText();
      if (startText) {
        startText.textContent = getPlatformText('start');
      }
      announce('Game ready. Press Enter or the Start button to begin.');
      show(getStartOverlay());
      break;

    case 'GAME_OVER':
      stopMusic();
      const finalScoreDisplay = getFinalScoreDisplay();
      if (finalScoreDisplay) {
        finalScoreDisplay.textContent = `Final Score: ${scoreValue} (Level ${levelValue + 1})`;
      }
      announce(`Game over. Final score ${scoreValue}, level ${levelValue + 1}. Press Enter to play again or open settings.`);
      show(getGameOverOverlay());
      break;

    case 'LEVEL_TRANSITION':
      stopMusic();
      const levelUpMessage = getLevelUpMessage();
      const currentLevelInfo = getCurrentLevelInfo();
      const currentScoreInfo = getCurrentScoreInfo();

      if (levelUpMessage) levelUpMessage.textContent = `LEVEL ${levelValue + 1}`;
      if (currentLevelInfo) currentLevelInfo.textContent = 'Get Ready!';
      if (currentScoreInfo) currentScoreInfo.textContent = `Score: ${scoreValue}`;
      announce(`Level ${levelValue + 1} ready. Current score ${scoreValue}. Press Enter or Continue to resume.`);
      show(getLevelTransitionOverlay());
      break;

    case 'PAUSED':
      stopMusic();
      const pauseText = getPauseText();
      if (pauseText) {
        pauseText.textContent = getPlatformText('pause');
      }
      announce('Game paused. Press Enter to resume or open settings.');
      show(getPauseOverlay());
      break;

    case 'PLAYING':
      startMusic();
      activeOverlay = null;
      restoreFocus();
      break;
  }

  document.dispatchEvent(new Event('gameStateChange'));
}

/**
 * Initializes the game canvas.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 */
export function initializeCanvas(canvas) {
  initCanvas(canvas);
}

/**
 * Quits the game after confirmation.
 */
export function quitGame() {
  const confirmed = confirm('Are you sure you want to quit the game?');
  if (!confirmed) return;

  stopMusic();
  gameState.value = 'GAME_OVER';
  clearAllBullets();
  obstacles.length = 0;

  Object.keys(powerUps).forEach(key => {
    powerUps[key].active = false;
    powerUps[key].timer = 0;
  });

  playSound('gameover');
  showOverlay('GAME_OVER', score.value, gameLevel.value);
}

/**
 * Sets overlay dimensions to match canvas.
 * @param {HTMLCanvasElement} canvas - The game canvas.
 */
export function setOverlayDimensions(canvas) {
  setOverlayDims(canvas, [
    getStartOverlay(),
    getGameOverOverlay(),
    getLevelTransitionOverlay(),
    getPauseOverlay()
  ]);
}
