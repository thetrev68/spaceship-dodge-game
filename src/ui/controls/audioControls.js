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
import {
  AUDIO_CONTROLS,
  VOLUME_CONSTANTS
} from '@core/uiConstants.js';

/**
 * Creates and appends audio control UI elements to the document.
 * Now uses the settings system for volume management.
 */
export function createAudioControls() {
  const settings = getSettings();

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = AUDIO_CONTROLS.POSITION_TOP;
  container.style.right = AUDIO_CONTROLS.POSITION_RIGHT;
  container.style.zIndex = AUDIO_CONTROLS.Z_INDEX.toString();
  container.style.display = 'flex';
  container.style.gap = AUDIO_CONTROLS.GAP;
  container.style.alignItems = 'center';

  // Mute toggle button
  const muteBtn = document.createElement('button');
  muteBtn.textContent = settings.isMuted ? '🔇' : '🔊';
  muteBtn.style.fontSize = AUDIO_CONTROLS.BUTTON_FONT_SIZE;
  muteBtn.style.width = AUDIO_CONTROLS.BUTTON_SIZE;
  muteBtn.style.height = AUDIO_CONTROLS.BUTTON_SIZE;
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
  volumeSlider.min = VOLUME_CONSTANTS.MIN_VOLUME.toString();
  volumeSlider.max = VOLUME_CONSTANTS.MAX_VOLUME.toString();
  volumeSlider.step = VOLUME_CONSTANTS.VOLUME_STEP.toString();
  volumeSlider.value = settings.soundEffectsVolume.toString();
  volumeSlider.style.width = AUDIO_CONTROLS.SLIDER_WIDTH;
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
  settingsBtn.style.fontSize = AUDIO_CONTROLS.BUTTON_FONT_SIZE;
  settingsBtn.style.width = AUDIO_CONTROLS.BUTTON_SIZE;
  settingsBtn.style.height = AUDIO_CONTROLS.BUTTON_SIZE;
  settingsBtn.style.display = 'flex';
  settingsBtn.style.alignItems = 'center';
  settingsBtn.style.justifyContent = 'center';
  settingsBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  settingsBtn.style.borderRadius = '50%';
  settingsBtn.style.border = 'none';
  settingsBtn.style.cursor = 'pointer';
  settingsBtn.style.marginLeft = AUDIO_CONTROLS.BUTTON_MARGIN_LEFT;

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
