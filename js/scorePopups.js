/*
    scorePopups.js
    Created: 2025-06-01
    Author: ChatGPT + Trevor Clark

    Notes:
    Handles floating score popup animations for hits and bonuses.
    Skips popups on mobile to improve performance.
*/

import { isMobile } from './state.js';

const scorePopups = [];

export function addScorePopup(text, x, y, color = '#ffffff') {
    if (isMobile) return; // Skip on mobile for performance
    scorePopups.push({ text, x, y, opacity: 1.0, color });
}

export function updateScorePopups() {
    if (isMobile) return;
    for (let i = scorePopups.length - 1; i >= 0; i--) {
        scorePopups[i].y -= 0.5;
        scorePopups[i].opacity -= 0.02;
        if (scorePopups[i].opacity <= 0) {
            scorePopups.splice(i, 1);
        }
    }
}

export function drawScorePopups(ctx) {
    if (isMobile) return;
    scorePopups.forEach(popup => {
        ctx.globalAlpha = popup.opacity;
        ctx.fillStyle = popup.color;
        ctx.font = '16px Inter';
        ctx.fillText(popup.text, popup.x, popup.y);
        ctx.globalAlpha = 1.0;
    });
}