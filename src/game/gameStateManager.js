// gameStateManager.js
/*
  Manages game start, continue, end, and player hit logic,
  integrated with updated leveling system.
*/

import { gameState, playerLives, obstacles, score, gameLevel, powerUps } from '@core/state.js';
import { resetLevelFlow } from '@game/flowManager.js';
import { showOverlay } from '@ui/overlays/overlayManager.js';
import * as soundManager from '@systems/soundManager.js';
import { unmuteAll } from '@systems/soundManager.js';
import { createAudioControls } from '@ui/controls/audioControls.js';
import { resetPlayer } from '@entities/player.js';
import { clearAllBullets } from '@entities/bullet.js';

export function handlePlayerHit() {
  playerLives.value -= 1;
  soundManager.playSound('gameover');

  if (playerLives.value <= 0) {
    gameState.value = 'GAME_OVER';
    soundManager.stopMusic();
    showOverlay('GAME_OVER', score.value, gameLevel.value);
  } else {
    gameState.value = 'LEVEL_TRANSITION';
    resetForNextLevel();
    showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
  }
}

function resetForNextLevel() {
  resetPlayer(window.innerWidth, window.innerHeight);
  clearAllBullets();
  obstacles.length = 0;
  resetLevelFlow();
  soundManager.stopMusic();
}

export function startGame(canvas) {
  gameState.value = 'PLAYING';
  score.value = 0;
  gameLevel.value = 0;
  playerLives.value = 3;

  // Reset powerups
  powerUps.shield.active = false;
  powerUps.shield.timer = 0;
  powerUps.doubleBlaster.active = false;
  powerUps.doubleBlaster.timer = 0;

  // Clear arrays
  clearAllBullets();
  obstacles.length = 0;

  // Reset player position and movement
  resetPlayer(canvas.width, canvas.height);

  resetLevelFlow();

  showOverlay('PLAYING');

  createAudioControls();

  unmuteAll();       // Unmute audio
  soundManager.startMusic();

  // Clear the canvas explicitly
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function continueGame() {
  gameState.value = 'PLAYING';
  resetLevelFlow();
  showOverlay('PLAYING');
  soundManager.startMusic();
}

// Removed unused endGame function
// Removed re-exports - import directly where needed