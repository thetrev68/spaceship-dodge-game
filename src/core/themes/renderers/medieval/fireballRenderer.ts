/**
 * Fireball Renderer - Medieval Fantasy Theme
 *
 * Phase 4: Bullet renderer (fireball with particle trail and smoke)
 * Implements glowing gradient core with flame particles and smoke wisps
 */
import { getCurrentTheme } from '@core/themes';
import type { Bullet } from '@types';

// Animation constants for fireball pulsing effect
const FIREBALL_PULSE_FREQUENCY = 4;
const FIREBALL_PULSE_AMPLITUDE = 0.1;

// Particle trail constants
const PARTICLE_COUNT = 5;
const TRAIL_SPACING_MULTIPLIER = 2;
const SIZE_DECAY_FACTOR = 0.15;
const OPACITY_DECAY_FACTOR = 0.18;

/**
 * Main entry - draws the medieval fireball bullet with gradient core and particle trail.
 *
 * @param ctx - Canvas 2D context
 * @param bullet - Bullet data containing position and radius
 */
export function drawFireball(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
  const theme = getCurrentTheme();
  const x = bullet.x;
  const y = bullet.y;
  const radius = bullet.radius;

  // Animation timing for pulsing
  const time = performance.now() / 1000;
  const pulse = Math.sin(time * FIREBALL_PULSE_FREQUENCY) * FIREBALL_PULSE_AMPLITUDE + 1; // 0.9 to 1.1

  // Draw particle trail first (behind core)
  drawParticleTrail(ctx, x, y, radius);

  // Draw glowing core
  drawFireballCore(ctx, x, y, radius * pulse, theme.colors.bullet);
}

/**
 * Draw the glowing gradient core of the fireball.
 *
 * @param ctx - Canvas 2D context
 * @param x - Center X
 * @param y - Center Y
 * @param radius - Core radius
 * @param color - Base bullet color
 */
function drawFireballCore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
): void {
  // Create radial gradient for glow effect
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, '#ffffff'); // Bright white center
  gradient.addColorStop(0.3, color); // Theme color
  gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)'); // Faded red edge

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Add outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = radius * 2;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // Reset shadow
}

/**
 * Draw the particle trail with flame and smoke effects.
 *
 * @param ctx - Canvas 2D context
 * @param x - Center X for the core
 * @param y - Center Y for the core
 * @param baseRadius - Radius used to scale trail particles
 */
function drawParticleTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseRadius: number
): void {
  const particleCount = PARTICLE_COUNT;
  const trailSpacing = baseRadius * TRAIL_SPACING_MULTIPLIER;

  for (let i = 0; i < particleCount; i++) {
    const particleY = y + (i + 1) * trailSpacing; // Trail below the core
    const size = baseRadius * (1 - i * SIZE_DECAY_FACTOR);
    const opacity = Math.max(0, 1 - i * OPACITY_DECAY_FACTOR);

    // Determine color based on position
    let color: string;
    if (i >= 3) {
      // Last 2 particles: smoke (gray)
      color = '#9ca3af';
    } else {
      // Flame particles: gradient from orange to yellow
      const t = i / 2; // 0 to 1 for first 3 particles
      color = interpolateColor('#fb923c', '#fbbf24', t);
    }

    // Draw particle
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, particleY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1; // Reset alpha
}

/**
 * Interpolate between two hex colors.
 *
 * @param color1 - Start color
 * @param color2 - End color
 * @param t - Interpolation factor 0-1
 */
function interpolateColor(color1: string, color2: string, t: number): string {
  // Parse hex colors
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  // Extract RGB components
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  // Convert back to hex
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
