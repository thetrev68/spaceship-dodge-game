/**
 * @module themes/renderers/underwater/jellyfishRenderer
 * Underwater theme obstacle renderer - transforms asteroids into jellyfish.
 *
 * ## Visual Design
 * The jellyfish design includes:
 * - **Bell**: Pulsating semi-circular dome (animated with sine wave)
 * - **Inner details**: 6 radial lines from center to edge
 * - **Tentacles**: 4-N flowing tentacles (count scales with size)
 * - **Wavy motion**: Quadratic curves create realistic undulation
 * - **Bioluminescence**: Cyan glow on bell edge (desktop only)
 *
 * ## Animation System
 * - **Pulse effect**: Bell radius varies ±10% using `Math.sin(obstacle.rotation)`
 * - **Tentacle waves**: Each segment uses rotation + offset for flowing motion
 * - **Size scaling**: Larger jellyfish get more tentacles (radius / 10)
 *
 * ## Entity Reuse
 * Reuses Asteroid entity data without modification:
 * - `obstacle.x, obstacle.y` - Position
 * - `obstacle.radius` - Scales bell and tentacle size
 * - `obstacle.rotation` - Drives animation phase (pulsing + waving)
 * - **Zero code duplication** - same physics, different visuals
 */

import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';
import type { Asteroid } from '@types';

/**
 * Renders an obstacle entity as an animated jellyfish with pulsating bell and flowing tentacles.
 *
 * ## Rendering Pipeline
 * 1. **Bell dome** - Translucent semi-circle with pulsating radius
 * 2. **Inner details** - 6 radial lines for texture
 * 3. **Tentacles** - Wavy curves with quadratic Bezier segments
 * 4. **Bioluminescence** - Glowing cyan outline (desktop only)
 *
 * ## Animation Details
 * - **Pulse cycle**: Bell grows/shrinks 10% based on rotation
 * - **Tentacle count**: `Math.max(4, Math.floor(radius / 10))` - scales with size
 * - **Wave motion**: Each tentacle segment uses `Math.sin(rotation + i + seg)` for phase offset
 * - **Smooth curves**: 4 quadratic segments per tentacle create natural flow
 *
 * ## Theme Integration
 * - `theme.colors.asteroid` - Jellyfish body and tentacles
 * - `theme.colors.starfield` - Bioluminescent glow color
 *
 * ## Performance Characteristics
 * - Draw calls: 8-25 (depends on jellyfish size and tentacle count)
 * - Mobile: Skips bioluminescent glow (saves 1 draw call per jellyfish)
 * - Complexity: O(n) where n = tentacle count (4-10 typically)
 *
 * @param ctx - Canvas 2D rendering context
 * @param obstacle - Asteroid entity data (reused as jellyfish)
 *
 * @example
 * ```typescript
 * // Used by renderManager.ts with strategy pattern
 * const obstacles = entityState.getObstacles();
 * obstacles.forEach(o => {
 *   const renderer = theme.renderers?.obstacle || drawAsteroid;
 *   renderer(ctx, o); // Renders jellyfish or asteroid based on theme
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Manual rendering (testing)
 * const jellyfish: Asteroid = {
 *   x: 100, y: 100,
 *   radius: 30,
 *   rotation: Math.PI / 4, // Animation phase
 *   // ... other Asteroid properties
 * };
 * drawJellyfish(ctx, jellyfish);
 * ```
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

  // Bioluminescent glow on bell edge (uses starfield color for consistency)
  if (!isMobile()) {
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = theme.colors.starfield; // Reuses plankton/particle color for glow
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, bellRadius, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
