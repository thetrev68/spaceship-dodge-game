/**
 * @fileoverview Score and HUD display.
 * Created: 2025-05-28
 */

import { score, gameLevel, playerLives } from '@core/state.js';
import { HUD_CONSTANTS } from '@core/gameConstants.js';

/**
 * Draws the score, level, and lives on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
export function drawScore(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "Inter", sans-serif';
    ctx.textAlign = /** @type {CanvasTextAlign} */ (HUD_CONSTANTS.TEXT_ALIGN);
    ctx.fillText(`Score: ${score.value}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.SCORE_Y);
    ctx.fillText(`Level: ${gameLevel.value + 1}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.LEVEL_Y);
    ctx.fillText(`Lives: ${playerLives.value}`, HUD_CONSTANTS.SCORE_X, HUD_CONSTANTS.LIVES_Y);
}
