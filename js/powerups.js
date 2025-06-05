/*
    powerups.js
    Created: 2025-06-05
    Author: ChatGPT + Trevor Clark

    Notes:
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

// Spawn a powerup at random position (avoid UI area)
export function spawnPowerup() {
  const x = Math.random() * (window.innerWidth - powerupSize);
  const y = -powerupSize; // spawn just above screen

  const type = Math.random() < 0.5 ? POWERUP_TYPES.DOUBLE_BLASTER : POWERUP_TYPES.SHIELD;

  powerups.push({
    x,
    y,
    size: powerupSize,
    type,
    dy: 1.5, // falling speed
  });
}

// Call this in your game loop update to move powerups down and handle collision
export function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.dy;

    // Remove if off screen
    if (p.y > window.innerHeight) {
      powerups.splice(i, 1);
      continue;
    }

    // Check collision with player (simple AABB)
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

  // Update timers, deactivate expired powerups
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
  powerups.forEach(p => {
    ctx.fillStyle = p.type === POWERUP_TYPES.DOUBLE_BLASTER ? '#0ff' : '#f90';
    ctx.beginPath();
    ctx.rect(p.x, p.y, p.size, p.size);
    ctx.fill();
  });
}

function activatePowerup(type) {
  powerUps[type].active = true;
  powerUps[type].timer = 600; // lasts for 10 seconds at 60fps
}