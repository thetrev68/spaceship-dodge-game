/*
    scoreDisplay.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Added display of player lives.
*/

import { score, gameLevel, playerLives } from '@core/state';

export function drawScore(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score.value}`, 20, 40);
    ctx.fillText(`Level: ${gameLevel.value + 1}`, 20, 70);
    ctx.fillText(`Lives: ${playerLives.value}`, 20, 100);
}
