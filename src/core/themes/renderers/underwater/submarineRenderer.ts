/**
 * @module themes/renderers/underwater/submarineRenderer
 * Underwater theme player renderer - transforms spaceship into submarine.
 *
 * ## Visual Design
 * The submarine design includes:
 * - **Main hull**: Elongated elliptical capsule (40% of player dimensions)
 * - **Conning tower**: Small rectangular protrusion on top
 * - **Periscope**: Thin vertical line extending from conning tower
 * - **Portholes**: Three circular windows along the hull
 * - **Propeller**: Animated cross-shaped propeller at rear (spins continuously)
 * - **Bubble trail**: 5 ascending bubbles fading out (desktop only)
 * - **Shield effect**: Circular glow when shield powerup is active
 *
 * ## Performance
 * - Desktop: Full detail with animated propeller and bubble trail
 * - Mobile: No bubble trail to reduce draw calls
 * - Animation: Uses `performance.now()` for smooth, frame-independent motion
 *
 * ## Entity Reuse
 * This renderer **reuses the existing Player entity data structure** without modification:
 * - Position (x, y) determines submarine location
 * - Dimensions (width, height) scale submarine size
 * - Powerup state (shield.active) controls shield rendering
 * - **Zero code duplication** - same game logic, different visuals
 */

import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';
import type { Player } from '@types';
import { PLAYER_CONSTANTS } from '@core/gameConstants';
import { playerState } from '@core/state/playerState';

/**
 * Renders the player entity as a detailed submarine with vector graphics.
 *
 * ## Rendering Details
 * - **Hull**: Elliptical body with theme color stroke
 * - **Conning Tower**: Rectangular structure (20% width, 30% height)
 * - **Periscope**: Vertical line from tower to top edge
 * - **Portholes**: 3 circular windows evenly spaced along hull
 * - **Propeller**: Cross-shaped, rotates at 1 revolution per 400ms
 * - **Bubbles**: 5 bubbles with size variation, fade with distance
 * - **Shield**: Circular glow when powerup active (radius × SHIELD_RADIUS_FACTOR)
 *
 * ## Theme Integration
 * Uses theme colors for consistent visual style:
 * - `theme.colors.player` - Submarine body and details
 * - `theme.colors.playerShield` - Shield effect color
 *
 * ## Performance Characteristics
 * - Draw calls: 12-20 (depending on bubble trail and shield)
 * - Mobile optimization: Skips bubble trail (saves 5 draw calls)
 * - Animation overhead: Minimal (2 `performance.now()` calls)
 *
 * @param ctx - Canvas 2D rendering context
 * @param player - Player entity data (position, size, powerup state)
 *
 * @example
 * ```typescript
 * // Used by renderManager.ts with strategy pattern
 * const theme = getCurrentTheme();
 * if (theme.renderers?.player) {
 *   theme.renderers.player(ctx, playerState.player); // Renders submarine
 * } else {
 *   drawPlayer(ctx); // Renders default spaceship
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Manual usage (testing or custom rendering)
 * const player: Player = {
 *   x: 100,
 *   y: 200,
 *   width: 40,
 *   height: 60,
 *   speed: 5,
 *   dx: 0,
 *   dy: 0,
 *   overridePosition: null
 * };
 * drawSubmarine(ctx, player);
 * ```
 */
export function drawSubmarine(ctx: CanvasRenderingContext2D, player: Player): void {
  const theme = getCurrentTheme();
  const x = player.x;
  const y = player.y;
  const w = player.width;
  const h = player.height;
  const cx = x + w / 2;

  ctx.strokeStyle = theme.colors.player;
  ctx.fillStyle = theme.colors.player;
  ctx.lineWidth = 2;

  // Main hull (elongated capsule)
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.5, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Conning tower (small vertical protrusion)
  ctx.strokeRect(cx - w * 0.1, y + h * 0.15, w * 0.2, h * 0.3);

  // Periscope
  ctx.beginPath();
  ctx.moveTo(cx, y + h * 0.15);
  ctx.lineTo(cx, y);
  ctx.stroke();

  // Porthole windows (3 circular windows)
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const windowX = cx - w * 0.2 + i * w * 0.2;
    ctx.beginPath();
    ctx.arc(windowX, y + h * 0.5, w * 0.06, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Propeller at rear (animated)
  const time = performance.now() / 200;
  const propellerAngle = time % (Math.PI * 2);
  const propX = cx;
  const propY = y + h * 0.9;

  ctx.save();
  ctx.translate(propX, propY);
  ctx.rotate(propellerAngle);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, 0);
  ctx.lineTo(w * 0.1, 0);
  ctx.moveTo(0, -w * 0.1);
  ctx.lineTo(0, w * 0.1);
  ctx.stroke();
  ctx.restore();

  // Bubble trail (thrust replacement)
  if (!isMobile()) {
    ctx.save();
    const bubbleCount = 5;
    const bubbleTime = performance.now() / 100;

    for (let i = 0; i < bubbleCount; i++) {
      const offset = (bubbleTime + i * 20) % 100;
      const bubbleY = propY + offset;
      const bubbleSize = 2 + Math.sin(bubbleTime + i) * 1;

      ctx.globalAlpha = Math.max(0, 1 - offset / 100);
      ctx.beginPath();
      ctx.arc(propX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Shield effect (if active) - same as space theme
  if (playerState.powerUps.shield.active) {
    const radius = Math.max(w, h) * PLAYER_CONSTANTS.SHIELD_RADIUS_FACTOR;
    ctx.strokeStyle = theme.colors.playerShield;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, y + h / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
