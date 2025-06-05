/*
    powerups.js
    Created: 2025-06-05
    Author: ChatGPT + Trevor Clark

    Handles power-up spawning, activation, timers, and collision.
*/

import { powerUps, player } from './state.js';
import { addScorePopup } from './loop.js';

// Power-up types
export const POWERUP_TYPES = {
  DOUBLE_BLASTER: 'doubleBlaster',
  SHIELD: 'shield',
};

const powerupSize = 20;
const powerups = []; // active power-ups on screen

// Spawn a powerup at random horizontal position, above the screen
export function spawnPowerup(canvasWidth) {
  const x = Math.random() * (canvasWidth - powerupSize);
  const y = -powerupSize; // spawn just above screen

  // 50/50 chance for either powerup type
  const type = Math.random() < 0.5 ? POWERUP_TYPES.DOUBLE_BLASTER : POWERUP_TYPES.SHIELD;

  powerups.push({
    x,
    y,
    size: powerupSize,
    type,
    dy: 1.5, // falling speed
  });
}

// Update powerups positions, handle collision and timers
export function updatePowerups(canvasHeight) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.dy;

    // Remove if off screen
    if (p.y > canvasHeight) {
      powerups.splice(i, 1);
      continue;
    }

    // Simple AABB collision with player
    if (
      player.x < p.x + p.size &&
      player.x + player.width > p.x &&
      player.y < p.y + p.size &&
      player.y + player.height > p.y
    ) {
      activatePowerup(p.type);
      powerups.splice(i, 1);
      addScorePopup(`Power-up! ${p.type}`, player.x, player.y - 20, '#00ffff');
    }
  }

  // Update timers, deactivate expired powerups in global state
  Object.keys(powerUps).forEach(key => {
    if (powerUps[key].active) {
      powerUps[key].timer--;
      if (powerUps[key].timer <= 0) {
        powerUps[key].active = false;
      }
    }
  });
}

// Draw powerups on canvas with star for double-blaster and glowing circle for shield
export function drawPowerups(ctx) {
  powerups.forEach(p => {
    const cx = p.x + p.size / 2;
    const cy = p.y + p.size / 2;
    const maxRadius = p.size / 2;
    const time = performance.now() / 500;
    const pulse = (Math.sin(time) + 1) / 2;

    if (p.type === POWERUP_TYPES.DOUBLE_BLASTER) {
      // Draw glowing star
      const spikes = 5;
      const outerRadius = maxRadius * 0.8;
      const innerRadius = outerRadius / 2.5;

      ctx.save();
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 15 * pulse;
      ctx.fillStyle = '#0ff';

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
      ctx.restore();
    } else if (p.type === POWERUP_TYPES.SHIELD) {
      // Draw glowing pulsing circle
      const radius = maxRadius * (0.75 + 0.25 * pulse);
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);

      gradient.addColorStop(0, `rgba(255, 165, 0, ${0.8 * pulse})`);
      gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f90';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Activate powerup effect on player state
export function activatePowerup(type) {
  powerUps[type].active = true;
  powerUps[type].timer = 600; // lasts for 10 seconds at 60fps
}