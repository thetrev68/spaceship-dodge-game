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

const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const levelUpMessage = document.getElementById('levelUpMessage');
const currentLevelInfo = document.getElementById('currentLevelInfo');
const currentScoreInfo = document.getElementById('currentScoreInfo');

const livesInfoStart = document.getElementById('livesInfoStart');
const livesInfoLevel = document.getElementById('livesInfoLevel');
const livesInfoPause = document.getElementById('livesInfoPause');

const pauseText = document.getElementById('pauseResumeMessage');
const startText = document.getElementById('startHint');
const tapToContinueMobile = document.getElementById('tapToContinueMobile');
const continueButton = document.getElementById('continueButton');
const startButton = document.getElementById('startButton');
const quitButton = document.getElementById('quitButton');

/**
 * Hides all game overlays.
 */
function hideAllOverlays() {
  document.querySelectorAll('.game-overlay').forEach(ov => {
    ov.classList.remove('visible');
  });
}

/**
 * Shows a specific overlay.
 * @param {HTMLElement} overlay - The overlay element to show.
 */
function show(overlay) {
  overlay.classList.add('visible');
}

/**
 * Shows the appropriate overlay based on game state.
 * @param {string} state - Game state.
 * @param {number} [score=0] - Current score.
 * @param {number} [level=0] - Current level.
 */
export function showOverlay(state, score = 0, level = 0) {
  hideAllOverlays();

  if (livesInfoStart) livesInfoStart.textContent = `Lives: ${playerLives.value}`;
  if (livesInfoLevel) livesInfoLevel.textContent = `Lives: ${playerLives.value}`;
  if (livesInfoPause) livesInfoPause.textContent = `Lives: ${playerLives.value}`;

  // Always show start button on both platforms
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
      if (startText) {
        startText.textContent = getPlatformText('start');
      }
      show(startOverlay);
      break;

    case 'GAME_OVER':
      stopMusic();
      finalScoreDisplay.textContent = `Final Score: ${score} (Level ${level + 1})`;
      show(gameOverOverlay);
      break;

    case 'LEVEL_TRANSITION':
      stopMusic();
      levelUpMessage.textContent = `LEVEL ${level + 1}`;
      currentLevelInfo.textContent = 'Get Ready!';
      currentScoreInfo.textContent = `Score: ${score}`;
      show(levelTransitionOverlay);
      break;

    case 'PAUSED':
      stopMusic();
      if (pauseText) {
        pauseText.textContent = getPlatformText('pause');
      }
      show(pauseOverlay);
      break;

    case 'PLAYING':
      startMusic();
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
  setOverlayDims(canvas, [startOverlay, gameOverOverlay, levelTransitionOverlay, pauseOverlay]);
}
