/*
    player.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Handles player update and draw functions.
*/

import { player, gameState } from './state.js';

export function updatePlayer() {
    if (gameState.value !== 'PLAYING') return;

    player.x += player.dx;
    player.y += player.dy;

    // Keep player within defined screen bounds (0.9 width, 0.8 height)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > innerWidth * 0.9) player.x = innerWidth * 0.9 - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > innerHeight * 0.8) player.y = innerHeight * 0.8 - player.height;
}

export function drawPlayer(ctx) {
    if (gameState.value !== 'PLAYING') return;

    // Set drawing style for the spaceship
    ctx.strokeStyle = '#00ffff'; // Cyan outline
    ctx.lineWidth = 2;           // Line thickness

    // Get player dimensions and position for drawing calculations
    const w = player.width;
    const h = player.height;
    const x = player.x;
    const y = player.y;
    const cx = x + w / 2; // Center X coordinate of the player

    // --- Main Ship Body (Triangle with a concave/notched rear) ---
    ctx.beginPath();
    ctx.moveTo(cx, y); // Top tip of the spaceship (nose)

    // Left "wing" point
    ctx.lineTo(x, y + h * 0.8);

    // Inner left point of the concave rear (where the engine will sit)
    ctx.lineTo(cx - w * 0.15, y + h * 0.75);

    // Inner right point of the concave rear
    ctx.lineTo(cx + w * 0.15, y + h * 0.75);

    // Right "wing" point
    ctx.lineTo(x + w, y + h * 0.8);

    ctx.closePath(); // Connects the last point back to the first
    ctx.stroke();    // Draws the outline of the main body

    // --- Engine Block (Narrower and Longer Trapezoidal shape) ---
    const engineTopWidth = w * 0.3;   // Engine top width, slightly wider than the inner concave points for a snug fit
    const engineBottomWidth = w * 0.1; // Engine bottom width, making it narrower at the base
    const engineHeight = h * 0.3;     // Engine height, making it longer

    // Engine starts vertically at the concave point of the main body
    const engineY = y + h * 0.75;
    const engineBottomY = engineY + engineHeight;

    // Calculate engine corner coordinates
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

    // --- Exhaust Detail Lines (inside the engine block) ---
    ctx.beginPath();
    // Center exhaust line
    ctx.moveTo(cx, engineY + engineHeight * 0.2); // Start 20% down from engine top
    ctx.lineTo(cx, engineY + engineHeight * 0.8); // End 80% down from engine top

    // Left exhaust line, slightly offset from center
    ctx.moveTo(cx - engineBottomWidth * 0.8, engineY + engineHeight * 0.3); // Start 30% down, relative to bottom width
    ctx.lineTo(cx - engineBottomWidth * 0.8, engineY + engineHeight * 0.7); // End 70% down

    // Right exhaust line, symmetrical to the left
    ctx.moveTo(cx + engineBottomWidth * 0.8, engineY + engineHeight * 0.3); // Start 30% down
    ctx.lineTo(cx + engineBottomWidth * 0.8, engineY + engineHeight * 0.7); // End 70% down
    ctx.stroke(); // Draws all the exhaust lines
}