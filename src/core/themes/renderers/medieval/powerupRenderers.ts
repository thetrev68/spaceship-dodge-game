/**
 * Powerup Renderers - Medieval Fantasy Theme
 *
 * Phase 5: Magic powerup renderers (rune shield and spell tome)
 */
import { getCurrentTheme } from '@core/themes';
import type { ActivePowerup } from '@types';

/**
 * Draw the rune shield powerup (rotating magical circle with pentagram).
 *
 * @param ctx - Canvas 2D context
 * @param powerup - Active powerup payload with size/position
 * @returns void
 *
 * @example
 * ```typescript
 * const powerup = { x: 100, y: 100, size: 40 };
 * drawRuneShield(ctx, powerup);
 * ```
 */
export function drawRuneShield(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const radius = powerup.size / 2;

  // Animation timing
  const time = performance.now() / 1000;
  const rotation = time * 0.8; // Slow rotation
  const pulse = Math.sin(time * 3) * 0.1 + 1; // Pulsing glow

  ctx.save();
  ctx.translate(x, y);

  // Draw outer glow
  const glowRadius = radius * 1.4 * pulse;
  const gradient = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, glowRadius);
  gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)'); // Purple glow
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw rotating rune ring
  ctx.rotate(rotation);
  ctx.strokeStyle = theme.colors.powerupShield;
  ctx.lineWidth = radius * 0.15;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  // Draw runes around the circle
  ctx.fillStyle = theme.colors.powerupShield;
  ctx.font = `${radius * 0.3}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const runes = ['ᚱ', 'ᚢ', 'ᚾ', 'ᛖ', 'ᛋ']; // Runic characters
  for (let i = 0; i < runes.length; i++) {
    const angle = (i / runes.length) * Math.PI * 2;
    const runeX = Math.cos(angle) * radius * 0.9;
    const runeY = Math.sin(angle) * radius * 0.9;
    ctx.save();
    ctx.translate(runeX, runeY);
    ctx.rotate(angle + Math.PI / 2); // Rotate runes to face outward
    ctx.fillText(runes[i]!, 0, 0);
    ctx.restore();
  }

  ctx.restore();

  // Draw central pentagram (not rotated)
  drawPentagram(ctx, x, y, radius * 0.4, theme.colors.powerupShield);

  // Draw orbiting particles
  drawOrbitingParticles(ctx, x, y, radius * 1.2, time, theme.colors.powerupShield);

  // Reset shadow blur
  ctx.shadowBlur = 0;
}

/**
 * Draw the spell tome powerup (floating open book with sparkles).
 *
 * @param ctx - Canvas 2D context
 * @param powerup - Active powerup payload with size/position
 * @returns void
 *
 * @example
 * ```typescript
 * const powerup = { x: 200, y: 150, size: 50 };
 * drawSpellTome(ctx, powerup);
 * ```
 */
export function drawSpellTome(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const size = powerup.size;

  // Animation timing
  const time = performance.now() / 1000;
  const bob = Math.sin(time * 2) * 3; // Gentle bobbing

  ctx.save();
  ctx.translate(x, y + bob);

  const bookWidth = size * 0.8;
  const bookHeight = size * 0.6;
  const pageOffset = size * 0.1;

  // Draw book cover (brown leather)
  ctx.fillStyle = '#8B4513'; // Saddle brown
  ctx.fillRect(-bookWidth / 2, -bookHeight / 2, bookWidth, bookHeight);

  // Draw spine
  ctx.fillStyle = '#654321'; // Dark brown
  ctx.fillRect(-bookWidth / 2 - 2, -bookHeight / 2, 4, bookHeight);

  // Draw left page (glowing green)
  const leftPageGradient = ctx.createLinearGradient(-bookWidth / 2, 0, 0, 0);
  leftPageGradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)'); // Green glow
  leftPageGradient.addColorStop(1, 'rgba(34, 197, 94, 0.4)');
  ctx.fillStyle = leftPageGradient;
  ctx.fillRect(
    -bookWidth / 2 + pageOffset,
    -bookHeight / 2 + pageOffset,
    bookWidth / 2 - pageOffset,
    bookHeight - pageOffset * 2
  );

  // Draw right page (glowing green)
  const rightPageGradient = ctx.createLinearGradient(0, 0, bookWidth / 2, 0);
  rightPageGradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
  rightPageGradient.addColorStop(1, 'rgba(34, 197, 94, 0.8)');
  ctx.fillStyle = rightPageGradient;
  ctx.fillRect(
    pageOffset,
    -bookHeight / 2 + pageOffset,
    bookWidth / 2 - pageOffset,
    bookHeight - pageOffset * 2
  );

  // Draw magical symbols on pages
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * 0.2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Left page symbols
  ctx.fillText('ᚠ', -bookWidth / 4, -bookHeight / 4); // Fehu (wealth)
  ctx.fillText('ᚢ', -bookWidth / 4, bookHeight / 4); // Uruz (strength)

  // Right page symbols
  ctx.fillText('ᚦ', bookWidth / 4, -bookHeight / 4); // Thurisaz (force)
  ctx.fillText('ᚫ', bookWidth / 4, bookHeight / 4); // Ansuz (wisdom)

  ctx.restore();

  // Draw rising sparkles
  drawRisingSparkles(ctx, x, y + bob, size, time, theme.colors.powerupBlaster);
}

/**
 * Draw a pentagram (5-pointed star).
 *
 * @param ctx - Canvas 2D context
 * @param x - Center X coordinate
 * @param y - Center Y coordinate
 * @param radius - Outer radius
 * @param color - Stroke color
 */
function drawPentagram(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = radius * 0.1;
  ctx.beginPath();

  for (let i = 0; i <= 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2; // 144 degrees between points
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.stroke();
}

/**
 * Draw orbiting particles around the rune shield.
 *
 * @param ctx - Canvas 2D context
 * @param centerX - Orbit center X
 * @param centerY - Orbit center Y
 * @param orbitRadius - Orbit radius
 * @param time - Animation time
 * @param color - Particle color
 */
function drawOrbitingParticles(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  orbitRadius: number,
  time: number,
  color: string
): void {
  const particleCount = 3;

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + time * 1.5; // Orbit speed
    const x = centerX + Math.cos(angle) * orbitRadius;
    const y = centerY + Math.sin(angle) * orbitRadius;

    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Draw rising sparkles from the spell tome.
 *
 * @param ctx - Canvas 2D context
 * @param bookX - Book center X
 * @param bookY - Book center Y
 * @param bookSize - Book size for scaling
 * @param time - Animation time
 * @param color - Sparkle color
 */
function drawRisingSparkles(
  ctx: CanvasRenderingContext2D,
  bookX: number,
  bookY: number,
  bookSize: number,
  time: number,
  color: string
): void {
  const sparkleCount = 5;

  for (let i = 0; i < sparkleCount; i++) {
    const offset = (i / sparkleCount) * Math.PI * 2 + time * 0.5;
    const riseSpeed = 20 + i * 5; // Different rise speeds
    const x = bookX + Math.sin(offset) * bookSize * 0.3;
    const y = bookY - ((time * riseSpeed + i * 10) % (bookSize * 2));

    // Only draw if sparkle is visible above the book
    if (y < bookY - bookSize * 0.3) {
      // Draw sparkle (small star shape)
      ctx.fillStyle = color;
      const sparkleSize = 3;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 2 + i); // Rotate sparkles

      // Draw 4-pointed star
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j * Math.PI) / 4;
        const radius = j % 2 === 0 ? sparkleSize : sparkleSize * 0.5;
        const sx = Math.cos(angle) * radius;
        const sy = Math.sin(angle) * radius;
        if (j === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
}
