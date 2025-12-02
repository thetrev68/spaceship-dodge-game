/**
 * @fileoverview Power-up HUD display.
 */

import { powerUps } from '@core/state.js';
import { HUD_CONSTANTS } from '@core/gameConstants.js';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function drawPowerupTimers(ctx: CanvasRenderingContext2D): void {
  const x = HUD_CONSTANTS.SCORE_X;
  const startY = HUD_CONSTANTS.POWERUP_START_Y;
  let y = startY;
  ctx.font = '18px monospace';
  ctx.fillStyle = '#00ffff';

  Object.entries(powerUps).forEach(([key, powerUp]) => {
    if (powerUp.active) {
      const secondsLeft = Math.ceil(powerUp.timer / 60);
      ctx.fillText(`${capitalize(key)}: ${secondsLeft}s`, x, y);
      y += HUD_CONSTANTS.POWERUP_LINE_HEIGHT;
    }
  });
}
