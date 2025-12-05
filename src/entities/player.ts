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
import { getCurrentTheme } from '@core/themes';

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

  const theme = getCurrentTheme();

  // Draw shield glow if active (lighter on mobile to avoid blur cost)
  if (powerUps.shield.active) {
    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;
    const radius = Math.max(player.width, player.height) * PLAYER_CONSTANTS.SHIELD_RADIUS_FACTOR;

    // Flash warning in last 3 seconds (3 flashes)
    // Timer is in frames (60 FPS), so 3 seconds = 180 frames
    const framesRemaining = powerUps.shield.timer;
    const flashWarningThreshold = 180; // Last 3 seconds (60 FPS * 3)
    let shouldDraw = true;

    if (framesRemaining <= flashWarningThreshold && framesRemaining > 0) {
      // Create 3 flashes in the last 3 seconds
      // Each flash is ~1 second (60 frames): visible for 30 frames, hidden for 30 frames
      const flashCycleFrames = 60; // 1 second per flash cycle at 60 FPS
      const flashPosition = framesRemaining % flashCycleFrames;
      shouldDraw = flashPosition > 30; // Visible for first 30 frames (0.5s) of each cycle
    }

    if (shouldDraw) {
      ctx.save();
      if (!isMobile()) {
        ctx.shadowColor = theme.colors.playerShield;
        ctx.shadowBlur = HUD_CONSTANTS.SHIELD_SHADOW_BLUR;
      }
      ctx.strokeStyle = theme.colors.playerShield;
      ctx.lineWidth = HUD_CONSTANTS.SHIELD_LINE_WIDTH;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  const w = player.width;
  const h = player.height;
  const x = player.x;
  const y = player.y;
  const cx = x + w / 2;

  // New spaceship design inspired by space_ship_fighter icon (outline-only vector style)
  ctx.strokeStyle = theme.colors.player;
  ctx.lineWidth = 2;

  // Main fuselage (elongated body) - outline only
  ctx.beginPath();
  ctx.moveTo(cx, y); // Nose tip
  ctx.lineTo(x + w * 0.25, y + h * 0.35); // Left side upper
  ctx.lineTo(x + w * 0.25, y + h * 0.7); // Left side lower
  ctx.lineTo(x + w * 0.35, y + h * 0.85); // Left inner engine mount
  ctx.lineTo(x + w * 0.45, y + h * 0.75); // Left inner wing
  ctx.lineTo(x + w * 0.55, y + h * 0.75); // Right inner wing
  ctx.lineTo(x + w * 0.65, y + h * 0.85); // Right inner engine mount
  ctx.lineTo(x + w * 0.75, y + h * 0.7); // Right side lower
  ctx.lineTo(x + w * 0.75, y + h * 0.35); // Right side upper
  ctx.closePath();
  ctx.stroke();

  // Wings (wider outer sections with flat tips) - outline only
  // Left wing
  ctx.beginPath();
  ctx.moveTo(x + w * 0.25, y + h * 0.5);
  ctx.lineTo(x + w * 0.05, y + h * 0.6); // Flatter angle
  ctx.lineTo(x + w * 0.05, y + h * 0.72); // Flat outer edge
  ctx.lineTo(x + w * 0.25, y + h * 0.7);
  ctx.closePath();
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(x + w * 0.75, y + h * 0.5);
  ctx.lineTo(x + w * 0.95, y + h * 0.6); // Flatter angle
  ctx.lineTo(x + w * 0.95, y + h * 0.72); // Flat outer edge
  ctx.lineTo(x + w * 0.75, y + h * 0.7);
  ctx.closePath();
  ctx.stroke();

  // Cockpit window (glowing outline)
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.25, w * 0.15, h * 0.12, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Engine exhausts (twin engines) - outline only
  const engineY = y + h * 0.85;
  const leftEngineX = x + w * 0.35;
  const rightEngineX = x + w * 0.65;
  const engineWidth = w * 0.08;
  const engineHeight = h * 0.15;

  // Left engine outline
  ctx.strokeRect(leftEngineX - engineWidth / 2, engineY, engineWidth, engineHeight);

  // Right engine outline
  ctx.strokeRect(rightEngineX - engineWidth / 2, engineY, engineWidth, engineHeight);

  // Detail lines on fuselage
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.1, y + h * 0.4);
  ctx.lineTo(cx - w * 0.1, y + h * 0.6);
  ctx.moveTo(cx + w * 0.1, y + h * 0.4);
  ctx.lineTo(cx + w * 0.1, y + h * 0.6);
  ctx.stroke();

  // Additional detail: engine vents
  ctx.beginPath();
  ctx.moveTo(leftEngineX - engineWidth * 0.3, engineY + engineHeight * 0.3);
  ctx.lineTo(leftEngineX - engineWidth * 0.3, engineY + engineHeight * 0.7);
  ctx.moveTo(leftEngineX + engineWidth * 0.3, engineY + engineHeight * 0.3);
  ctx.lineTo(leftEngineX + engineWidth * 0.3, engineY + engineHeight * 0.7);
  ctx.moveTo(rightEngineX - engineWidth * 0.3, engineY + engineHeight * 0.3);
  ctx.lineTo(rightEngineX - engineWidth * 0.3, engineY + engineHeight * 0.7);
  ctx.moveTo(rightEngineX + engineWidth * 0.3, engineY + engineHeight * 0.3);
  ctx.lineTo(rightEngineX + engineWidth * 0.3, engineY + engineHeight * 0.7);
  ctx.stroke();

  // Pulsing thruster flames (twin flames)
  const time = performance.now() / PLAYER_CONSTANTS.PULSE_SPEED_DIVISOR;
  const pulse = (Math.sin(time) + 1) / 2; // 0 to 1

  const flameY = engineY + engineHeight;
  const flameRadius = engineWidth;

  // Left thruster
  if (!isMobile()) {
    const gradientL = ctx.createRadialGradient(
      leftEngineX,
      flameY,
      0,
      leftEngineX,
      flameY,
      flameRadius * 3
    );
    gradientL.addColorStop(0, `rgba(0, 255, 255, ${0.6 * pulse})`);
    gradientL.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = gradientL;
    ctx.beginPath();
    ctx.ellipse(
      leftEngineX,
      flameY + flameRadius,
      flameRadius * 1.2,
      flameRadius * 2.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    const gradientR = ctx.createRadialGradient(
      rightEngineX,
      flameY,
      0,
      rightEngineX,
      flameY,
      flameRadius * 3
    );
    gradientR.addColorStop(0, `rgba(0, 255, 255, ${0.6 * pulse})`);
    gradientR.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = gradientR;
    ctx.beginPath();
    ctx.ellipse(
      rightEngineX,
      flameY + flameRadius,
      flameRadius * 1.2,
      flameRadius * 2.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Core flame shapes with pulse animation
  ctx.fillStyle = `rgba(0, 255, 255, ${0.7 * pulse})`;
  // Left flame
  ctx.beginPath();
  ctx.moveTo(leftEngineX - flameRadius * 0.5, flameY);
  ctx.lineTo(leftEngineX + flameRadius * 0.5, flameY);
  ctx.lineTo(leftEngineX, flameY + flameRadius * 2.5);
  ctx.closePath();
  ctx.fill();

  // Right flame
  ctx.beginPath();
  ctx.moveTo(rightEngineX - flameRadius * 0.5, flameY);
  ctx.lineTo(rightEngineX + flameRadius * 0.5, flameY);
  ctx.lineTo(rightEngineX, flameY + flameRadius * 2.5);
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
