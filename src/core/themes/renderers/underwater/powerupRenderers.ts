/**
 * @module themes/renderers/underwater/powerupRenderers
 * Underwater theme powerup renderers - transforms powerups into ocean creatures.
 *
 * ## Visual Design
 * - **Shield Powerup**: Octopus with 8 animated tentacles, eyes, and suction cups
 * - **Blaster Powerup**: Starfish with 5 arms, pulsing animation, and texture bumps
 *
 * ## Entity Reuse
 * Uses ActivePowerup entity data:
 * - `powerup.x, powerup.y` - Position
 * - `powerup.size` - Scales creature dimensions
 * - `powerup.type` - Determines octopus vs starfish
 * - **Zero code duplication** - same powerup logic, different visuals
 */

import { getCurrentTheme } from '@core/themes';
import type { ActivePowerup } from '@types';

/**
 * Renders shield powerup as an octopus with animated tentacles.
 *
 * ## Visual Components
 * - **Head**: Bulbous mantle (30% of size)
 * - **Eyes**: Two white circles with black pupils
 * - **Tentacles**: 8 wavy arms with quadratic curves
 * - **Suction cups**: 3 small circles per tentacle
 *
 * ## Animation
 * - Tentacles wave using `performance.now() / 500`
 * - Each tentacle has phase offset for natural motion
 *
 * ## Performance
 * - Draw calls: ~35 (head + eyes + 8 tentacles + 24 suction cups)
 * - Animation overhead: 1 `performance.now()` call
 *
 * @param ctx - Canvas 2D rendering context
 * @param powerup - ActivePowerup entity data
 *
 * @example
 * ```typescript
 * const shieldPowerup: ActivePowerup = {
 *   x: 100, y: 100,
 *   size: 40,
 *   type: 'shield',
 *   dy: 2
 * };
 * drawOctopusPowerup(ctx, shieldPowerup);
 * ```
 */
export function drawOctopusPowerup(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  ctx.save();

  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const size = powerup.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.strokeStyle = theme.colors.powerupShield;
  ctx.fillStyle = `${theme.colors.powerupShield}40`;
  ctx.lineWidth = 2;

  // Octopus head (bulbous mantle)
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes (two large circles)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - size * 0.15, cy - size * 0.05, size * 0.08, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.15, cy - size * 0.05, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx - size * 0.15, cy - size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.15, cy - size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 8 Tentacles (wavy arms radiating outward)
  ctx.strokeStyle = theme.colors.powerupShield;
  ctx.fillStyle = theme.colors.powerupShield; // Ensure suction cups use shield color, not pupil black
  ctx.lineWidth = 1.5;

  const time = performance.now() / 500;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const armLength = size * 0.4;

    ctx.beginPath();
    ctx.moveTo(cx, cy);

    // Wavy arm using quadratic curve
    const wave = Math.sin(time + i * 0.5) * size * 0.1;
    const endX = cx + Math.cos(angle) * armLength + Math.cos(angle + Math.PI / 2) * wave;
    const endY = cy + Math.sin(angle) * armLength + Math.sin(angle + Math.PI / 2) * wave;
    const cpX = cx + Math.cos(angle) * armLength * 0.5;
    const cpY = cy + Math.sin(angle) * armLength * 0.5;

    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();

    // Suction cups (small circles along arm)
    for (let j = 1; j <= 3; j++) {
      const t = j / 4;
      const suctionX = cx + Math.cos(angle) * armLength * t;
      const suctionY = cy + Math.sin(angle) * armLength * t;
      ctx.beginPath();
      ctx.arc(suctionX, suctionY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Renders double blaster powerup as a starfish with pulsing animation.
 *
 * ## Visual Components
 * - **Body**: 5-pointed star shape with pentagonal symmetry
 * - **Arms**: Outer radius pulses ±10% for breathing effect
 * - **Center**: Circular core (12% of size)
 * - **Texture**: 5 bumps on arms for detail
 *
 * ## Animation
 * - Pulsing effect using `Math.sin(performance.now() / 300)`
 * - Creates natural breathing motion
 *
 * ## Performance
 * - Draw calls: ~12 (star body + center + 5 texture bumps)
 * - Animation overhead: 1 `performance.now()` call
 *
 * @param ctx - Canvas 2D rendering context
 * @param powerup - ActivePowerup entity data
 *
 * @example
 * ```typescript
 * const blasterPowerup: ActivePowerup = {
 *   x: 200, y: 200,
 *   size: 40,
 *   type: 'doubleBlaster',
 *   dy: 2
 * };
 * drawStarfishPowerup(ctx, blasterPowerup);
 * ```
 */
export function drawStarfishPowerup(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  ctx.save();

  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const size = powerup.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.strokeStyle = theme.colors.powerupBlaster;
  ctx.fillStyle = `${theme.colors.powerupBlaster}40`;
  ctx.lineWidth = 2;

  // Starfish with 5 arms (pentagonal symmetry)
  const arms = 5;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.18;

  // Pulsing animation
  const pulse = Math.sin(performance.now() / 300) * 0.1 + 1;
  const animatedOuter = outerRadius * pulse;

  ctx.beginPath();

  for (let i = 0; i <= arms * 2; i++) {
    const angle = (i / arms / 2) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? animatedOuter : innerRadius;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Central body (circular core)
  ctx.fillStyle = theme.colors.powerupBlaster;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Texture bumps on each arm
  ctx.fillStyle = `${theme.colors.powerupBlaster}80`;
  for (let i = 0; i < arms; i++) {
    const angle = (i / arms) * Math.PI * 2 - Math.PI / 2;
    const bumpDist = size * 0.25;
    const bumpX = cx + Math.cos(angle) * bumpDist;
    const bumpY = cy + Math.sin(angle) * bumpDist;

    ctx.beginPath();
    ctx.arc(bumpX, bumpY, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
