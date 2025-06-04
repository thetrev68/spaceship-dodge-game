/*
    scoreDisplay.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Renders the player's score and level on the canvas.
*/

import { score, gameLevel, playerLives } from './state.js';

export function drawScore(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score.value}`, 20, 40);
    ctx.fillText(`Level: ${gameLevel.value + 1}`, 20, 70);
    ctx.fillText(`Lives: ${playerLives.value}`, 20, 100);  // Added lives display
}