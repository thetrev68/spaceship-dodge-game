/**
 * @module themes/renderers/underwater/torpedoRenderer
 * Underwater theme bullet renderer - transforms laser bolts into torpedoes.
 *
 * ## Visual Design
 * - **Body**: Elongated elliptical capsule (radius × 2.5 length)
 * - **Nose cone**: Darker pointed tip for depth perception
 * - **Tail fins**: 4 small stabilizing fins at rear
 * - **Propeller**: Spinning cross at rear (rotates continuously)
 * - **Bubble trail**: 3 fading bubbles behind torpedo
 *
 * ## Entity Reuse
 * Uses Bullet entity data structure:
 * - `bullet.x, bullet.y` - Position
 * - `bullet.radius` - Scales torpedo dimensions
 * - **Zero code duplication** - same bullet logic, different visuals
 */

import { getCurrentTheme } from '@core/themes';
import type { Bullet } from '@types';

/**
 * Renders a bullet entity as an animated torpedo with propeller and bubble trail.
 *
 * ## Rendering Details
 * - **Body**: Vertical ellipse (radius wide, radius × 2.5 tall)
 * - **Nose**: Smaller ellipse with darker color (60% width, 80% of radius)
 * - **Fins**: 4 diagonal lines at rear for stabilization
 * - **Propeller**: Cross shape, rotates at 1 revolution per 100ms
 * - **Bubbles**: 3 circles with decreasing opacity (25% fade per bubble)
 *
 * ## Animation
 * - Propeller spins using `performance.now() / 50`
 * - Independent of game loop for smooth rotation
 *
 * ## Performance
 * - Draw calls: 7-9 (body + nose + fins + propeller + bubbles)
 * - Animation overhead: 1 `performance.now()` call
 *
 * @param ctx - Canvas 2D rendering context
 * @param bullet - Bullet entity data
 *
 * @example
 * ```typescript
 * // Used by renderManager.ts
 * bullets.forEach(b => {
 *   const renderer = theme.renderers?.bullet || drawBullet;
 *   renderer(ctx, b); // Renders torpedo or laser based on theme
 * });
 * ```
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
  const finPositions = [-radius, -radius * 0.5, radius * 0.5, radius];
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
