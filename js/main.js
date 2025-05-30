/*
    main.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Entry point for Spaceship Dodge. Sets up the game canvas, handles resize events,
    and starts the game loop.
*/

import { initializeCanvas, setOverlayDimensions } from './ui.js';
import { setupInput } from './controls.js';
import { startGame, continueGame } from './loop.js';

const canvas = document.getElementById('gameCanvas');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const continueButton = document.getElementById('continueButton');
const quitButton = document.getElementById('quitButton');

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
    continueButton.addEventListener('click', () => continueGame(canvas));

    if (quitButton) {
        quitButton.addEventListener('click', () => import('./ui.js').then(m => m.quitGame()));
    }

    window.onload = () => {
        import('./ui.js').then(module => {
            module.showOverlay('START');
        });
    };
}

init();