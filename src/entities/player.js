/**
 * @fileoverview Player entity management.
 * Created: 2025-05-28
 */

import { player, gameState, powerUps } from '@core/state.js';
import { fireBullet } from '@entities/bullet.js';
import { clamp } from '@utils/mathUtils.js';
import { isMobile } from '@utils/platform.js';
import {
  PLAYER_CONSTANTS,
  HUD_CONSTANTS,
  GAME_STATE_CONSTANTS
} from '@core/gameConstants.js';

/**
 * Clamps player position to canvas bounds.
 */
function clampToCanvas() {
    // Optimized: Use window dimensions since game is full screen
    // Avoids DOM access every frame
    player.x = clamp(player.x, 0, window.innerWidth - player.width);
    player.y = clamp(player.y, 0, window.innerHeight - player.height);
}

/**
 * Moves player by delta values.
 * @param {number} dx - Delta X.
 * @param {number} dy - Delta Y.
 */
function movePlayer(dx, dy) {
    player.x += dx;
    player.y += dy;
    clampToCanvas();
}

/**
 * Sets player position directly (for touch controls).
 * @param {number} x - X position.
 * @param {number} y - Y position.
 */
export function setPlayerPosition(x, y) {
    player.x = x;
    player.y = y;
    clampToCanvas();
}

/**
 * Resets player to initial position.
 * @param {number} canvasWidth - Canvas width.
 * @param {number} canvasHeight - Canvas height.
 */
export function resetPlayer(canvasWidth, canvasHeight) {
    player.x = canvasWidth / 2 - player.width / 2;
    player.y = canvasHeight - player.height - GAME_STATE_CONSTANTS.PLAYER_RESET_Y_OFFSET;
    player.dx = 0;
    player.dy = 0;
    player.overridePosition = null;
}

/**
 * Updates player position and state.
 */
export function updatePlayer() {
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
 * Draws the player on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
export function drawPlayer(ctx) {
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
        ctx.ellipse(flameX, flameY + flameRadius, flameRadius * 1.5, flameRadius * 3, 0, 0, Math.PI * 2);
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
 * Gets player dimensions.
 * @returns {{ width: number; height: number }} Object with width and height.
 */
export function getPlayerDimensions() {
    return { width: player.width, height: player.height };
}

/**
 * Gets player speed.
 * @returns {number} Player speed.
 */
export function getPlayerSpeed() {
    return player.speed;
}

/**
 * Gets player velocity.
 * @returns {{ dx: number; dy: number }} Object with dx and dy.
 */
export function getPlayerVelocity() {
    return { dx: player.dx, dy: player.dy };
}

/**
 * Sets player movement.
 * @param {number} dx - Delta X.
 * @param {number} dy - Delta Y.
 */
export function setPlayerMovement(dx, dy) {
    player.dx = dx;
    player.dy = dy;
}

/**
 * Fires player bullets with double blaster power-up support.
 */
export function firePlayerBullets() {
    if (powerUps.doubleBlaster.active) {
        fireBullet(player.x + player.width * PLAYER_CONSTANTS.DOUBLE_BLASTER_OFFSET, player.y);
        fireBullet(player.x + player.width * (1 - PLAYER_CONSTANTS.DOUBLE_BLASTER_OFFSET), player.y);
    } else {
        fireBullet(player.x + player.width * PLAYER_CONSTANTS.SINGLE_BLASTER_OFFSET, player.y);
    }
}
