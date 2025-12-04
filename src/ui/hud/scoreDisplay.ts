/**
 * @module ui/hud/scoreDisplay
 * Score and HUD display.
 */

import { score, gameLevel, playerLives } from '@core/state.js';
import { HUD_CONSTANTS } from '@core/gameConstants.js';

export function drawScore(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px "Inter", sans-serif';
  ctx.textAlign = HUD_CONSTANTS.TEXT_ALIGN;
  ctx.fillText(`Score: ${score.value}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.SCORE_Y);
  ctx.fillText(`Level: ${gameLevel.value + 1}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.LEVEL_Y);
  ctx.fillText(`Lives: ${playerLives.value}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.LIVES_Y);
}
