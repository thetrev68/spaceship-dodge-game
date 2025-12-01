/**
 * @fileoverview Power-up HUD display.
 * Draw countdown timers for active powerups on the HUD.
 */

import { powerUps } from '@core/state.js';

/**
 * Draws countdown timers for active power-ups on the HUD.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
export function drawPowerupTimers(ctx) {
  const x = 20;
  const startY = 120; // increase from 40 to 80 or more to move down below score
  let y = startY;
  ctx.font = '18px monospace';
  ctx.fillStyle = '#00ffff';

  Object.entries(powerUps).forEach(([key, pu]) => {
    if (pu.active) {
      const secondsLeft = Math.ceil(pu.timer / 60);
      ctx.fillText(`${capitalize(key)}: ${secondsLeft}s`, x, y);
      y += 24;
    }
  });
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - String to capitalize.
 * @returns {string} Capitalized string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
