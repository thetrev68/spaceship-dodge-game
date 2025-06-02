/*
    player.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark
    Updates:
        2025-06-02: Replaced innerWidth * 0.9 with canvas.width for bounds. Added console.log in drawPlayer.

    Notes:
    Handles player update and draw functions.
*/

import { player, gameState } from './state.js';

export function updatePlayer() {
    if (gameState.value !== 'PLAYING') return;

    player.x += player.dx;
    player.y += player.dy;

    // Keep player within canvas bounds
    const canvas = document.getElementById('gameCanvas');
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
}

export function drawPlayer(ctx) {
    if (gameState.value !== 'PLAYING') return;

    console.log('Drawing player at:', player.x, player.y);

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;

    const w = player.width;
    const h = player.height;
    const x = player.x;
    const y = player.y;
    const cx = x + w / 2;

    // Main Ship Body
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(x, y + h * 0.8);
    ctx.lineTo(cx - w * 0.15, y + h * 0.75);
    ctx.lineTo(cx + w * 0.15, y + h * 0.75);
    ctx.lineTo(x + w, y + h * 0.8);
    ctx.closePath();
    ctx.stroke();

    // Engine Block
    const engineTopWidth = w * 0.3;
    const engineBottomWidth = w * 0.1;
    const engineHeight = h * 0.3;
    const engineY = y + h * 0.75;
    const engineBottomY = engineY + engineHeight;
    const engineTopLeftX = cx - engineTopWidth / 2;
    const engineTopRightX = cx + engineTopWidth / 2;
    const engineBottomLeftX = cx - engineBottomWidth / 2;
    const engineBottomRightX = cx + engineBottomWidth / 2;

    ctx.beginPath();
    ctx.moveTo(engineTopLeftX, engineY);
    ctx.lineTo(engineTopRightX, engineY);
    ctx.lineTo(engineBottomRightX, engineBottomY);
    ctx.lineTo(engineBottomLeftX, engineBottomY);
    ctx.closePath();
    ctx.stroke();

    // Exhaust Detail Lines
    ctx.beginPath();
    ctx.moveTo(cx, engineY + engineHeight * 0.2);
    ctx.lineTo(cx, engineY + engineHeight * 0.8);
    ctx.moveTo(cx - engineBottomWidth * 0.8, engineY + engineHeight * 0.3);
    ctx.lineTo(cx - engineBottomWidth * 0.8, engineY + engineHeight * 0.7);
    ctx.moveTo(cx + engineBottomWidth * 0.8, engineY + engineHeight * 0.3);
    ctx.lineTo(cx + engineBottomWidth * 0.8, engineY + engineHeight * 0.7);
    ctx.stroke();
}