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
    console.log(`Showing overlay for: ${state}, current gameState: ${gameState.value}`);
    startOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    levelTransitionOverlay.classList.add('hidden');

    switch (state) {
        case 'START':
            startOverlay.classList.remove('hidden');
            startOverlay.style.display = 'block';
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
            startOverlay.style.display = 'none';
            console.log('Force hiding start overlay, new gameState: ${gameState.value}');
            import('./soundManager.js').then(m => m.startMusic());
            break;
        default:
            break;
    }
}

export function initializeCanvas(canvas) {
    canvas.addEventListener('touchstart', (e) => {
        if (gameState.value !== 'PLAYING') return; // Only handle canvas touches during PLAYING
        canvas.style.backgroundColor = 'red';
        setTimeout(() => canvas.style.backgroundColor = '', 300);
    }, { passive: false });
    document.body.addEventListener('touchstart', (e) => {
        if (e.target.closest('#startOverlay')) return; // Skip startOverlay touches
        canvas.style.backgroundColor = 'blue';
        setTimeout(() => canvas.style.backgroundColor = '', 300);
    });

    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;
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

// Initialize start button (add this to your main script or ui.js)
import { gameState } from './state.js';
const startButton = document.getElementById('startButton');
if (startButton) {
    startButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('Touchstart on start button, coords:', e.touches[0].clientX, e.touches[0].clientY);
        gameState.value = 'PLAYING';
        showOverlay('PLAYING');
    }, { passive: false });
    startButton.addEventListener('click', () => {
        console.log('Start button clicked, gameState:', gameState.value);
        gameState.value = 'PLAYING';
        showOverlay('PLAYING');
    });
}