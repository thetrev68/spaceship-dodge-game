/*
    audioControls.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Notes:
    Creates and manages mute/unmute and volume slider UI.
*/

import { muteAll, unmuteAll } from './soundManager.js';

export function createAudioControls() {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '20';
    container.style.display = 'flex';
    container.style.gap = '10px';

    const muteBtn = document.createElement('button');
    muteBtn.textContent = '🔇';
    muteBtn.onclick = () => muteAll();

    const unmuteBtn = document.createElement('button');
    unmuteBtn.textContent = '🔊';
    unmuteBtn.onclick = () => unmuteAll();

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.05';
    volumeSlider.value = '0.4';
    volumeSlider.oninput = (e) => {
        const val = parseFloat(e.target.value);
        import('./soundManager.js').then(m => m.setVolume(val));
    };

    container.appendChild(muteBtn);
    container.appendChild(unmuteBtn);
    container.appendChild(volumeSlider);
    document.body.appendChild(container);
}