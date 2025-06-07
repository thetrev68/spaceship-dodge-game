// renderManager.js
/*
  Optimized: Centralizes all draw calls and applies shared ctx styles.
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

  ctx.save();

  // Set common default styles
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = 'white';
  ctx.font = '16px Inter'; // shared by scorePopups, score, etc.

  drawPlayer(ctx);
  drawObstacles(ctx);
  drawBullets(ctx);
  drawPowerups(ctx);
  drawScore(ctx);
  drawScorePopups(ctx);
  drawPowerupTimers(ctx);

  ctx.restore();
}