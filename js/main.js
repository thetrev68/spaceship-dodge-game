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

import { initializeCanvas, setOverlayDimensions } from './ui.js';
import { startGame, continueGame } from './loop.js';

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

    startButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.value !== 'START') return; // Ignore if not in START state
        console.log('Touchstart on start button, coords:', e.touches[0].clientX, e.touches[0].clientY);
        startButton.disabled = true; // Disable button
        import('./soundManager.js').then(m => m.unlockAudio()); // Unlock audio
        startGame(canvas);
        setTimeout(() => startButton.disabled = false, 1000); // Re-enable after 1s
}, { passive: false });
    startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        startGame(canvas);
    });

    restartButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('Touchstart on restart button');
        startGame(canvas);
    }, { passive: false });
    restartButton.addEventListener('click', () => startGame(canvas));

    continueButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('Touchstart on continue button');
        continueGame(canvas);
    }, { passive: false });
    continueButton.addEventListener('click', () => continueGame(canvas));

    if (quitButton) {
        quitButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('Touchstart on quit button');
            import('./ui.js').then(m => m.quitGame());
        }, { passive: false });
        quitButton.addEventListener('click', () => import('./ui.js').then(m => m.quitGame()));
    }

    window.onload = () => {
        import('./ui.js').then(module => {
            module.showOverlay('START');
        });
    };
}

init();