/**
 * Medieval theme: Obstacle renderer (wyverns, bats, crystals)
 *
 * Implements Phase 3 design with three distinct obstacle types:
 * - Wyverns (large): Hostile dragons with dark wings and smoke
 * - Giant Bats (medium): Cave creatures with leathery wings
 * - Magical Crystals (small): Arcane hazards with pulsing energy
 *
 * All obstacles use top-down perspective to match dragon rider view.
 */
import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';
import type { Asteroid } from '@types';

/** Main obstacle type enum */
type MedievalObstacleType = 'wyvern' | 'bat' | 'crystal';

/** Get obstacle type based on size */
function getObstacleTypeBySize(radius: number): MedievalObstacleType {
  if (radius >= 30) return 'wyvern'; // Large obstacles
  if (radius >= 15) return 'bat'; // Medium obstacles
  return 'crystal'; // Small obstacles
}

/** Main entry - draw medieval obstacles with type-based variety */
export function drawMedievalObstacle(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const type = getObstacleTypeBySize(obstacle.radius);

  switch (type) {
    case 'wyvern':
      drawWyvern(ctx, obstacle);
      break;
    case 'bat':
      drawBat(ctx, obstacle);
      break;
    case 'crystal':
      drawCrystal(ctx, obstacle);
      break;
  }
}

/**
 * Draws a classic vector-art style wyvern from a top-down view.
 * This version features a strong silhouette, seamless body, and powerful wing flaps.
 */
