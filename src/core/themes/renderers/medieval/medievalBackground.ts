/**
 * Medieval Background Renderer
 *
 * Phase 6: Castle ruins silhouettes and floating ember particles
 * Implements setupMedievalBackground() and drawCastleSilhouette()
 */
import { isMobile } from '@utils/platform';

/**
 * Medieval fantasy background with castle ruins and floating embers
 *
 * Features:
 * - Gradient sky (golden dawn to royal blue/purple)
 * - Floating ember particles (glowing golden)
 * - Optional sun glow in upper corner
 *
 * @param ctx - Canvas 2D context
 * @param canvas - Target canvas element
 */
export function setupMedievalBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): () => void {
  const mobile = isMobile();
  // Reduced embers on mobile for performance
  const emberCount = mobile ? 50 : 100;

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

  // Initialize ember particles (desktop only)
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

    // SKY GRADIENT (dawn/day - golden dawn to royal blue/purple)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#fbbf24'); // Warm golden dawn at top
    skyGradient.addColorStop(0.4, '#3b82f6'); // Rich royal blue middle
    skyGradient.addColorStop(1, '#7c3aed'); // Deep regal purple at bottom

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // SUN GLOW (upper right corner - subtle dawn sun)
    if (!mobile) {
      const sunX = canvas.width * 0.85;
      const sunY = canvas.height * 0.15;
      const sunRadius = 30;

      // Sun glow (warm golden dawn light)
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 4);
      sunGlow.addColorStop(0, 'rgba(251, 191, 36, 0.2)'); // Warm golden center
      sunGlow.addColorStop(0.7, 'rgba(251, 191, 36, 0.05)');
      sunGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - sunRadius * 4, sunY - sunRadius * 4, sunRadius * 8, sunRadius * 8);

      // Subtle sun core (small golden circle)
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 0.6, 0, Math.PI * 2);
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
        // Outer glow (golden dawn embers)
        ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity * 0.3})`; // Golden glow
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core ember (golden for dawn theme)
      ctx.fillStyle = '#fbbf24'; // Golden dawn color
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
