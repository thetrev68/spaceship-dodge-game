/**
 * @module entities/player
 * Player entity management.
 * Created: 2025-05-28
 */

import type { Player } from '@types';
import { playerState, gameState } from '@core/state.js';
import { fireBullet } from '@entities/bullet.js';
import { clamp } from '@utils/mathUtils.js';
import { isMobile } from '@utils/platform.js';
import { PLAYER_CONSTANTS, HUD_CONSTANTS, GAME_STATE_CONSTANTS } from '@core/gameConstants.js';

const player = playerState.player;
const powerUps = playerState.powerUps;

function clampToCanvas(): void {
  // Optimized: Use window dimensions since game is full screen
  // Avoids DOM access every frame
  player.x = clamp(player.x, 0, window.innerWidth - player.width);
  player.y = clamp(player.y, 0, window.innerHeight - player.height);
}

/**
 */
function movePlayer(dx: number, dy: number): void {
  player.x += dx;
  player.y += dy;
  clampToCanvas();
}

/**
 * Sets the player's position to specified coordinates with automatic canvas clamping.
 *
 * ## Behavior
 * - Updates player x/y coordinates
 * - Clamps position to keep player fully on screen
 * - Used for mouse/touch control (player follows cursor)
 *
 * ## Clamping
 * Player is constrained to `[0, canvas.width - player.width] × [0, canvas.height - player.height]`
 * to ensure the entire player sprite remains visible (no partial off-screen rendering).
 *
 * @param x - Target X position (will be clamped to canvas bounds)
 * @param y - Target Y position (will be clamped to canvas bounds)
 *
 * @example
 * ```typescript
 * // Mouse control
 * canvas.addEventListener('mousemove', (e) => {
 *   setPlayerPosition(e.clientX - player.width / 2, e.clientY - player.height / 2);
 * });
 *
 * // Touch control
 * canvas.addEventListener('touchmove', (e) => {
 *   const touch = e.touches[0];
 *   setPlayerPosition(touch.clientX - player.width / 2, touch.clientY - player.height / 2);
 * });
 * ```
 */
export function setPlayerPosition(x: number, y: number): void {
  player.x = x;
  player.y = y;
  clampToCanvas();
}

/**
 * Resets the player to starting position (center-bottom of screen).
 * Called on game start and after respawn.
 *
 * ## Reset Behavior
 * - Position: Centered horizontally, near bottom of screen
 * - Velocity: Set to zero (no momentum)
 * - Override: Clears any position override from input system
 *
 * ## Position Calculation
 * - X: `canvasWidth / 2 - player.width / 2` (centered)
 * - Y: `canvasHeight - player.height - OFFSET` (near bottom, with padding)
 *
 * @param canvasWidth - Canvas width for horizontal centering
 * @param canvasHeight - Canvas height for vertical positioning
 *
 * @example
 * ```typescript
 * // On game start
 * resetPlayer(canvas.width, canvas.height);
 * gameState.value = 'PLAYING';
 *
 * // After player death (if lives remain)
 * if (playerLives.value > 0) {
 *   setTimeout(() => {
 *     resetPlayer(canvas.width, canvas.height);
 *   }, 1000); // Brief respawn delay
 * }
 * ```
 */
export function resetPlayer(canvasWidth: number, canvasHeight: number): void {
  player.x = canvasWidth / 2 - player.width / 2;
  player.y = canvasHeight - player.height - GAME_STATE_CONSTANTS.PLAYER_RESET_Y_OFFSET;
  player.dx = 0;
  player.dy = 0;
  player.overridePosition = null;
}

