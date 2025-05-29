/*
    main.js
    Created: 2025-05-28
    Author: ChatGPT + [Your Name Here]

    Notes:
    Entry point for Spaceship Dodge. Sets up the game canvas, handles resize events,
    and starts the game loop.
*/

import { initializeCanvas, setOverlayDimensions } from './ui.js';
import { setupInput } from './controls.js';
import { gameLoop, startGame, continueGame, endGame } from './loop.js';

// DOM elements
const canvas = document.getElementById('gameCanvas');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const continueButton = document.getElementById('continueButton');

// Initialize canvas and overlays
function init() {
    initializeCanvas(canvas);
    setOverlayDimensions(canvas);
    setupInput();

    window.addEventListener('resize', () => {
        initializeCanvas(canvas);
        setOverlayDimensions(canvas);
    });

    startButton.addEventListener('click', () => startGame(canvas));
    restartButton.addEventListener('click', () => startGame(canvas));
    continueButton.addEventListener('click', continueGame);

    // Show start overlay on load
    window.onload = () => {
        import('./ui.js').then(module => {
            module.showOverlay('START');
        });
    };
}

init();