function drawWyvern(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;
  const rotation = obstacle.rotation; // Animation phase

  const movementAngle = Math.atan2(obstacle.speed + obstacle.dy, obstacle.dx);
  const wingFlap = Math.sin(rotation * 3) * radius * 0.25; // Simple, powerful flap
  const tailSway = Math.sin(rotation * 1.5) * radius * 0.2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(movementAngle + Math.PI / 2);

  const bodyColor = '#374151';
  const wingColor = '#4B5563';
  const strokeColor = '#2d343f';

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(2, radius * 0.07);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // WINGS (drawn first, behind body)
  ctx.fillStyle = wingColor;
  const wingWidth = radius * 1.9;

  // Left Wing
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.5);
  ctx.lineTo(-wingWidth * 0.5, -radius * 0.8 + wingFlap);
  ctx.lineTo(-wingWidth, -radius * 0.3 + wingFlap);
  ctx.lineTo(-wingWidth * 0.8, -radius * 0.1 + wingFlap);
  ctx.lineTo(-wingWidth * 0.4, radius * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Wing
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.5);
  ctx.lineTo(wingWidth * 0.5, -radius * 0.8 + wingFlap);
  ctx.lineTo(wingWidth, -radius * 0.3 + wingFlap);
  ctx.lineTo(wingWidth * 0.8, -radius * 0.1 + wingFlap);
  ctx.lineTo(wingWidth * 0.4, radius * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // SEAMLESS HEAD, BODY, AND TAIL (drawn as one path)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();

  // Start at tail barb
  const tailLength = radius * 1.5;
  const tailBarbWidth = radius * 0.2;
  ctx.moveTo(0, tailLength + tailBarbWidth);
  ctx.lineTo(-tailBarbWidth, tailLength);
  ctx.lineTo(0, tailLength - tailBarbWidth);
  ctx.lineTo(tailBarbWidth, tailLength);
  ctx.lineTo(0, tailLength + tailBarbWidth);

  // Left side of tail and body
  ctx.lineTo(-tailBarbWidth * 0.5 + tailSway, tailLength * 0.8);
  ctx.lineTo(-radius * 0.1 + tailSway, radius * 0.6);
  ctx.lineTo(-radius * 0.15, -radius * 0.2);

  // Head
  ctx.lineTo(-radius * 0.05, -radius * 0.7); // neck
  ctx.lineTo(-radius * 0.2, -radius * 0.6); // left horn
  ctx.lineTo(0, -radius * 1.0); // tip of head
  ctx.lineTo(radius * 0.2, -radius * 0.6); // right horn
  ctx.lineTo(radius * 0.05, -radius * 0.7); // neck

  // Right side of body and tail
  ctx.lineTo(radius * 0.15, -radius * 0.2);
  ctx.lineTo(radius * 0.1 + tailSway, radius * 0.6);
  ctx.lineTo(tailBarbWidth * 0.5 + tailSway, tailLength * 0.8);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a giant bat from top-down view.
 * Correctly orients to the true movement vector.
 * Features a forward-facing glow instead of eyes to maintain perspective.
 */
function drawBat(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;
  const rotation = obstacle.rotation; // Animation phase

  // Correctly calculate movement angle using the full velocity vector
  const movementAngle = Math.atan2(obstacle.speed + obstacle.dy, obstacle.dx);
  const wingFlap = Math.sin(rotation * 5) * radius * 0.2; // Faster, more subtle flap

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(movementAngle + Math.PI / 2); // Orient sprite to movement direction

  const bodyColor = '#333333';
  const wingColor = '#222222';
  const eyeColor = '#DC2626';

  ctx.strokeStyle = '#111111';
  ctx.lineWidth = Math.max(1, radius * 0.05);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // WINGS (Batman-logo style)
  ctx.fillStyle = wingColor;
  const wingWidth = radius * 1.8;
  const bodyWingAttachY = -radius * 0.2;

  // Left Wing
  ctx.beginPath();
  ctx.moveTo(-radius * 0.1, bodyWingAttachY);
  ctx.quadraticCurveTo(-wingWidth * 0.4, -radius * 0.8, -wingWidth, -radius * 0.4 + wingFlap);
  ctx.lineTo(-wingWidth * 0.7, -radius * 0.3 + wingFlap);
  ctx.lineTo(-wingWidth * 0.5, -radius * 0.5 + wingFlap);
  ctx.lineTo(-wingWidth * 0.25, radius * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Wing
  ctx.beginPath();
  ctx.moveTo(radius * 0.1, bodyWingAttachY);
  ctx.quadraticCurveTo(wingWidth * 0.4, -radius * 0.8, wingWidth, -radius * 0.4 + wingFlap);
  ctx.lineTo(wingWidth * 0.7, -radius * 0.3 + wingFlap);
  ctx.lineTo(wingWidth * 0.5, -radius * 0.5 + wingFlap);
  ctx.lineTo(wingWidth * 0.25, radius * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // BODY & HEAD
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.3, radius * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // EARS
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.1, -radius * 0.5);
  ctx.lineTo(-radius * 0.3, -radius * 0.8);
  ctx.lineTo(-radius * 0.35, -radius * 0.6);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(radius * 0.1, -radius * 0.5);
  ctx.lineTo(radius * 0.3, -radius * 0.8);
  ctx.lineTo(radius * 0.35, -radius * 0.6);
  ctx.fill();
  ctx.stroke();

  // FORWARD GLOW (replaces eyes for top-down view)
  const glowRadius = radius * 0.15;
  const glowY = -radius * 0.7;
  const gradient = ctx.createRadialGradient(0, glowY, glowRadius * 0.2, 0, glowY, glowRadius);
  gradient.addColorStop(0, eyeColor);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, glowY, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws magical crystal from top-down view
 *
 * Features:
 * - Geometric hexagonal shape
 * - Pulsing glow effect
 * - Rotating animation
 * - Bright glowing core
 * - Arcane energy particles orbiting
 */
function drawCrystal(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const theme = getCurrentTheme();
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;
  const rotation = obstacle.rotation;

  // Pulsing glow
  const pulse = Math.sin(rotation * 4) * 0.15 + 1; // 0.85 to 1.15

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation * 0.5); // Slow rotation

  const crystalColor = '#8b5cf6'; // Purple magic

  // Outer glow
  if (!isMobile()) {
    ctx.strokeStyle = crystalColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3 * pulse;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * radius * 1.2;
      const y = Math.sin(angle) * radius * 1.2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Hexagonal crystal body
  ctx.fillStyle = `${crystalColor}60`;
  ctx.strokeStyle = crystalColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner facets (lines from center to corners)
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Glowing core
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.4);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.5, crystalColor);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.4 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Orbiting arcane particles (3 small dots)
  if (!isMobile()) {
    for (let i = 0; i < 3; i++) {
      const orbitAngle = rotation * 3 + (i / 3) * Math.PI * 2;
      const orbitRadius = radius * 1.3;
      const particleX = cx + Math.cos(orbitAngle) * orbitRadius;
      const particleY = cy + Math.sin(orbitAngle) * orbitRadius;

      ctx.fillStyle = crystalColor;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
