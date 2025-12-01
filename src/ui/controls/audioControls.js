/**
 * @fileoverview Audio control UI components.
 * Created: 2025-05-28
 * Author: ChatGPT + Trevor Clark
 * Updates:
 *     Uses static import for soundManager.
 *     Manages mute/unmute and volume slider.
 */

import * as soundManager from '@systems/soundManager.js';
import { getSettings, setSetting } from '@ui/settings/settingsManager.js';

/**
 * Creates and appends audio control UI elements to the document.
 * Now uses the settings system for volume management.
 */
export function createAudioControls() {
  const settings = getSettings();

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '20';
  container.style.display = 'flex';
  container.style.gap = '10px';
  container.style.alignItems = 'center';

  // Mute toggle button
  const muteBtn = document.createElement('button');
  muteBtn.textContent = settings.isMuted ? '🔇' : '🔊';
  muteBtn.style.fontSize = '1.2rem';
  muteBtn.style.width = '40px';
  muteBtn.style.height = '40px';
  muteBtn.style.display = 'flex';
  muteBtn.style.alignItems = 'center';
  muteBtn.style.justifyContent = 'center';
  muteBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  muteBtn.style.borderRadius = '50%';
  muteBtn.style.border = 'none';
  muteBtn.style.cursor = 'pointer';

  muteBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const newMutedState = !settings.isMuted;
    setSetting('isMuted', newMutedState);
    muteBtn.textContent = newMutedState ? '🔇' : '🔊';
    if (newMutedState) {
      soundManager.muteAll();
    } else {
      soundManager.unmuteAll();
    }
  }, { passive: false });

  muteBtn.addEventListener('click', () => {
    const newMutedState = !settings.isMuted;
    setSetting('isMuted', newMutedState);
    muteBtn.textContent = newMutedState ? '🔇' : '🔊';
    if (newMutedState) {
      soundManager.muteAll();
    } else {
      soundManager.unmuteAll();
    }
  });

  // Volume slider (now controls both music and SFX)
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = '0';
  volumeSlider.max = '1';
  volumeSlider.step = '0.05';
  volumeSlider.value = settings.soundEffectsVolume.toString();
  volumeSlider.style.width = '120px';
  volumeSlider.oninput = (e) => {
    const val = parseFloat(e.target.value);
    setSetting('soundEffectsVolume', val);
    setSetting('backgroundMusicVolume', val);
    soundManager.setSoundEffectsVolume(val);
    soundManager.setBackgroundMusicVolume(val);
  };

  // Settings button to open full settings menu
  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = '⚙️';
  settingsBtn.style.fontSize = '1.2rem';
  settingsBtn.style.width = '40px';
  settingsBtn.style.height = '40px';
  settingsBtn.style.display = 'flex';
  settingsBtn.style.alignItems = 'center';
  settingsBtn.style.justifyContent = 'center';
  settingsBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  settingsBtn.style.borderRadius = '50%';
  settingsBtn.style.border = 'none';
  settingsBtn.style.cursor = 'pointer';
  settingsBtn.style.marginLeft = '5px';

  settingsBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const settingsModal = document.getElementById('settingsContainer');
    if (settingsModal) {
      settingsModal.style.display = 'block';
    }
  }, { passive: false });

  settingsBtn.addEventListener('click', () => {
    const settingsModal = document.getElementById('settingsContainer');
    if (settingsModal) {
      settingsModal.style.display = 'block';
    }
  });

  container.appendChild(muteBtn);
  container.appendChild(volumeSlider);
  container.appendChild(settingsBtn);
  document.body.appendChild(container);
}