/**
 * Updates player position based on velocity or position override.
 * Called every frame during PLAYING game state.
 *
 * ## Update Logic
 * 1. If `overridePosition` set: Apply override and clear it (for input system)
 * 2. Otherwise: Apply velocity (`dx`, `dy`) to position
 * 3. Clamp to canvas bounds
 *
 * ## Position Override
 * The input system sets `overridePosition` for direct position control:
 * - Mouse/touch: Player follows cursor exactly
 * - Keyboard: Uses velocity-based movement
 *
 * @example
 * ```typescript
 * // In game loop (called every frame)
 * function gameLoop() {
 *   if (gameState.value === 'PLAYING') {
 *     updatePlayer(); // Update position
 *     updateBullets();
 *     updateObstacles();
 *     checkCollisions();
 *     renderAll();
 *   }
 *   requestAnimationFrame(gameLoop);
 * }
 * ```
 */
export function updatePlayer(): void {
  if (gameState.value !== 'PLAYING') return;

  const override = player.overridePosition;
  if (override && typeof override === 'object' && 'x' in override && 'y' in override) {
    setPlayerPosition(override.x, override.y);
    player.overridePosition = null;
  } else {
    movePlayer(player.dx, player.dy);
  }
}

/**
 * Renders the player spaceship to the canvas with vector graphics.
 *
 * ## Rendering Details
 * - **Ship Body**: Triangular vector shape (classic spaceship silhouette)
 * - **Engine Block**: Trapezoidal engine with exhaust detail lines
 * - **Thruster Flame**: Pulsing radial gradient glow (animated)
 * - **Shield Effect**: Glowing circle around player if shield powerup active
 *
 * ## Mobile Optimizations
 * - Disables expensive shadow blur on shield (saves GPU)
 * - Disables thruster gradient (uses simple circle instead)
 * - Reduces draw calls for better performance on low-end devices
 *
 * ## Shield Visual
 * When shield powerup is active:
 * - Desktop: Glowing blue circle with shadow blur
 * - Mobile: Simple blue stroke circle (no blur)
 * - Radius: 1.5x player size
 *
 * ## Thruster Animation
 * Pulsing flame effect using `performance.now()`:
 * - Sine wave animation (0-1 range)
 * - Radial gradient from cyan to transparent
 * - Pulsates at consistent rate (independent of frame rate)
 *
 * @param ctx - Canvas 2D rendering context
 *
 * @example
 * ```typescript
 * // In render loop
 * function renderAll(ctx: CanvasRenderingContext2D) {
 *   ctx.clearRect(0, 0, canvas.width, canvas.height);
 *   drawStarfield(ctx);
 *   drawObstacles(ctx);
 *   drawPlayer(ctx); // Render player
 *   drawBullets(ctx);
 *   drawHUD(ctx);
 * }
 * ```
 */
