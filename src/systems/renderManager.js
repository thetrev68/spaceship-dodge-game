// renderManager.js
/*
  Optimized: Centralizes all draw calls and applies shared ctx styles.
*/

import { drawPlayer } from '@entities/player';
import { drawObstacles } from '@entities/asteroid';
import { drawBullets } from '@entities/bullet';
import { drawPowerups } from '@entities/powerup';
import { drawScorePopups } from '../scorePopups.js';
import { drawScore } from '../scoreDisplay.js';
import { gameState } from '@core/state';
import { drawPowerupTimers } from '../powerupHUD.js';

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