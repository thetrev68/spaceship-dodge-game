/*
    ui.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Handles UI overlays for start, level transition, and game over screens.
    Also adjusts overlay dimensions to match the canvas.
*/

// Cached DOM elements
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const levelUpMessage = document.getElementById('levelUpMessage');
const currentLevelInfo = document.getElementById('currentLevelInfo');
const currentScoreInfo = document.getElementById('currentScoreInfo');

export function showOverlay(state, score = 0, level = 0) {
    startOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    levelTransitionOverlay.classList.add('hidden');

    switch (state) {
        case 'START':
            startOverlay.classList.remove('hidden');
            break;
        case 'GAME_OVER':
            import('./soundManager.js').then(m => m.stopMusic());
            finalScoreDisplay.textContent = `Final Score: ${score} (Level ${level + 1})`;
            gameOverOverlay.classList.remove('hidden');
            break;
        case 'LEVEL_TRANSITION':
            levelUpMessage.textContent = `LEVEL ${level + 1} !`;
            currentLevelInfo.textContent = `Get Ready!`;
            currentScoreInfo.textContent = `Score: ${score}`;
            levelTransitionOverlay.classList.remove('hidden');
            break;
        case 'PAUSED':
            import('./soundManager.js').then(m => m.stopMusic());
            pauseOverlay.classList.remove('hidden');
            break;
        case 'PLAYING':
            import('./soundManager.js').then(m => m.startMusic());
            break;
        default:
            break;
        }
}

export function initializeCanvas(canvas) {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;
}

export function setOverlayDimensions(canvas) {
    const canvasRect = canvas.getBoundingClientRect();
    [startOverlay, gameOverOverlay, levelTransitionOverlay, pauseOverlay].forEach(overlay => {
        overlay.style.width = canvasRect.width + 'px';
        overlay.style.height = canvasRect.height + 'px';
        overlay.style.left = canvasRect.left + 'px';
        overlay.style.top = canvasRect.top + 'px';
    });
}