export function drawPlayer(ctx: CanvasRenderingContext2D): void {
  if (gameState.value !== 'PLAYING') return;

  // Draw shield glow if active (lighter on mobile to avoid blur cost)
  if (powerUps.shield.active) {
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;
    const radius = Math.max(player.width, player.height) * PLAYER_CONSTANTS.SHIELD_RADIUS_FACTOR;
    ctx.save();
    if (!isMobile()) {
      ctx.shadowColor = HUD_CONSTANTS.SHIELD_SHADOW_COLOR;
      ctx.shadowBlur = HUD_CONSTANTS.SHIELD_SHADOW_BLUR;
    }
    ctx.strokeStyle = HUD_CONSTANTS.SHIELD_STROKE_STYLE;
    ctx.lineWidth = HUD_CONSTANTS.SHIELD_LINE_WIDTH;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;

  const w = player.width;
  const h = player.height;
  const x = player.x;
  const y = player.y;
  const cx = x + w / 2;
  const narrowFactor = PLAYER_CONSTANTS.NARROW_FACTOR; // Increase this to narrow the ship

  // Main Ship Body
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + w * PLAYER_CONSTANTS.ENGINE_TOP_WIDTH_FACTOR, y + h * 0.8);
  ctx.lineTo(cx - w * narrowFactor, y + h * PLAYER_CONSTANTS.ENGINE_Y_FACTOR);
  ctx.lineTo(cx + w * narrowFactor, y + h * PLAYER_CONSTANTS.ENGINE_Y_FACTOR);
  ctx.lineTo(x + w * 0.8, y + h * 0.8);
  ctx.closePath();
  ctx.stroke();

  // Engine Block
  const engineTopWidth = w * PLAYER_CONSTANTS.ENGINE_TOP_WIDTH_FACTOR;
  const engineBottomWidth = w * PLAYER_CONSTANTS.ENGINE_BOTTOM_WIDTH_FACTOR;
  const engineHeight = h * PLAYER_CONSTANTS.ENGINE_HEIGHT_FACTOR;
  const engineY = y + h * PLAYER_CONSTANTS.ENGINE_Y_FACTOR;
  const engineBottomY = engineY + engineHeight;
  const engineTopLeftX = cx - engineTopWidth / 2;
  const engineTopRightX = cx + engineTopWidth / 2;
  const engineBottomLeftX = cx - engineBottomWidth / 2;
  const engineBottomRightX = cx + engineBottomWidth / 2;

  ctx.beginPath();
  ctx.moveTo(engineTopLeftX, engineY);
  ctx.lineTo(engineTopRightX, engineY);
  ctx.lineTo(engineBottomRightX, engineBottomY);
  ctx.lineTo(engineBottomLeftX, engineBottomY);
  ctx.closePath();
  ctx.stroke();

  // Exhaust Detail Lines
  ctx.beginPath();
  ctx.moveTo(cx, engineY + engineHeight * 0.2);
  ctx.lineTo(cx, engineY + engineHeight * 0.8);
  ctx.moveTo(cx - engineBottomWidth * 0.8, engineY + engineHeight * 0.3);
  ctx.lineTo(cx - engineBottomWidth * 0.8, engineY + engineHeight * 0.7);
  ctx.moveTo(cx + engineBottomWidth * 0.8, engineY + engineHeight * 0.3);
  ctx.lineTo(cx + engineBottomWidth * 0.8, engineY + engineHeight * 0.7);
  ctx.stroke();

  // Pulsing thruster flame
  const time = performance.now() / PLAYER_CONSTANTS.PULSE_SPEED_DIVISOR; // pulse speed
  const pulse = (Math.sin(time) + 1) / 2; // 0 to 1

  const flameX = cx;
  const flameY = engineBottomY + 5;
  const flameRadius = engineBottomWidth;

  if (!isMobile()) {
    // High-quality gradient glow for desktop
    const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameRadius * 3);
    gradient.addColorStop(0, `rgba(0, 255, 255, ${0.6 * pulse})`);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      flameX,
      flameY + flameRadius,
      flameRadius * 1.5,
      flameRadius * 3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Core flame shape (simple solid color for mobile)
  ctx.fillStyle = `rgba(0, 255, 255, ${0.7 * pulse})`;
  ctx.beginPath();
  ctx.moveTo(flameX - flameRadius * 0.6, engineBottomY);
  ctx.lineTo(flameX + flameRadius * 0.6, engineBottomY);
  ctx.lineTo(flameX, engineBottomY + flameRadius * 3);
  ctx.closePath();
  ctx.fill();
}

/**
 */
export function getPlayerDimensions(): Pick<Player, 'width' | 'height'> {
  return { width: player.width, height: player.height };
}

/**
 */
export function getPlayerSpeed(): number {
  return player.speed;
}

/**
 */
export function getPlayerVelocity(): Pick<Player, 'dx' | 'dy'> {
  return { dx: player.dx, dy: player.dy };
}

/**
 */
export function setPlayerMovement(dx: number, dy: number): void {
  player.dx = dx;
  player.dy = dy;
}

export function firePlayerBullets(): void {
  if (powerUps.doubleBlaster.active) {
    fireBullet(player.x + player.width * PLAYER_CONSTANTS.DOUBLE_BLASTER_OFFSET, player.y);
    fireBullet(player.x + player.width * (1 - PLAYER_CONSTANTS.DOUBLE_BLASTER_OFFSET), player.y);
  } else {
    fireBullet(player.x + player.width * PLAYER_CONSTANTS.SINGLE_BLASTER_OFFSET, player.y);
  }
}
