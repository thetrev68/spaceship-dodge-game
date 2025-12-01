// powerupHUD.js
/*
  Draw countdown timers for active powerups on the HUD.
*/

import { powerUps } from '@core/state.js';

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

// Helper to capitalize powerup names nicely
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
