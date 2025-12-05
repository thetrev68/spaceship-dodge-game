/**
 * @module ui/hud/scoreDisplay
 * Score and HUD display.
 */

import { score, gameLevel, playerLives } from '@core/state.js';
import { HUD_CONSTANTS } from '@core/gameConstants.js';
import { getCurrentTheme } from '@core/themes';
import { formatNumber } from '@utils/formatNumber.js';

export function drawScore(ctx: CanvasRenderingContext2D): void {
  const theme = getCurrentTheme();
  ctx.fillStyle = theme.colors.hudText;
  ctx.font = `${theme.fonts.hudSize} ${theme.fonts.family}`;
  ctx.textAlign = HUD_CONSTANTS.TEXT_ALIGN;
  ctx.fillText(`Score: ${formatNumber(score.value)}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.SCORE_Y);
  ctx.fillText(`Level: ${gameLevel.value + 1}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.LEVEL_Y);
  ctx.fillText(`Lives: ${playerLives.value}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.LIVES_Y);
}
