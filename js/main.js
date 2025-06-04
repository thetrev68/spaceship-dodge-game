/*
    main.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Removed early call to setupInput() since it's handled in loop.js.
        2025-06-01: Added touchstart listeners for buttons to support iOS.

    Notes:
    Entry point for Spaceship Dodge. Sets up the game canvas, handles resize events,
    and starts the game loop.
*/

import { initializeCanvas, setOverlayDimensions, showOverlay, quitGame } from './ui.js';
import { startGame, continueGame } from './loop.js';
import { gameState } from './state.js';

const canvas = document.getElementById('gameCanvas');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const continueButton = document.getElementById('continueButton');
const quitButton = document.getElementById('quitButton');

function init() {
    initializeCanvas(canvas);
    setOverlayDimensions(canvas);

    window.addEventListener('resize', () => {
        initializeCanvas(canvas);
        setOverlayDimensions(canvas);
    });

    let isStarting = false; // Prevent double-tap
    startButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.value !== 'START' || isStarting) return;
        isStarting = true;
        import('./soundManager.js').then(m => m.unlockAudio());
        startGame(canvas);
        setTimeout(() => isStarting = false, 1000);
    }, { passive: false });
    startButton.addEventListener('click', () => {
        if (gameState.value !== 'START' || isStarting) return;
        isStarting = true;
        import('./soundManager.js').then(m => m.unlockAudio());
        startGame(canvas);
        setTimeout(() => isStarting = false, 1000);
    });

    restartButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame(canvas);
    }, { passive: false });
    restartButton.addEventListener('click', () => startGame(canvas));

    continueButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        continueGame(canvas);
    }, { passive: false });
    continueButton.addEventListener('click', () => continueGame(canvas));

    if (quitButton) {
        quitButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            quitGame();
        }, { passive: false });
        quitButton.addEventListener('click', () => quitGame());
    }

    window.onload = () => {
        showOverlay('START');
    };
}

init();