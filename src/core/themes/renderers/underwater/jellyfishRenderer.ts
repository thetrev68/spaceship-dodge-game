/**
 * Underwater theme renderer: Obstacles → Jellyfish
 *
 * Renders obstacles as jellyfish with pulsating bells and flowing tentacles.
 * Uses obstacle.radius for size scaling, obstacle.rotation for animation phase.
 */

import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';
import type { Asteroid } from '@types';

/**
 * Renders obstacles as jellyfish with pulsating bells and flowing tentacles.
 * Uses obstacle.radius for size scaling, obstacle.rotation for animation phase.
 */
export function drawJellyfish(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const theme = getCurrentTheme();
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;

  // Pulsating animation (reuses rotation as phase)
  const pulse = Math.sin(obstacle.rotation) * 0.1 + 1;
  const bellRadius = radius * pulse;

  ctx.strokeStyle = theme.colors.asteroid;
  ctx.fillStyle = `${theme.colors.asteroid}20`; // Translucent fill
  ctx.lineWidth = 2;

  // Bell shape (semi-circle dome)
  ctx.beginPath();
  ctx.arc(cx, cy, bellRadius, Math.PI, Math.PI * 2); // Top half
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner bell details (radial lines)
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  const innerLines = 6;
  for (let i = 0; i < innerLines; i++) {
    const angle = Math.PI + (i / innerLines) * Math.PI;
    const startX = cx + Math.cos(angle) * bellRadius * 0.3;
    const startY = cy + Math.sin(angle) * bellRadius * 0.3;
    const endX = cx + Math.cos(angle) * bellRadius;
    const endY = cy + Math.sin(angle) * bellRadius;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Tentacles (trailing behind movement direction)
  const tentacleCount = Math.max(4, Math.floor(radius / 10)); // More tentacles = bigger jellyfish
  const tentacleLength = radius * 1.5;

  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  for (let i = 0; i < tentacleCount; i++) {
    const tentacleAngle = (i / tentacleCount) * Math.PI - Math.PI / 2;
    const baseX = cx + Math.cos(Math.PI + tentacleAngle) * bellRadius * 0.8;
    const baseY = cy;

    // Wavy tentacle using quadratic curves
    const segments = 4;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);

    for (let seg = 1; seg <= segments; seg++) {
      const t = seg / segments;
      const waveOffset = Math.sin(obstacle.rotation + i + seg) * radius * 0.2;
      const segX = baseX + waveOffset;
      const segY = baseY + tentacleLength * t;

      if (seg === 1) {
        ctx.lineTo(segX, segY);
      } else {
        const prevT = (seg - 1) / segments;
        const prevWaveOffset = Math.sin(obstacle.rotation + i + seg - 1) * radius * 0.2;
        const cpX = baseX + (waveOffset + prevWaveOffset) / 2;
        const cpY = baseY + (tentacleLength * (t + prevT)) / 2;

        ctx.quadraticCurveTo(cpX, cpY, segX, segY);
      }
    }

    ctx.stroke();
  }

  // Bioluminescent glow on bell edge
  if (!isMobile()) {
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, bellRadius, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
