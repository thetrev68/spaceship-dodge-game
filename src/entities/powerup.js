/*
    entities/powerup.js
    Updated: 2025-06-06
    Author: ChatGPT + Trevor Clark
    Refactored: Phase 4 (Entities)

    Adds object pooling to optimize power-up memory reuse.
*/

import { powerUps, player } from '@core/state';
import { isMobile } from '@utils/platform';
import { ObjectPool } from '@systems/poolManager';

// TODO: Update these imports when modules are moved in Phase 6
import { addScorePopup } from '../scorePopups.js';

const POWERUP_TYPES = {
  DOUBLE_BLASTER: 'doubleBlaster',
  SHIELD: 'shield',
};

const powerupSize = 50;
const activePowerups = []; // Renamed from 'powerups' to avoid confusion with the pool

// Initialize object pool for powerups
const powerupPool = new ObjectPool(() => ({
  x: 0, y: 0, size: powerupSize, type: null, dy: 0
}));


export function spawnPowerup(canvasWidth) {
  const x = Math.random() * (canvasWidth - powerupSize);
  const y = -powerupSize;
  const type = Math.random() < 0.5 ? POWERUP_TYPES.DOUBLE_BLASTER : POWERUP_TYPES.SHIELD;

  const p = powerupPool.acquire();
  Object.assign(p, { x, y, size: powerupSize, type, dy: 1.5 });
  activePowerups.push(p);
}

export function updatePowerups(canvasHeight) {
  for (let i = activePowerups.length - 1; i >= 0; i--) {
    const p = activePowerups[i];
    p.y += p.dy;

    if (p.y > canvasHeight) {
      const [removed] = activePowerups.splice(i, 1);
      powerupPool.release(removed);
      continue;
    }

    if (
      player.x < p.x + p.size &&
      player.x + player.width > p.x &&
      player.y < p.y + p.size &&
      player.y + player.height > p.y
    ) {
      activatePowerup(p.type);
      const [removed] = activePowerups.splice(i, 1);
      powerupPool.release(removed);
      addScorePopup(`Power-up! ${p.type}`, player.x, player.y - 20, '#00ffff');
    }
  }

  Object.keys(powerUps).forEach(key => {
    if (powerUps[key].active) {
      powerUps[key].timer--;
      if (powerUps[key].timer <= 0) {
        powerUps[key].active = false;
      }
    }
  });
}

export function drawPowerups(ctx) {
  const now = performance.now();
  const time = now / 600;
  const pulse = isMobile ? 0.85 : (Math.sin(time) + 1) / 2;
  const scale = 0.75 + 0.5 * pulse;

  activePowerups.forEach(p => {
    const cx = p.x + powerupSize / 2;
    const cy = p.y + powerupSize / 2;
    const maxRadius = powerupSize / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    if (p.type === POWERUP_TYPES.DOUBLE_BLASTER) {
      const spikes = 5;
      const outerRadius = maxRadius * 0.8;
      const innerRadius = outerRadius / 2.5;

      if (!isMobile) {
        ctx.shadowColor = '#f9d71c';
        ctx.shadowBlur = 15 * pulse;
      }

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
    } else if (p.type === POWERUP_TYPES.SHIELD) {
      const radius = maxRadius * (0.75 + 0.25 * pulse);

      if (!isMobile) {
        const gradient = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${0.8 * pulse})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function activatePowerup(type) {
  powerUps[type].active = true;
  powerUps[type].timer = 600;
}
