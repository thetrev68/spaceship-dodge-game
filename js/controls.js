/*
    controls.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Handles keyboard input for player movement and firing.
*/

import { fireBullet } from './bullet.js';
import { gameState, player } from './state.js';

export function setupInput() {
    document.addEventListener('keydown', (e) => {
        // Allow pause toggle even when not PLAYING
        if (e.key === 'p') {
            if (gameState.value !== 'PLAYING' && gameState.value !== 'PAUSED') return;
            const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
            gameState.value = nextState;
            import('./ui.js').then(m => m.showOverlay(nextState));
            return;
        }
        if (gameState.value !== 'PLAYING') return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                player.dy = -player.speed;
                break;
            case 'ArrowDown':
            case 's':
                player.dy = player.speed;
                break;
            case 'ArrowLeft':
            case 'a':
                player.dx = -player.speed;
                break;
            case 'ArrowRight':
            case 'd':
                player.dx = player.speed;
                break;
            case ' ':
                fireBullet();
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (gameState.value !== 'PLAYING') return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'ArrowDown':
            case 's':
                player.dy = 0;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'ArrowRight':
            case 'd':
                player.dx = 0;
                break;
        }
    });
}