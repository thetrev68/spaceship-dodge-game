// gameStateManager.js
/*
  Manages game start, continue, end, and player hit logic,
  integrated with updated leveling system.
*/

import { gameState, playerLives, player, bullets, obstacles, score, gameLevel, powerUps } from './state.js';
import { resetLevelFlow } from './flowManager.js';
import { showOverlay } from './ui.js';
import * as soundManager from './soundManager.js';
import { unmuteAll } from './soundManager.js';
import { createAudioControls } from './audioControls.js';

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
  player.x = window.innerWidth / 2 - player.width / 2;
  player.y = window.innerHeight - player.height - 50;
  player.dx = 0;
  player.dy = 0;
  bullets.length = 0;
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
  bullets.length = 0;
  obstacles.length = 0;

  // Reset player position and movement
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - player.height - 50;
  player.dx = 0;
  player.dy = 0;

  resetLevelFlow();

  showOverlay('PLAYING');

  createAudioControls();

  unmuteAll();       // Unmute audio
  import('./soundManager.js').then(m => m.startMusic());

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

export function endGame() {
  gameState.value = 'GAME_OVER';
  soundManager.stopMusic();
  soundManager.playSound('gameover');
  showOverlay('GAME_OVER', score.value, gameLevel.value);
}

export { resetLevelFlow, showOverlay };