/*
    loop.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Added smooth obstacle speed scaling with cap.
        Added pause-friendly game loop control.
*/

import { 
  player, gameState, score, gameLevel,
  lastObstacleSpawnTime, bullets, obstacles,
  BASE_SPAWN_INTERVAL, SPAWN_INTERVAL_DECREASE_PER_LEVEL
} from './state.js';

import { updateBullets, drawBullets } from './bullet.js';
import { updateObstacles, drawObstacles, updateDifficulty as updateAsteroids } from './asteroid.js';
import { checkBulletObstacleCollisions, checkPlayerObstacleCollisions } from './collisions.js';
import { showOverlay } from './ui.js';
import { updatePlayer, drawPlayer } from './player.js';
import { createAudioControls } from './audioControls.js';
import { drawScore } from './scoreDisplay.js';
import { setupInput } from './controls.js';
import { addScorePopup, updateScorePopups, drawScorePopups } from './scorePopups.js';
import { canSpawnAsteroids, resetLevelFlow, updateLevelFlow } from './flowManager.js';

let animationId;
let gameCanvas;

const MIN_SPAWN_INTERVAL = 300;
const MAX_OBSTACLE_SPEED = 3;

export function setCanvas(canvas) {
  gameCanvas = canvas;
}

export function restartGameLoop() {
  if (gameCanvas) {
    animationId = requestAnimationFrame(() => gameLoop(gameCanvas));
  }
}

function getSpawnInterval(level) {
  const interval = BASE_SPAWN_INTERVAL - level * SPAWN_INTERVAL_DECREASE_PER_LEVEL;
  return Math.max(interval, MIN_SPAWN_INTERVAL);
}

let obstacleSpawnInterval = getSpawnInterval(0);

export { addScorePopup };

export function gameLoop(canvas) {
  const ctx = canvas.getContext('2d');

  if (gameState.value === 'PAUSED') {
    animationId = requestAnimationFrame(() => gameLoop(canvas));
    return;
  }

  if (gameState.value !== 'PLAYING') {
    animationId = requestAnimationFrame(() => gameLoop(canvas));
    return;
  }

  obstacleSpawnInterval = getSpawnInterval(gameLevel.value);
  updateAsteroids(gameLevel.value);

  updateLevelFlow(() => {
    cancelAnimationFrame(animationId);
    showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, canSpawnAsteroids());
  updateBullets(canvas.height);
  updateScorePopups();

  drawPlayer(ctx);
  drawObstacles(ctx);
  drawBullets(ctx);
  drawScore(ctx);
  drawScorePopups(ctx);

  checkPlayerObstacleCollisions();
  checkBulletObstacleCollisions(score);

  animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function startGame(canvas) {
  setCanvas(canvas);
  setupInput(canvas);
  gameState.value = 'PLAYING';
  score.value = 0;
  gameLevel.value = 0;
  updateAsteroids(0);
  obstacleSpawnInterval = getSpawnInterval(0);
  bullets.length = 0;
  obstacles.length = 0;
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - player.height - 50;
  player.dx = 0;
  player.dy = 0;
  lastObstacleSpawnTime.value = Date.now();
  resetLevelFlow();

  showOverlay('PLAYING');
  createAudioControls();
  animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function continueGame(canvas) {
  setCanvas(canvas);
  setupInput(canvas);
  gameState.value = 'PLAYING';
  updateAsteroids(gameLevel.value);
  obstacleSpawnInterval = getSpawnInterval(gameLevel.value);
  lastObstacleSpawnTime.value = Date.now();
  resetLevelFlow();
  showOverlay('PLAYING');
  animationId = requestAnimationFrame(() => gameLoop(canvas));
}

export function endGame() {
  gameState.value = 'GAME_OVER';
  cancelAnimationFrame(animationId);
  import('./soundManager.js').then(m => {
    m.stopMusic();          // Stop BGM first
    m.playSound('gameover'); // Then play gameover sound
  });
  showOverlay('GAME_OVER', score.value, gameLevel.value);
}