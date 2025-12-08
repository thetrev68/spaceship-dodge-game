/**
 * Medieval Background Renderer
 *
 * Phase 6: Castle ruins silhouettes and floating ember particles
 * Implements setupMedievalBackground() and drawCastleSilhouette()
 */
import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';

/**
 * Medieval fantasy background with castle ruins and floating embers
 *
 * Features:
 * - Gradient sky (purple dusk to dark blue night)
 * - Floating ember particles (glowing orange)
 * - Optional moon in upper corner
 *
 * @param ctx - Canvas 2D context
 * @param canvas - Target canvas element
 */
export function setupMedievalBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): () => void {
  const theme = getCurrentTheme();
  const mobile = isMobile();
  const emberCount = mobile ? 40 : 100;

  type Ember = {
    x: number;
    y: number;
    size: number;
    speed: number;
    drift: number;
    opacity: number;
    flicker: number; // Flicker phase offset
  };

  const embers: Ember[] = [];

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  let rafId: number | undefined;

  // Initialize ember particles
  for (let i = 0; i < emberCount; i++) {
    embers.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.15 + 0.05, // Slow rise
      drift: (Math.random() - 0.5) * 0.1, // Gentle horizontal drift
      opacity: Math.random() * 0.6 + 0.3,
      flicker: Math.random() * Math.PI * 2,
    });
  }

  function animate(): void {
    if (!ctx) return;

    // SKY GRADIENT (dusk/night)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#4c1d95'); // Deep purple at top
    skyGradient.addColorStop(0.4, '#1e1b4b'); // Dark indigo middle
    skyGradient.addColorStop(1, '#0f172a'); // Near-black at bottom

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // MOON (upper right corner)
    if (!mobile) {
      const moonX = canvas.width * 0.85;
      const moonY = canvas.height * 0.15;
      const moonRadius = 40;

      // Moon glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 3);
      moonGlow.addColorStop(0, 'rgba(250, 250, 210, 0.1)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - moonRadius * 3, moonY - moonRadius * 3, moonRadius * 6, moonRadius * 6);

      // Moon body
      ctx.fillStyle = '#fafad2';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters (darker circles)
      ctx.fillStyle = 'rgba(100, 100, 80, 0.3)';
      ctx.beginPath();
      ctx.arc(moonX - 10, moonY - 5, 8, 0, Math.PI * 2);
      ctx.arc(moonX + 5, moonY + 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // FLOATING EMBERS
    const time = performance.now() / 1000;

    embers.forEach((ember) => {
      // Update position
      ember.y -= ember.speed; // Rise upward
      ember.x += ember.drift; // Gentle horizontal drift

      // Wrap around
      if (ember.y < -10) {
        ember.y = canvas.height + 10;
        ember.x = Math.random() * canvas.width;
      }
      if (ember.x < 0) ember.x = canvas.width;
      if (ember.x > canvas.width) ember.x = 0;

      // Flickering opacity
      const flicker = Math.sin(time * 2 + ember.flicker) * 0.2 + 0.8; // 0.6 to 1.0
      const currentOpacity = ember.opacity * flicker;

      // Draw ember with glow
      if (!mobile) {
        // Outer glow
        ctx.fillStyle = `rgba(251, 146, 60, ${currentOpacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core ember
      ctx.fillStyle = theme.colors.starfield; // Gold/orange
      ctx.globalAlpha = currentOpacity;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);

  return () => {
    window.removeEventListener('resize', resize);
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }
  };
}
