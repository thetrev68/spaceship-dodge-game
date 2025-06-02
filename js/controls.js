/*
    controls.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Merged mouse and keyboard controls from loop.js for unified input handling.
        2025-06-01: Fixed firing sound persisting after game state changes.
        2025-06-01: Added touch support with auto-fire and drag-to-move for mobile.
        2025-06-01: Modified mobile auto-fire to only activate while touching.

    Notes:
    Handles keyboard, mouse, and touch input for player control and firing.
*/

import { fireBullet } from './bullet.js';
import { gameState, player } from './state.js';
import { showOverlay } from './ui.js';

let firing = false;
let mobileTouching = false;
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export function setupInput(canvas) {
    console.log('setupInput called');
    document.addEventListener('touchstart', () => console.log('Global touchstart triggered'));
    if (isMobile) {
        // Mobile: conditional auto-fire
        let lastTouchFire = 0;
        let fireCooldown = 300;
        function touchFireLoop() {
            const now = Date.now();
            if (gameState.value === 'PLAYING' && mobileTouching && now - lastTouchFire > fireCooldown) {
                console.log('Firing bullet');
                fireBullet();
                lastTouchFire = now;
            }
            requestAnimationFrame(touchFireLoop);
        }

        requestAnimationFrame(touchFireLoop);

        // Mobile: drag-to-move
        canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
            console.log('Touch start on canvas');
            console.log('Touch start');
            mobileTouching = true;
            handleTouch(e);
        });
        canvas.addEventListener('touchmove', handleTouch, { passive: false });
        canvas.addEventListener('touchend', () => {
            console.log('touchend');
            mobileTouching = false;
        }, { passive: false });
        canvas.addEventListener('touchcancel', () => {
            console.log('touchcancel');
            mobileTouching = false;
        }, { passive: false });
        document.addEventListener('touchend', () => { mobileTouching = false; });
        document.addEventListener('touchcancel', () => { mobileTouching = false; });
    } else {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p') {
                if (gameState.value !== 'PLAYING' && gameState.value !== 'PAUSED') return;
                const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
                gameState.value = nextState;
                showOverlay(nextState);
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

        // Mouse input
        canvas.addEventListener('mousemove', (e) => {
            if (gameState.value !== 'PLAYING') return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            player.x = mouseX - player.width / 2;
            player.y = mouseY - player.height / 2;
        });

        canvas.addEventListener('mousedown', (e) => {
            if (gameState.value !== 'PLAYING' || e.button !== 0) return;
            firing = true;
            const fire = () => {
                if (!firing || gameState.value !== 'PLAYING') return;
                fireBullet();
                setTimeout(fire, 100);
            };
            fire();
        });

        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) firing = false;
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (gameState.value === 'PLAYING' || gameState.value === 'PAUSED') {
                const nextState = gameState.value === 'PLAYING' ? 'PAUSED' : 'PLAYING';
                gameState.value = nextState;
                showOverlay(nextState);
                if (nextState === 'PAUSED') firing = false;
            }
        });
    }
}

function handleTouch(e) {
    if (gameState.value !== 'PLAYING') return;
    const rect = e.target.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    player.x = x - player.width / 2;
    player.y = y - player.height / 2;
}