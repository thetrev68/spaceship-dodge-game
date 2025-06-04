import { player, gameState } from './state.js';

const canvas = document.getElementById('gameCanvas');
const BOUNDARY_MARGIN = 2;

export function updatePlayer() {
    if (gameState.value !== 'PLAYING') return;

    player.x += player.dx;
    player.y += player.dy;

    // Keep player within canvas bounds with margin
    player.x = Math.max(BOUNDARY_MARGIN, Math.min(player.x, canvas.width - player.width - BOUNDARY_MARGIN));
    player.y = Math.max(BOUNDARY_MARGIN, Math.min(player.y, canvas.height - player.height - BOUNDARY_MARGIN));
}

export function drawPlayer(ctx) {
    if (gameState.value !== 'PLAYING') return;

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;

    const w = player.width;
    const h = player.height;
    const x = player.x;
    const y = player.y;
    const cx = x + w / 2;
    const narrowFactor = 0.3; // Adjust to narrow the ship

    // Main Ship Body
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(x + w * 0.2, y + h * 0.8);
    ctx.lineTo(cx - w * narrowFactor, y + h * 0.75);
    ctx.lineTo(cx + w * narrowFactor, y + h * 0.75);
    ctx.lineTo(x + w * 0.8, y + h * 0.8);
    ctx.closePath();
    ctx.stroke();

    // Engine Block
    const engineTopWidth = w * 0.2;
    const engineBottomWidth = w * 0.07;
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

    // Pulsing thruster flame
    const time = performance.now() / 500; // pulse speed
    const pulse = (Math.sin(time) + 1) / 2; // 0 to 1

    const flameX = cx;
    const flameY = engineBottomY + 5;
    const flameRadius = engineBottomWidth;

    // Create gradient for flame glow
    const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameRadius * 3);
    gradient.addColorStop(0, `rgba(0, 255, 255, ${0.6 * pulse})`);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(flameX, flameY + flameRadius, flameRadius * 1.5, flameRadius * 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Core flame shape
    ctx.fillStyle = `rgba(0, 255, 255, ${0.7 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(flameX - flameRadius * 0.6, engineBottomY);
    ctx.lineTo(flameX + flameRadius * 0.6, engineBottomY);
    ctx.lineTo(flameX, engineBottomY + flameRadius * 3);
    ctx.closePath();
    ctx.fill();
}