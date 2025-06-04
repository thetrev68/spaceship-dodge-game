/*
    ui.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Added dispatch of 'gameStateChange' event for mobile pause button.
        Displays player lives in start, pause, and level transition overlays.
*/

import { gameState, playerLives } from './state.js';

const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const levelUpMessage = document.getElementById('levelUpMessage');
const currentLevelInfo = document.getElementById('currentLevelInfo');
const currentScoreInfo = document.getElementById('currentScoreInfo');

const livesInfoStart = document.getElementById('livesInfoStart');
const livesInfoLevel = document.getElementById('livesInfoLevel');
const livesInfoPause = document.getElementById('livesInfoPause');

export function showOverlay(state, score = 0, level = 0) {
    const overlays = [startOverlay, pauseOverlay, gameOverOverlay, levelTransitionOverlay];

    overlays.forEach(overlay => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    });

    // Update lives display
    if (livesInfoStart) livesInfoStart.textContent = `Lives: ${playerLives.value}`;
    if (livesInfoLevel) livesInfoLevel.textContent = `Lives: ${playerLives.value}`;
    if (livesInfoPause) livesInfoPause.textContent = `Lives: ${playerLives.value}`;

    switch (state) {
        case 'START':
            startOverlay.classList.remove('hidden');
            startOverlay.classList.add('flex');
            break;
        case 'GAME_OVER':
            import('./soundManager.js').then(m => m.stopMusic());
            finalScoreDisplay.textContent = `Final Score: ${score} (Level ${level + 1})`;
            gameOverOverlay.classList.remove('hidden');
            gameOverOverlay.classList.add('flex');
            break;
        case 'LEVEL_TRANSITION':
            import('./soundManager.js').then(m => m.stopMusic());
            levelUpMessage.textContent = `LEVEL ${level + 1} !`;
            currentLevelInfo.textContent = `Get Ready!`;
            currentScoreInfo.textContent = `Score: ${score}`;
            levelTransitionOverlay.classList.remove('hidden');
            levelTransitionOverlay.classList.add('flex');
            break;
        case 'PAUSED':
            import('./soundManager.js').then(m => m.stopMusic());
            pauseOverlay.classList.remove('hidden');
            pauseOverlay.classList.add('flex');
            break;
        case 'PLAYING':
            startOverlay.style.display = 'none';
            import('./soundManager.js').then(m => m.startMusic());
            break;
        default:
            break;
    }

    // Notify listeners (e.g. mobile pause button) to update visibility
    document.dispatchEvent(new Event('gameStateChange'));
}

export function initializeCanvas(canvas) {
    // Keep your existing canvas sizing logic here or update as needed
    canvas.width = 800;
    canvas.height = 600;
}

export function quitGame() {
    const confirmed = confirm('Are you sure you want to quit the game?');
    if (!confirmed) return;

    import('./soundManager.js').then(m => m.stopMusic());
    import('./state.js').then(state => {
        state.gameState.value = 'START';
        state.score.value = 0;
        state.gameLevel.value = 0;
        state.bullets.length = 0;
        state.obstacles.length = 0;
    });
    showOverlay('START');
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