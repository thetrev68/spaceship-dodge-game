/*
    ui.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark
    Updates: 
        2025-06-02: Set fixed canvas.width = 800, canvas.height = 600. Removed duplicate startButton listener. Removed debug touchstart listeners.
        2025-06-04: Updated showOverlay to toggle hidden/flex classes cleanly.
    Notes:
    Handles UI overlays for start, level transition, and game over screens.
    Also adjusts overlay dimensions to match the canvas.
*/

import { gameState } from './state.js';

const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const levelUpMessage = document.getElementById('levelUpMessage');
const currentLevelInfo = document.getElementById('currentLevelInfo');
const currentScoreInfo = document.getElementById('currentScoreInfo');

export function showOverlay(state, score = 0, level = 0) {
    const overlays = [startOverlay, pauseOverlay, gameOverOverlay, levelTransitionOverlay];

    // Hide all overlays
    overlays.forEach(overlay => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    });

    // Show the overlay for current state
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
}

export function initializeCanvas(canvas) {
  const maxWidth = window.innerWidth * 0.9;  // 90% viewport width
  const maxHeight = window.innerHeight * 0.9; // 90% viewport height

  let width = maxWidth;
  let height = (width * 3) / 4;

  if (height > maxHeight) {
    height = maxHeight;
    width = (height * 4) / 3;
  }

  canvas.width = width;
  canvas.height = height;
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