/**
 * @fileoverview Audio control UI components.
 */

import { services } from '@services/ServiceProvider.js';
import { getSettings, setSetting } from '@ui/settings/settingsManager.js';
import { showSettings } from '@ui/settings/settingsUI.js';
import { AUDIO_CONTROLS, VOLUME_CONSTANTS } from '@core/uiConstants.js';
import { getById } from '@utils/dom.js';

function updateMuteButtonLabel(button: HTMLButtonElement, muted: boolean): void {
  button.textContent = muted ? 'M' : 'U';
  button.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
}

export function createAudioControls(): void {
  const settings = getSettings();

  const existing = getById<HTMLDivElement>('audioControlsContainer');
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = 'audioControlsContainer';
  container.style.position = 'absolute';
  container.style.top = AUDIO_CONTROLS.POSITION_TOP;
  container.style.right = AUDIO_CONTROLS.POSITION_RIGHT;
  container.style.zIndex = AUDIO_CONTROLS.Z_INDEX.toString();
  container.style.display = 'flex';
  container.style.gap = AUDIO_CONTROLS.GAP;
  container.style.alignItems = 'center';

  const muteBtn = document.createElement('button');
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
  updateMuteButtonLabel(muteBtn, settings.isMuted);

  const toggleMute = (): void => {
    const newMutedState = !settings.isMuted;
    settings.isMuted = newMutedState;
    setSetting('isMuted', newMutedState);
    updateMuteButtonLabel(muteBtn, newMutedState);
    if (newMutedState) {
      services.audioService.muteAll();
    } else {
      services.audioService.unmuteAll();
    }
  };

  muteBtn.addEventListener(
    'touchstart',
    (event: TouchEvent) => {
      event.preventDefault();
      toggleMute();
    },
    { passive: false }
  );

  muteBtn.addEventListener('click', () => {
    toggleMute();
  });

  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = VOLUME_CONSTANTS.MIN_VOLUME.toString();
  volumeSlider.max = VOLUME_CONSTANTS.MAX_VOLUME.toString();
  volumeSlider.step = VOLUME_CONSTANTS.VOLUME_STEP.toString();
  volumeSlider.value = settings.soundEffectsVolume.toString();
  volumeSlider.style.width = AUDIO_CONTROLS.SLIDER_WIDTH;

  const applyVolume = (value: number): void => {
    settings.soundEffectsVolume = value;
    settings.backgroundMusicVolume = value;
    setSetting('soundEffectsVolume', value);
    setSetting('backgroundMusicVolume', value);
    services.audioService.setSoundEffectsVolume(value);
    services.audioService.setBackgroundMusicVolume(value);
  };

  volumeSlider.addEventListener('input', (event: Event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target) return;
    applyVolume(parseFloat(target.value));
  });

  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = 'S';
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
  settingsBtn.setAttribute('aria-label', 'Open settings');

  const openSettings = (): void => {
    showSettings();
  };

  settingsBtn.addEventListener(
    'touchstart',
    (event: TouchEvent) => {
      event.preventDefault();
      openSettings();
    },
    { passive: false }
  );

  settingsBtn.addEventListener('click', () => {
    openSettings();
  });

  container.appendChild(muteBtn);
  container.appendChild(volumeSlider);
  container.appendChild(settingsBtn);
  document.body.appendChild(container);
}
