/**
 * @module entities/powerup
 * Power-up entity management with object pooling.
 * Adds object pooling to optimize power-up memory reuse.
 */

import type { PowerUpKey } from '@types';
import { playerState } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { ObjectPool } from '@systems/poolManager.js';
import { POWERUP_CONFIG, GAME_CONFIG } from '@core/constants.js';
import { eventBus } from '@core/events/EventBus.js';
import {
  GameEvent,
  type PowerupCollectedEvent,
  type PowerupExpiredEvent,
} from '@core/events/GameEvents.js';
import { getCurrentTheme } from '@core/themes';

/**
 * @internal
 */
type ActivePowerup = {
  x: number;
  y: number;
  size: number;
  type: PowerUpKey | null;
  dy: number;
};

/**
 * Power-up types enumeration.
 * @enum {string}
 */
const POWERUP_TYPES = {
  DOUBLE_BLASTER: 'doubleBlaster',
  SHIELD: 'shield',
} as const;

const powerupSize = isMobile() ? 40 : 50;

/**
 * Array of active power-ups.
 * @type {ActivePowerup[]}
 */
export const activePowerups: ActivePowerup[] = []; // Renamed from 'powerups' to avoid confusion with the pool
const powerUps = playerState.powerUps;
const player = playerState.player;

// Initialize object pool for powerups
const powerupPool = new ObjectPool<ActivePowerup>(() => ({
  x: 0,
  y: 0,
  size: powerupSize,
  type: null,
  dy: 0,
}));

/**
 * Spawns a random powerup at the top of the screen with downward movement.
 *
 * ## Powerup Types
 * - **Shield** (50% chance): 5-second invulnerability
 * - **Double Blaster** (50% chance): 10-second dual-bullet firing
 *
 * ## Spawn Behavior
 * - Position: Random X coordinate at top edge (Y = -size)
 * - Movement: Falls downward at 1.5 pixels/frame
 * - Lifespan: Despawns if reaches bottom without being collected
 *
 * ## Object Pooling
 * Uses `powerupPool` to reuse powerup objects for performance.
 *
 * @param canvasWidth - Canvas width for random X positioning
 *
 * @example
 * ```typescript
 * // Spawn powerup periodically
 * if (Math.random() < 0.1 && gameState.value === 'PLAYING') {
 *   spawnPowerup(canvas.width);
 * }
 *
 * // Spawn powerup on level up
 * eventBus.on(GameEvent.LEVEL_UP, () => {
 *   spawnPowerup(canvas.width);
 * });
 * ```
 *
 * @see POWERUP_CONFIG - Powerup duration and behavior configuration
 * @see activatePowerup - Powerup activation logic
 */
export function spawnPowerup(canvasWidth: number): void {
  const x = Math.random() * (canvasWidth - powerupSize);
  const y = -powerupSize;
  const type: PowerUpKey =
    Math.random() < 0.5 ? POWERUP_TYPES.DOUBLE_BLASTER : POWERUP_TYPES.SHIELD;

  const p = powerupPool.acquire();
  Object.assign(p, { x, y, size: powerupSize, type, dy: 1.5 });
  activePowerups.push(p);
}

/**
 * Updates all powerup positions, handles player collisions, and manages active powerup timers.
 * Called every frame during PLAYING game state.
 *
 * ## Update Logic
 * 1. **Move powerups**: Apply downward velocity (1.5 pixels/frame)
 * 2. **Remove off-screen**: Despawn if Y > canvas height
 * 3. **Collision detection**: AABB (axis-aligned bounding box) vs player
 * 4. **Activation**: On collision, activate powerup effect and emit event
 * 5. **Timer management**: Decrement active powerup timers, expire when <= 0
 *
 * ## Collision Detection
 * Uses AABB (rectangle intersection):
 * ```typescript
 * player.x < powerup.x + powerup.size &&
 * player.x + player.width > powerup.x &&
 * player.y < powerup.y + powerup.size &&
 * player.y + player.height > powerup.y
 * ```
 *
 * ## Performance
 * - Iterates backwards for safe removal during iteration
 * - Swap-and-pop for O(1) removal
 * - Returns powerups to pool after removal
 *
 * ## Event Emission
 * - `GameEvent.POWERUP_COLLECTED` - On player pickup
 * - `GameEvent.POWERUP_EXPIRED` - When timer reaches 0
 *
 * @param canvasHeight - Canvas height for off-screen detection
 *
 * @example
 * ```typescript
 * // In game loop
 * function gameLoop() {
 *   if (gameState.value === 'PLAYING') {
 *     updatePlayer();
 *     updateBullets();
 *     updateObstacles();
 *     updatePowerups(canvas.height); // Update and handle collisions
 *     checkCollisions();
 *     renderAll();
 *   }
 *   requestAnimationFrame(gameLoop);
 * }
 * ```
 *
 * @remarks
 * This function emits the following events:
 * - `GameEvent.POWERUP_COLLECTED` - When player collects powerup
 * - `GameEvent.POWERUP_EXPIRED` - When powerup duration expires
 */
