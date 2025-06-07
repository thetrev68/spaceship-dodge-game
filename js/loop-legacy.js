/*
    loop.js
   refactored. You can delete this file whenever.
*/

import { 
  player, gameState, score, gameLevel, playerLives,
  lastObstacleSpawnTime, bullets, obstacles,
  BASE_SPAWN_INTERVAL, SPAWN_INTERVAL_DECREASE_PER_LEVEL,
  isMobile,
  powerUps
} from './state.js';

import { updateBullets, drawBullets } from './bullet.js';
import { updateObstacles, drawObstacles, updateDifficulty as updateAsteroids } from './asteroid.js';
import { checkBulletObstacleCollisions, checkPlayerObstacleCollisions, destroyObstacle } from './collisions.js';
import { showOverlay } from './ui.js';
import { updatePlayer, drawPlayer } from './player.js';
import { createAudioControls } from './audioControls.js';
import { drawScore } from './scoreDisplay.js';
import { setupInput } from './controls.js';
import { addScorePopup, updateScorePopups, drawScorePopups } from './scorePopups.js';
import { canSpawnAsteroids, resetLevelFlow, updateLevelFlow } from './flowManager.js';
import * as soundManager from './soundManager.js';
import { spawnPowerup, updatePowerups, drawPowerups } from './powerups.js';

const TARGET_FPS = isMobile ? 30 : 60;
const FRAME_DURATION = 1000 / TARGET_FPS;

const MAX_BULLETS_MOBILE = 10;
const MAX_OBSTACLES_MOBILE = 15;

let lastFrameTime = 0;
let animationId;
let gameCanvas;

const MIN_SPAWN_INTERVAL = 300;

// Powerup spawn timer
let lastPowerupSpawnTime = 0;
const POWERUP_SPAWN_INTERVAL = 10000; // 10 seconds

export function setCanvas(canvas) {
  gameCanvas = canvas;
}

export function restartGameLoop() {
  if (gameCanvas) {
    animationId = requestAnimationFrame((t) => gameLoop(gameCanvas, t));
  }
}

function getSpawnInterval(level) {
  const interval = BASE_SPAWN_INTERVAL - level * SPAWN_INTERVAL_DECREASE_PER_LEVEL;
  return Math.max(interval, MIN_SPAWN_INTERVAL);
}

let obstacleSpawnInterval = getSpawnInterval(0);

export { addScorePopup };

export function gameLoop(canvas, timestamp = 0) {
  if (timestamp - lastFrameTime < FRAME_DURATION) {
    animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
    return;
  }
  lastFrameTime = timestamp;

  const ctx = canvas.getContext('2d');

  if (gameState.value === 'PAUSED') {
    animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
    return;
  }

  if (gameState.value !== 'PLAYING') {
    animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
    return;
  }

  obstacleSpawnInterval = getSpawnInterval(gameLevel.value);
  updateAsteroids(gameLevel.value);

  updateLevelFlow(() => {
    cancelAnimationFrame(animationId);
    showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
  });

  if (isMobile) {
    if (bullets.length > MAX_BULLETS_MOBILE) {
      bullets.splice(0, bullets.length - MAX_BULLETS_MOBILE);
    }
    if (obstacles.length > MAX_OBSTACLES_MOBILE) {
      obstacles.splice(0, obstacles.length - MAX_OBSTACLES_MOBILE);
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  updateObstacles(canvas.width, canvas.height, obstacleSpawnInterval, lastObstacleSpawnTime, canSpawnAsteroids());
  updateBullets(canvas.height);
  updateScorePopups();

  // Spawn powerup every POWERUP_SPAWN_INTERVAL ms
  if (!lastPowerupSpawnTime || timestamp - lastPowerupSpawnTime > POWERUP_SPAWN_INTERVAL) {
    spawnPowerup(canvas.width);
    lastPowerupSpawnTime = timestamp;
  }

  updatePowerups(canvas.height);

  drawPlayer(ctx);
  drawObstacles(ctx);
  drawBullets(ctx);
  drawScore(ctx);
  drawScorePopups(ctx);
  drawPowerups(ctx);

  // Player collision with obstacles & shield break logic
  if (checkPlayerObstacleCollisions()) {
    if (!powerUps.shield.active) {
      playerLives.value -= 1;
      import('./soundManager.js').then(m => m.playSound('gameover'));
      if (playerLives.value <= 0) {
        gameState.value = 'GAME_OVER';
        cancelAnimationFrame(animationId);
        soundManager.stopMusic();
        showOverlay('GAME_OVER', score.value, gameLevel.value);
        return;
      } else {
        gameState.value = 'LEVEL_TRANSITION';
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - player.height - 50;
        bullets.length = 0;
        obstacles.length = 0;
        resetLevelFlow();
        showOverlay('LEVEL_TRANSITION', score.value, gameLevel.value);
        return;
      }
    } else {
      powerUps.shield.active = false;
      powerUps.shield.timer = 0;

      // Destroy the colliding obstacle (break asteroid)
      for (const obstacle of obstacles) {
        const left = obstacle.x;
        const right = obstacle.x + obstacle.radius * 2;
        const top = obstacle.y;
        const bottom = obstacle.y + obstacle.radius * 2;

        if (
          player.x < right &&
          player.x + player.width > left &&
          player.y < bottom &&
          player.y + player.height > top
        ) {
          destroyObstacle(obstacle, score);
          break;
        }
      }
      // Optional: feedback effect here (sound/visual)
    }
  }

  checkBulletObstacleCollisions(score);

  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}

export function startGame(canvas) {
  setCanvas(canvas);
  if (isMobile) {
    // Mobile controls setup elsewhere
  } else {
    setupInput(canvas);
  }

  gameState.value = 'PLAYING';
  score.value = 0;
  gameLevel.value = 0;
  playerLives.value = 3;
  updateAsteroids(0);
  obstacleSpawnInterval = getSpawnInterval(0);
  bullets.length = 0;
  obstacles.length = 0;
  powerUps.shield.active = false;
  powerUps.shield.timer = 0;
  powerUps.doubleBlaster.active = false;
  powerUps.doubleBlaster.timer = 0;

  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - player.height - 50;
  player.dx = 0;
  player.dy = 0;
  lastObstacleSpawnTime.value = Date.now();
  resetLevelFlow();

  showOverlay('PLAYING');
  createAudioControls();
  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}

export function continueGame(canvas) {
  setCanvas(canvas);
  if (isMobile) {
    // Mobile controls setup elsewhere
  } else {
    setupInput(canvas);
  }

  gameState.value = 'PLAYING';
  updateAsteroids(gameLevel.value);
  obstacleSpawnInterval = getSpawnInterval(gameLevel.value);
  lastObstacleSpawnTime.value = Date.now();
  resetLevelFlow();
  showOverlay('PLAYING');
  import('./soundManager.js').then(m => m.startMusic());
  animationId = requestAnimationFrame((t) => gameLoop(canvas, t));
}

export function endGame() {
  gameState.value = 'GAME_OVER';
  cancelAnimationFrame(animationId);
  soundManager.stopMusic();
  soundManager.playSound('gameover');
  showOverlay('GAME_OVER', score.value, gameLevel.value);
}