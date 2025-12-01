/**
 * @fileoverview Score popup display with object pooling.
 * Optimized with object pooling (2025-06-06)
 */

import { isMobile } from '@utils/platform.js';
import { ObjectPool } from '@systems/poolManager.js';

/**
 * Array of active score popups.
 * @type {Array}
 */
const scorePopups = [];

/**
 * Object pool for score popups.
 * @type {ObjectPool}
 */
const scorePopupPool = new ObjectPool(() => ({}));

/**
 * Adds a score popup to the display.
 * @param {string} text - Text to display.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {string} [color='#ffffff'] - Text color.
 */
export function addScorePopup(text, x, y, color = '#ffffff') {
    if (isMobile()) return;

    const popup = scorePopupPool.acquire();

    popup.text = text;
    popup.x = x;
    popup.y = y;
    popup.opacity = 1.0;
    popup.color = color;

    scorePopups.push(popup);
}

/**
 * Updates score popups, fading them out.
 */
export function updateScorePopups() {
    if (isMobile()) return;

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

/**
 * Draws score popups on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 */
export function drawScorePopups(ctx) {
    if (isMobile()) return;

    ctx.font = '16px Inter'; // set once
    scorePopups.forEach(popup => {
        ctx.globalAlpha = popup.opacity;
        ctx.fillStyle = popup.color;
        ctx.fillText(popup.text, popup.x, popup.y);
    });
    ctx.globalAlpha = 1.0; // reset
}