export function updatePowerups(canvasHeight: number): void {
  for (let i = activePowerups.length - 1; i >= 0; i--) {
    const p = activePowerups[i];
    if (!p) continue;
    p.y += p.dy;

    let remove = false;
    let collided = false;

    if (p.y > canvasHeight) {
      remove = true;
    } else if (
      player.x < p.x + p.size &&
      player.x + player.width > p.x &&
      player.y < p.y + p.size &&
      player.y + player.height > p.y
    ) {
      collided = true;
      remove = true;
    }

    if (remove) {
      // Swap and pop
      const last = activePowerups.pop();
      if (last && last !== p) {
        activePowerups[i] = last;
        i++; // stay on swapped element after loop decrement
      }
      powerupPool.release(p);

      if (collided && p.type) {
        activatePowerup(p.type);
        eventBus.emit<PowerupCollectedEvent>(GameEvent.POWERUP_COLLECTED, {
          type: p.type,
          duration: POWERUP_CONFIG[p.type]?.DURATION ?? 0,
          position: { x: player.x, y: player.y - 20 },
        });
      }
    }
  }

  Object.keys(powerUps).forEach((key) => {
    const typedKey = key as PowerUpKey;
    const state = powerUps[typedKey];
    if (state.active) {
      state.timer--;
      if (state.timer <= 0) {
        state.active = false;
        eventBus.emit<PowerupExpiredEvent>(GameEvent.POWERUP_EXPIRED, { type: typedKey });
      }
    }
  });
}

/**
 * Renders all active powerups to the canvas with animated visual effects.
 *
 * ## Powerup Visuals
 * **Shield (Cyan):**
 * - Desktop: Pulsing gradient glow with radial fill
 * - Mobile: Simple solid circle (performance)
 *
 * **Double Blaster (Orange):**
 * - Desktop: 5-pointed star with shadow glow
 * - Mobile: Simple square (performance)
 *
 * ## Animation
 * - Desktop: Pulsing scale effect (0.75-1.25x) and shadow blur
 * - Mobile: No animation (saves GPU processing)
 * - Pulse rate: ~600ms per cycle (independent of frame rate)
 *
 * ## Mobile Optimizations
 * - No shadow blur (expensive GPU operation)
 * - No scale transforms (requires matrix operations)
 * - Simplified shapes (rectangle/circle instead of star/gradient)
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
 *   drawPlayer(ctx);
 *   drawBullets(ctx);
 *   drawPowerups(ctx); // Render with animated effects
 *   drawHUD(ctx);
 * }
 * ```
 */
export function drawPowerups(ctx: CanvasRenderingContext2D): void {
  const now = performance.now();
  const time = now / 600;
  const pulse = isMobile() ? 1 : (Math.sin(time) + 1) / 2;
  const scale = isMobile() ? 1 : 0.75 + 0.5 * pulse;

  activePowerups.forEach((p) => {
    const cx = p.x + powerupSize / 2;
    const cy = p.y + powerupSize / 2;
    const maxRadius = powerupSize / 2;
    const theme = getCurrentTheme();

    ctx.save();
    if (!isMobile()) {
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
    }

    if (p.type === POWERUP_TYPES.DOUBLE_BLASTER) {
      if (isMobile()) {
        ctx.fillStyle = theme.colors.powerupBlaster;
        ctx.beginPath();
        ctx.rect(p.x + maxRadius * 0.4, p.y + maxRadius * 0.2, maxRadius * 1.2, maxRadius * 1.2);
        ctx.fill();
      } else {
        const spikes = 5;
        const outerRadius = maxRadius * 0.8;
        const innerRadius = outerRadius / 2.5;

        ctx.shadowColor = theme.colors.powerupBlaster;
        ctx.shadowBlur = 15 * pulse;

        ctx.fillStyle = theme.colors.powerupBlaster;
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const rot = (Math.PI / 2) * 3 + (i * Math.PI * 2) / spikes;
          const xOuter = cx + Math.cos(rot) * outerRadius;
          const yOuter = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(xOuter, yOuter);
          const rotInner = rot + Math.PI / spikes;
          const xInner = cx + Math.cos(rotInner) * innerRadius;
          const yInner = cy + Math.sin(rotInner) * innerRadius;
          ctx.lineTo(xInner, yInner);
        }
        ctx.closePath();
        ctx.fill();
      }
    } else if (p.type === POWERUP_TYPES.SHIELD) {
      if (isMobile()) {
        ctx.fillStyle = theme.colors.powerupShield;
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const radius = maxRadius * (0.75 + 0.25 * pulse);
        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${0.8 * pulse})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = theme.colors.powerupShield;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  });
}

/**
 */
function activatePowerup(type: PowerUpKey): void {
  const config = POWERUP_CONFIG[type];
  if (!config) {
    console.warn(`Unknown powerup type: ${type}`);
    return;
  }

  powerUps[type].active = true;
  powerUps[type].timer = Math.round(config.DURATION / GAME_CONFIG.FRAME_DURATION);
}
