/**
 * @fileoverview Power-up entity management with object pooling.
 * Adds object pooling to optimize power-up memory reuse.
 */

import type { PowerUpKey } from '@types';
import { powerUps, player } from '@core/state.js';
import { isMobile } from '@utils/platform.js';
import { ObjectPool } from '@systems/poolManager.js';
import { addScorePopup } from '@ui/hud/scorePopups.js';
import { POWERUP_CONFIG, GAME_CONFIG } from '@core/constants.js';

type ActivePowerup = { x: number; y: number; size: number; type: PowerUpKey | null; dy: number };

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
const activePowerups: ActivePowerup[] = []; // Renamed from 'powerups' to avoid confusion with the pool

// Initialize object pool for powerups
const powerupPool = new ObjectPool<ActivePowerup>(() => ({
  x: 0,
  y: 0,
  size: powerupSize,
  type: null,
  dy: 0,
}));


/**
 * Spawns a random power-up.
 */
export function spawnPowerup(canvasWidth: number): void {
  const x = Math.random() * (canvasWidth - powerupSize);
  const y = -powerupSize;
  const type: PowerUpKey = Math.random() < 0.5 ? POWERUP_TYPES.DOUBLE_BLASTER : POWERUP_TYPES.SHIELD;

  const p = powerupPool.acquire();
  Object.assign(p, { x, y, size: powerupSize, type, dy: 1.5 });
  activePowerups.push(p);
}

/**
 * Updates all power-ups, checks collisions, and manages timers.
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
        addScorePopup(`Power-up! ${p.type}`, player.x, player.y - 20, '#00ffff');
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
      }
    }
  });
}

/**
 * Draws all power-ups on the canvas.
 */
export function drawPowerups(ctx: CanvasRenderingContext2D): void {
  const now = performance.now();
  const time = now / 600;
  const pulse = isMobile() ? 1 : (Math.sin(time) + 1) / 2;
  const scale = isMobile() ? 1 : 0.75 + 0.5 * pulse;

  activePowerups.forEach(p => {
    const cx = p.x + powerupSize / 2;
    const cy = p.y + powerupSize / 2;
    const maxRadius = powerupSize / 2;

    ctx.save();
    if (!isMobile()) {
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
    }

    if (p.type === POWERUP_TYPES.DOUBLE_BLASTER) {
      if (isMobile()) {
        ctx.fillStyle = '#f9d71c';
        ctx.beginPath();
        ctx.rect(p.x + maxRadius * 0.4, p.y + maxRadius * 0.2, maxRadius * 1.2, maxRadius * 1.2);
        ctx.fill();
      } else {
        const spikes = 5;
        const outerRadius = maxRadius * 0.8;
        const innerRadius = outerRadius / 2.5;

        ctx.shadowColor = '#f9d71c';
        ctx.shadowBlur = 15 * pulse;

        ctx.fillStyle = '#f9d71c';
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const rot = Math.PI / 2 * 3 + (i * Math.PI * 2) / spikes;
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
        ctx.fillStyle = '#0ff';
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

        ctx.fillStyle = '#0ff';
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
