/**
 * @module effects/starfield
 * Starfield effect for background animation.
 * Optimized for performance with batch rendering and adaptive star counts.
 */

import { isMobile } from '@utils/platform.js';
import { getCurrentTheme } from '@core/themes';

type Star = { x: number; y: number; size: number; speed: number };

/**
 * Sets up the starfield effect on the given canvas.
 */
export function setupStarfield(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const starCount = isMobile() ? 40 : 100; // Reduced count for mobile
  const stars: Star[] = [];

  /**
   * Resizes the canvas to full window size.
   */
  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.objectFit = 'cover';
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1, // Size for rect (slightly larger than radius)
      speed: Math.random() * 0.5 + 0.1,
    });
  }

  /**
   * Animates the starfield by updating and drawing stars.
   */
  function animate(): void {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Batch drawing for performance
    // PERF: Theme is retrieved on every frame. If this becomes a bottleneck,
    // consider caching with theme watcher:
    // let cachedStarfieldColor = getCurrentTheme().colors.starfield;
    // watchTheme((theme) => { cachedStarfieldColor = theme.colors.starfield; });
    const theme = getCurrentTheme();
    ctx.fillStyle = theme.colors.starfield;
    ctx.beginPath();

    for (let i = 0; i < starCount; i++) {
      const star = stars[i];
      if (!star) continue;
      star.y += star.speed;

      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }

      // Use rect instead of arc for performance, and batch them
      ctx.rect(star.x, star.y, star.size, star.size);
    }

    ctx.fill();

    requestAnimationFrame(animate);
  }

  animate();
}
