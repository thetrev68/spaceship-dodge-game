/**
 * @fileoverview Starfield effect for background animation (disabled on mobile).
 */

import { isMobile } from '@utils/platform.js';

/**
 * Sets up the starfield effect on the given canvas.
 * @param {HTMLCanvasElement} canvas - The canvas element for the starfield.
 */
export function setupStarfield(canvas) {
  if (isMobile()) {
    canvas.style.display = 'none'; // Hide the background canvas entirely
    return;
  }

  const ctx = canvas.getContext('2d');
  const stars = [];
  const starCount = 100;

  /**
   * Resizes the canvas to full window size.
   */
  function resize() {
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
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
    });
  }

  /**
   * Animates the starfield by updating and drawing stars.
   */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';

    for (const star of stars) {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  animate();
}
