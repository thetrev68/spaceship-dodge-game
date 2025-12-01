/*
    scorePopups.js
    Optimized with object pooling (2025-06-06)
*/

import { isMobile } from '@utils/platform.js';
import { ObjectPool } from '@systems/poolManager.js';

const scorePopups = [];
const scorePopupPool = new ObjectPool(() => ({}));

export function addScorePopup(text, x, y, color = '#ffffff') {
    if (isMobile) return;

    const popup = scorePopupPool.acquire();

    popup.text = text;
    popup.x = x;
    popup.y = y;
    popup.opacity = 1.0;
    popup.color = color;

    scorePopups.push(popup);
}

export function updateScorePopups() {
    if (isMobile) return;

    for (let i = scorePopups.length - 1; i >= 0; i--) {
        const popup = scorePopups[i];
        popup.y -= 0.5;
        popup.opacity -= 0.02;

        if (popup.opacity <= 0) {
            scorePopups.splice(i, 1);
            scorePopupPool.release(popup); // Recycle the object
        }
    }
}

export function drawScorePopups(ctx) {
    if (isMobile) return;

    ctx.font = '16px Inter'; // set once
    scorePopups.forEach(popup => {
        ctx.globalAlpha = popup.opacity;
        ctx.fillStyle = popup.color;
        ctx.fillText(popup.text, popup.x, popup.y);
    });
    ctx.globalAlpha = 1.0; // reset
}