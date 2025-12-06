/**
 * @module themes/renderers/underwater/oceanBackground
 * Underwater theme background - ocean gradient with animated plankton particles.
 *
 * ## Visual Design
 * - **Ocean gradient**: 3-stop linear gradient simulating depth
 *   - Top: Lighter blue-green (#1a4d6d) - sunlight zone
 *   - Middle: Transition zone (#0d2b3d)
 *   - Bottom: Deep dark blue (#051320)
 * - **Sunbeam effect**: Radial gradient from top-left (desktop only)
 * - **Plankton**: Glowing particles with horizontal drift
 *
 * ## Animation System
 * - **Particle movement**: Vertical descent + horizontal drift
 * - **Wrap-around**: Particles reset to top when reaching bottom
 * - **Glow effect**: Outer halo + bright core
 *
 * ## Performance
 * - Desktop: 120 particles with glow
 * - Mobile: 50 particles, no glow or sunbeam
 * - Independent RAF loop (no game loop coupling)
 */

import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';
import { OCEAN_CONSTANTS } from '@core/gameConstants';

/**
 * Initializes ocean background with animated plankton particles.
 *
 * ## Rendering Pipeline
 * 1. **Deep ocean gradient** - 3-stop linear gradient
 * 2. **Sunbeam** - Radial gradient from top-left (desktop only)
 * 3. **Plankton particles** - Animated glowing dots
 *
 * ## Particle System
 * - **Count**: 120 desktop, 50 mobile
 * - **Speed**: 0.1-0.4 px/frame (vertical)
 * - **Drift**: ±0.1 px/frame (horizontal current effect)
 * - **Size**: 1-4px radius
 * - **Opacity**: 0.3-0.8 (randomized)
 *
 * ## Animation Loop
 * - Runs in separate `requestAnimationFrame` loop
 * - Redraws gradient and particles every frame
 * - Particles update position and wrap at boundaries
 *
 * ## Canvas Management
 * - Handles window resize events
 * - Canvas dimensions update automatically
 * - Particles redistribute on resize
 *
 * @param canvas - Canvas element for background rendering
 *
 * @example
 * ```typescript
 * // Used by backgroundManager.ts
 * const starfieldCanvas = document.getElementById('starfieldCanvas') as HTMLCanvasElement;
 * if (theme.id === 'underwater') {
 *   setupOceanBackground(starfieldCanvas);
 * }
 * ```
 */
export function setupOceanBackground(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = getCurrentTheme();
  const mobile = isMobile();
  const planktonCount = mobile
    ? OCEAN_CONSTANTS.PLANKTON_COUNT_MOBILE
    : OCEAN_CONSTANTS.PLANKTON_COUNT_DESKTOP;

  type Plankton = {
    x: number;
    y: number;
    size: number;
    speed: number;
    drift: number; // Horizontal drift for current effect
    opacity: number;
  };

  const plankton: Plankton[] = [];

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Initialize plankton particles
  for (let i = 0; i < planktonCount; i++) {
    plankton.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.3 + 0.1,
      drift: (Math.random() - 0.5) * 0.2, // Horizontal drift
      opacity: Math.random() * 0.5 + 0.3,
    });
  }

  function animate(): void {
    if (!ctx) return;

    // Deep ocean gradient (darker blue at bottom, lighter at top with sun)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a4d6d'); // Lighter blue-green at top (sunlight zone)
    gradient.addColorStop(0.3, '#0d2b3d'); // Transition zone
    gradient.addColorStop(1, '#051320'); // Deep dark blue at bottom

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sunbeam effect from top-left
    if (!mobile) {
      const sunGradient = ctx.createRadialGradient(
        canvas.width * 0.2, // Sun position (top-left)
        0,
        0,
        canvas.width * 0.2,
        0,
        canvas.width * 0.8
      );
      sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.15)');
      sunGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.05)');
      sunGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw plankton (glowing particles)
    ctx.fillStyle = theme.colors.starfield; // Reuse starfield color

    plankton.forEach((particle) => {
      // Update position
      particle.y += particle.speed;
      particle.x += particle.drift;

      // Wrap around
      if (particle.y > canvas.height) {
        particle.y = 0;
        particle.x = Math.random() * canvas.width;
      }
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;

      // Draw plankton with glow
      ctx.globalAlpha = particle.opacity;

      // Outer glow
      if (!mobile) {
        ctx.fillStyle = `${theme.colors.starfield}40`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core
      ctx.fillStyle = theme.colors.starfield;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
  }

  animate();
}
