/**
 * Underwater theme renderer: Player → Submarine
 *
 * Renders player as a submarine with vector graphics.
 * Reuses player.x, player.y, player.width, player.height for positioning.
 */

import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';
import type { Player } from '@types';
import { PLAYER_CONSTANTS } from '@core/gameConstants';
import { playerState } from '@core/state/playerState';

/**
 * Renders player as a submarine with vector graphics.
 * Reuses player.x, player.y, player.width, player.height for positioning.
 */
export function drawSubmarine(ctx: CanvasRenderingContext2D, player: Player): void {
  const theme = getCurrentTheme();
  const x = player.x;
  const y = player.y;
  const w = player.width;
  const h = player.height;
  const cx = x + w / 2;

  ctx.strokeStyle = theme.colors.player;
  ctx.fillStyle = theme.colors.player;
  ctx.lineWidth = 2;

  // Main hull (elongated capsule)
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.5, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Conning tower (small vertical protrusion)
  ctx.strokeRect(cx - w * 0.1, y + h * 0.15, w * 0.2, h * 0.3);

  // Periscope
  ctx.beginPath();
  ctx.moveTo(cx, y + h * 0.15);
  ctx.lineTo(cx, y);
  ctx.stroke();

  // Porthole windows (3 circular windows)
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const windowX = cx - w * 0.2 + i * w * 0.2;
    ctx.beginPath();
    ctx.arc(windowX, y + h * 0.5, w * 0.06, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Propeller at rear (animated)
  const time = performance.now() / 200;
  const propellerAngle = time % (Math.PI * 2);
  const propX = cx;
  const propY = y + h * 0.9;

  ctx.save();
  ctx.translate(propX, propY);
  ctx.rotate(propellerAngle);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, 0);
  ctx.lineTo(w * 0.1, 0);
  ctx.moveTo(0, -w * 0.1);
  ctx.lineTo(0, w * 0.1);
  ctx.stroke();
  ctx.restore();

  // Bubble trail (thrust replacement)
  if (!isMobile()) {
    const bubbleCount = 5;
    const bubbleTime = performance.now() / 100;

    for (let i = 0; i < bubbleCount; i++) {
      const offset = (bubbleTime + i * 20) % 100;
      const bubbleY = propY + offset;
      const bubbleSize = 2 + Math.sin(bubbleTime + i) * 1;

      ctx.globalAlpha = 1 - offset / 100;
      ctx.beginPath();
      ctx.arc(propX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Shield effect (if active) - same as space theme
  if (playerState.powerUps.shield.active) {
    const radius = Math.max(w, h) * PLAYER_CONSTANTS.SHIELD_RADIUS_FACTOR;
    ctx.strokeStyle = theme.colors.playerShield;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, y + h / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
