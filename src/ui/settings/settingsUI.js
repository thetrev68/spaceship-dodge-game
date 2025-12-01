/**
 * @fileoverview Settings UI component for the game.
 * Provides a modal for adjusting game settings including audio controls.
 */

import { getSettings, setSetting } from './settingsManager.js';
import * as soundManager from '@systems/soundManager.js';
import { isMobile } from '@utils/platform.js';
import {
  SETTINGS_UI,
  VOLUME_CONSTANTS
} from '@core/uiConstants.js';

/**
 * Creates and returns the settings UI element.
 * @returns {HTMLElement} The settings UI container element.
 */
export function createSettingsUI() {
  const settings = getSettings();

  // Create main container
  const container = document.createElement('div');
  container.id = 'settingsContainer';
  container.style.position = 'absolute';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.zIndex = SETTINGS_UI.Z_INDEX.toString();
  container.style.backgroundColor = `rgba(0, 0, 0, ${SETTINGS_UI.BACKGROUND_OPACITY})`;
  container.style.padding = SETTINGS_UI.PADDING;
  container.style.borderRadius = SETTINGS_UI.BORDER_RADIUS;
  container.style.width = isMobile() ? SETTINGS_UI.MOBILE_WIDTH : SETTINGS_UI.DESKTOP_WIDTH;
  container.style.maxWidth = SETTINGS_UI.MAX_WIDTH;
  container.style.maxHeight = SETTINGS_UI.MAX_HEIGHT;
  container.style.overflowY = 'auto';
  container.style.display = 'none'; // Start hidden
  container.className = 'settings-modal';

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = SETTINGS_UI.CLOSE_BUTTON_FONT_SIZE;
  closeButton.style.cursor = 'pointer';
  closeButton.style.width = SETTINGS_UI.CLOSE_BUTTON_SIZE;
  closeButton.style.height = SETTINGS_UI.CLOSE_BUTTON_SIZE;
  closeButton.addEventListener('click', () => {
    container.style.display = 'none';
  });

  // Add title
  const title = document.createElement('h2');
  title.textContent = 'Game Settings';
  title.style.textAlign = 'center';
  title.style.marginBottom = SETTINGS_UI.TITLE_MARGIN_BOTTOM;
  title.style.color = 'white';
  title.style.fontSize = SETTINGS_UI.TITLE_FONT_SIZE;

  // Create audio settings section
  const audioSection = document.createElement('div');
  audioSection.style.marginBottom = SETTINGS_UI.SECTION_MARGIN_BOTTOM;

  const audioTitle = document.createElement('h3');
  audioTitle.textContent = 'Audio Settings';
  audioTitle.style.color = 'white';
  audioTitle.style.marginBottom = SETTINGS_UI.SUBTITLE_MARGIN_BOTTOM;
  audioTitle.style.fontSize = SETTINGS_UI.SUBTITLE_FONT_SIZE;

  // Background music volume control
  const bgMusicLabel = document.createElement('label');
  bgMusicLabel.textContent = 'Background Music Volume';
  bgMusicLabel.style.display = 'block';
  bgMusicLabel.style.color = 'white';
  bgMusicLabel.style.marginBottom = SETTINGS_UI.LABEL_MARGIN_BOTTOM;
  bgMusicLabel.style.fontSize = SETTINGS_UI.LABEL_FONT_SIZE;

  const bgMusicSlider = document.createElement('input');
  bgMusicSlider.type = 'range';
  bgMusicSlider.min = VOLUME_CONSTANTS.MIN_VOLUME.toString();
  bgMusicSlider.max = VOLUME_CONSTANTS.MAX_VOLUME.toString();
  bgMusicSlider.step = VOLUME_CONSTANTS.VOLUME_STEP.toString();
  bgMusicSlider.value = settings.backgroundMusicVolume;
  bgMusicSlider.style.width = SETTINGS_UI.SLIDER_WIDTH;
  bgMusicSlider.style.marginBottom = SETTINGS_UI.SLIDER_MARGIN_BOTTOM;
  bgMusicSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    setSetting('backgroundMusicVolume', value);
    soundManager.setBackgroundMusicVolume(value);
  });

  // Sound effects volume control
  const sfxLabel = document.createElement('label');
  sfxLabel.textContent = 'Sound Effects Volume';
  sfxLabel.style.display = 'block';
  sfxLabel.style.color = 'white';
  sfxLabel.style.marginBottom = SETTINGS_UI.LABEL_MARGIN_BOTTOM;
  sfxLabel.style.fontSize = SETTINGS_UI.LABEL_FONT_SIZE;

  const sfxSlider = document.createElement('input');
  sfxSlider.type = 'range';
  sfxSlider.min = VOLUME_CONSTANTS.MIN_VOLUME.toString();
  sfxSlider.max = VOLUME_CONSTANTS.MAX_VOLUME.toString();
  sfxSlider.step = VOLUME_CONSTANTS.VOLUME_STEP.toString();
  sfxSlider.value = settings.soundEffectsVolume;
  sfxSlider.style.width = SETTINGS_UI.SLIDER_WIDTH;
  sfxSlider.style.marginBottom = SETTINGS_UI.SLIDER_MARGIN_BOTTOM;
  sfxSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    setSetting('soundEffectsVolume', value);
    soundManager.setSoundEffectsVolume(value);
  });

  // Mute toggle
  const muteToggle = document.createElement('div');
  muteToggle.style.display = 'flex';
  muteToggle.style.alignItems = 'center';
  muteToggle.style.marginBottom = '1rem';

  const muteLabel = document.createElement('label');
  muteLabel.textContent = 'Mute All Audio';
  muteLabel.style.color = 'white';
  muteLabel.style.marginRight = '1rem';
  muteLabel.style.fontSize = SETTINGS_UI.LABEL_FONT_SIZE;

  const muteCheckbox = document.createElement('input');
  muteCheckbox.type = 'checkbox';
  muteCheckbox.checked = settings.isMuted;
  muteCheckbox.style.width = '20px';
  muteCheckbox.style.height = '20px';
  muteCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    setSetting('isMuted', isChecked);
    if (isChecked) {
      soundManager.muteAll();
    } else {
      soundManager.unmuteAll();
    }
  });

  // Gameplay settings section
  const gameplaySection = document.createElement('div');
  gameplaySection.style.marginBottom = SETTINGS_UI.SECTION_MARGIN_BOTTOM;

  const gameplayTitle = document.createElement('h3');
  gameplayTitle.textContent = 'Gameplay Settings';
  gameplayTitle.style.color = 'white';
  gameplayTitle.style.marginBottom = SETTINGS_UI.SUBTITLE_MARGIN_BOTTOM;
  gameplayTitle.style.fontSize = SETTINGS_UI.SUBTITLE_FONT_SIZE;

  // Platform-specific text toggle
  const platformTextLabel = document.createElement('label');
  platformTextLabel.textContent = 'Use Platform-Specific Text';
  platformTextLabel.style.display = 'block';
  platformTextLabel.style.color = 'white';
  platformTextLabel.style.marginBottom = SETTINGS_UI.LABEL_MARGIN_BOTTOM;
  platformTextLabel.style.fontSize = SETTINGS_UI.LABEL_FONT_SIZE;

  const platformTextCheckbox = document.createElement('input');
  platformTextCheckbox.type = 'checkbox';
  platformTextCheckbox.checked = settings.platformSpecificText;
  platformTextCheckbox.style.width = '20px';
  platformTextCheckbox.style.height = '20px';
  platformTextCheckbox.addEventListener('change', (e) => {
    setSetting('platformSpecificText', e.target.checked);
  });

  // Vibration toggle (mobile only)
  if (isMobile()) {
    const vibrationLabel = document.createElement('label');
    vibrationLabel.textContent = 'Enable Vibration';
    vibrationLabel.style.display = 'block';
    vibrationLabel.style.color = 'white';
    vibrationLabel.style.marginBottom = SETTINGS_UI.LABEL_MARGIN_BOTTOM;
    vibrationLabel.style.fontSize = SETTINGS_UI.LABEL_FONT_SIZE;

    const vibrationCheckbox = document.createElement('input');
    vibrationCheckbox.type = 'checkbox';
    vibrationCheckbox.checked = settings.vibrationEnabled;
    vibrationCheckbox.style.width = '20px';
    vibrationCheckbox.style.height = '20px';
    vibrationCheckbox.addEventListener('change', (e) => {
      setSetting('vibrationEnabled', e.target.checked);
    });

    gameplaySection.appendChild(vibrationLabel);
    gameplaySection.appendChild(vibrationCheckbox);
  }

  // Assemble the UI
  container.appendChild(closeButton);
  container.appendChild(title);

  audioSection.appendChild(audioTitle);
  audioSection.appendChild(bgMusicLabel);
  audioSection.appendChild(bgMusicSlider);
  audioSection.appendChild(sfxLabel);
  audioSection.appendChild(sfxSlider);
  audioSection.appendChild(muteToggle);
  muteToggle.appendChild(muteLabel);
  muteToggle.appendChild(muteCheckbox);

  gameplaySection.appendChild(gameplayTitle);
  gameplaySection.appendChild(platformTextLabel);
  gameplaySection.appendChild(platformTextCheckbox);

  container.appendChild(audioSection);
  container.appendChild(gameplaySection);

  return container;
}

/**
 * Shows the settings modal.
 */
export function showSettings() {
  const container = document.getElementById('settingsContainer');
  if (container) {
    container.style.display = 'block';
  }
}

/**
 * Hides the settings modal.
 */
export function hideSettings() {
  const container = document.getElementById('settingsContainer');
  if (container) {
    container.style.display = 'none';
  }
}

/**
 * Initializes the settings UI and adds it to the document.
 */
export function initializeSettingsUI() {
  const settingsUI = createSettingsUI();
  document.body.appendChild(settingsUI);
}