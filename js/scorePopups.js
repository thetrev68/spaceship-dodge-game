/*
    scorePopups.js
    Created: 2025-06-01
    Author: ChatGPT + Trevor Clark

    Notes:
    Handles floating score popup animations for hits and bonuses.
*/

import { isMobile } from './state.js';

const scorePopups = [];

export function addScorePopup(text, x, y, color = '#ffffff') {
  if (isMobile) return; // Skip on mobile
  scorePopups.push({ text, x, y, opacity: 1.0, color });
}

export function updateScorePopups() {
  if (isMobile) return; // Skip on mobile
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    scorePopups[i].y -= 0.5;
    scorePopups[i].opacity -= 0.02;
    if (scorePopups[i].opacity <= 0) {
      scorePopups.splice(i, 1);
    }
  }
}

export function drawScorePopups(ctx) {
  if (isMobile) return; // Skip on mobile
  scorePopups.forEach(popup => {
    ctx.globalAlpha = popup.opacity;
    ctx.fillStyle = popup.color;
    ctx.font = '16px Inter';
    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.globalAlpha = 1.0;
  });
}