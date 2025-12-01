// renderManager.js
/*
  Optimized: Centralizes all draw calls and applies shared ctx styles.
*/

import { drawPlayer } from '@entities/player.js';
import { drawObstacles } from '@entities/asteroid.js';
import { drawBullets } from '@entities/bullet.js';
import { drawPowerups } from '@entities/powerup.js';
import { drawScorePopups } from '@ui/hud/scorePopups.js';
import { drawScore } from '@ui/hud/scoreDisplay.js';
import { gameState } from '@core/state.js';
import { drawPowerupTimers } from '@ui/hud/powerupHUD.js';

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