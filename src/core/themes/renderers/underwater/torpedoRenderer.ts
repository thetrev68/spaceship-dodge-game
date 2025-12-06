/**
 * Underwater theme renderer: Bullets → Torpedoes
 *
 * Renders bullets as torpedoes with propeller and trail.
 */

import { getCurrentTheme } from '@core/themes';
import type { Bullet } from '@types';

/**
 * Renders bullets as torpedoes with propeller and trail.
 */
export function drawTorpedo(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
  const theme = getCurrentTheme();
  const x = bullet.x;
  const y = bullet.y;
  const radius = bullet.radius;

  ctx.fillStyle = theme.colors.bullet;
  ctx.strokeStyle = theme.colors.bullet;
  ctx.lineWidth = 2;

  // Torpedo body (elongated capsule)
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 2.5, Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();

  // Nose cone (darker tip)
  ctx.fillStyle = `${theme.colors.bullet}CC`;
  ctx.beginPath();
  ctx.ellipse(x, y - radius * 2, radius * 0.6, radius * 0.8, Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();

  // Tail fins (4 small fins)
  ctx.strokeStyle = theme.colors.bullet;
  const finPositions = [-radius * 0.5, radius * 0.5];
  finPositions.forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(x + offset, y + radius * 2);
    ctx.lineTo(x + offset * 1.5, y + radius * 2.8);
    ctx.stroke();
  });

  // Propeller (spinning at rear)
  const propTime = performance.now() / 50;
  const propAngle = propTime % (Math.PI * 2);

  ctx.save();
  ctx.translate(x, y + radius * 2.5);
  ctx.rotate(propAngle);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.4, 0);
  ctx.lineTo(radius * 0.4, 0);
  ctx.stroke();
  ctx.restore();

  // Bubble trail (small bubbles behind torpedo)
  for (let i = 1; i <= 3; i++) {
    const bubbleY = y + radius * 2.5 + i * 5;
    const bubbleSize = radius * 0.2;
    ctx.globalAlpha = 1 - i * 0.25;
    ctx.beginPath();
    ctx.arc(x, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
