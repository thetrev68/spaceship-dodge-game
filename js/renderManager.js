// renderManager.js
/*
  Centralizes all draw calls for game entities and UI overlays.
  Keeps drawing code out of the main loop for clarity.
*/

import { drawPlayer } from './player.js';
import { drawObstacles } from './asteroid.js';
import { drawBullets } from './bullet.js';
import { drawPowerups } from './powerups.js';
import { drawScorePopups } from './scorePopups.js';
import { drawScore } from './scoreDisplay.js';
import { gameState } from './state.js';
import { drawPowerupTimers } from './powerupHUD.js';  

export function renderAll(ctx) {
  if (gameState.value !== 'PLAYING') return;

  drawPlayer(ctx);
  drawObstacles(ctx);
  drawBullets(ctx);
  drawPowerups(ctx);
  drawScore(ctx);
  drawScorePopups(ctx);
  drawPowerupTimers(ctx);
}