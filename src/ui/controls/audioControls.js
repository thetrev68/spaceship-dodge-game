/**
 * @fileoverview Audio control UI components.
 * Created: 2025-05-28
 * Author: ChatGPT + Trevor Clark
 * Updates:
 *     Uses static import for soundManager.
 *     Manages mute/unmute and volume slider.
 */

import * as soundManager from '@systems/soundManager.js';

/**
 * Creates and appends audio control UI elements to the document.
 */
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
  muteBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    soundManager.muteAll();
  }, { passive: false });
  muteBtn.addEventListener('click', () => soundManager.muteAll());

  const unmuteBtn = document.createElement('button');
  unmuteBtn.textContent = '🔊';
  unmuteBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    soundManager.unmuteAll();
  }, { passive: false });
  unmuteBtn.addEventListener('click', () => soundManager.unmuteAll());

  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = '0';
  volumeSlider.max = '1';
  volumeSlider.step = '0.05';
  volumeSlider.value = soundManager.currentVolume.toString();
  volumeSlider.oninput = (e) => {
    const val = parseFloat(e.target.value);
    soundManager.setVolume(val);
  };

  container.appendChild(muteBtn);
  container.appendChild(unmuteBtn);
  container.appendChild(volumeSlider);
  document.body.appendChild(container);
}
