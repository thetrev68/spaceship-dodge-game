/**
 * @fileoverview Settings UI component for the game.
 * Provides a modal for adjusting game settings including audio controls.
 */

import { getSettings, setSetting } from './settingsManager.js';
import * as soundManager from '@systems/soundManager.js';
import { isMobile } from '@utils/platform.js';
import { SETTINGS_UI, VOLUME_CONSTANTS } from '@core/uiConstants.js';
import { getById } from '@utils/dom.js';

const focusableSelector = [
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function createSettingsUI(): HTMLElement {
  const settings = getSettings();

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
  container.style.display = 'none';
  container.className = 'settings-modal';
  container.setAttribute('role', 'dialog');
  container.setAttribute('aria-modal', 'true');
  container.setAttribute('aria-label', 'Game settings');
  container.tabIndex = -1;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'x';
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
  closeButton.setAttribute('aria-label', 'Close settings');
  closeButton.addEventListener('click', () => {
    hideSettings();
  });

  const title = document.createElement('h2');
  title.textContent = 'Game Settings';
  title.style.textAlign = 'center';
  title.style.marginBottom = SETTINGS_UI.TITLE_MARGIN_BOTTOM;
  title.style.color = 'white';
  title.style.fontSize = SETTINGS_UI.TITLE_FONT_SIZE;

  const audioSection = document.createElement('div');
  audioSection.style.marginBottom = SETTINGS_UI.SECTION_MARGIN_BOTTOM;

  const audioTitle = document.createElement('h3');
  audioTitle.textContent = 'Audio Settings';
  audioTitle.style.color = 'white';
  audioTitle.style.marginBottom = SETTINGS_UI.SUBTITLE_MARGIN_BOTTOM;
  audioTitle.style.fontSize = SETTINGS_UI.SUBTITLE_FONT_SIZE;

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
  bgMusicSlider.value = settings.backgroundMusicVolume.toString();
  bgMusicSlider.style.width = SETTINGS_UI.SLIDER_WIDTH;
  bgMusicSlider.style.marginBottom = SETTINGS_UI.SLIDER_MARGIN_BOTTOM;
  bgMusicSlider.addEventListener('input', (event: Event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target) return;
    const value = parseFloat(target.value);
    setSetting('backgroundMusicVolume', value);
    soundManager.setBackgroundMusicVolume(value);
    settings.backgroundMusicVolume = value;
  });

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
  sfxSlider.value = settings.soundEffectsVolume.toString();
  sfxSlider.style.width = SETTINGS_UI.SLIDER_WIDTH;
  sfxSlider.style.marginBottom = SETTINGS_UI.SLIDER_MARGIN_BOTTOM;
  sfxSlider.addEventListener('input', (event: Event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target) return;
    const value = parseFloat(target.value);
    setSetting('soundEffectsVolume', value);
    soundManager.setSoundEffectsVolume(value);
    settings.soundEffectsVolume = value;
  });

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
  muteCheckbox.addEventListener('change', (event: Event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target) return;
    const isChecked = target.checked;
    settings.isMuted = isChecked;
    setSetting('isMuted', isChecked);
    if (isChecked) {
      soundManager.muteAll();
    } else {
      soundManager.unmuteAll();
    }
  });

  const gameplaySection = document.createElement('div');
  gameplaySection.style.marginBottom = SETTINGS_UI.SECTION_MARGIN_BOTTOM;

  const gameplayTitle = document.createElement('h3');
  gameplayTitle.textContent = 'Gameplay Settings';
  gameplayTitle.style.color = 'white';
  gameplayTitle.style.marginBottom = SETTINGS_UI.SUBTITLE_MARGIN_BOTTOM;
  gameplayTitle.style.fontSize = SETTINGS_UI.SUBTITLE_FONT_SIZE;

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
  platformTextCheckbox.addEventListener('change', (event: Event) => {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    if (!target) return;
    settings.platformSpecificText = target.checked;
    setSetting('platformSpecificText', target.checked);
  });

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
    vibrationCheckbox.addEventListener('change', (event: Event) => {
      const target = event.target instanceof HTMLInputElement ? event.target : null;
      if (!target) return;
      settings.vibrationEnabled = target.checked;
      setSetting('vibrationEnabled', target.checked);
    });

    gameplaySection.appendChild(vibrationLabel);
    gameplaySection.appendChild(vibrationCheckbox);
  }

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

export function showSettings(): void {
  const container = getById<HTMLElement>('settingsContainer');
  if (!container) return;

  container.style.display = 'block';
  container.setAttribute('aria-hidden', 'false');
  const focusable = container.querySelector<HTMLElement>(focusableSelector);
  requestAnimationFrame(() => {
    const focusTarget = focusable ?? container;
    focusTarget.focus({ preventScroll: true });
  });
}

export function hideSettings(): void {
  const container = getById<HTMLElement>('settingsContainer');
  if (!container) return;

  container.style.display = 'none';
  container.setAttribute('aria-hidden', 'true');
  const canvas = getById<HTMLCanvasElement>('gameCanvas');
  canvas?.focus({ preventScroll: true });
}

export function initializeSettingsUI(): void {
  const existing = getById<HTMLElement>('settingsContainer');
  if (existing) {
    existing.remove();
  }
  const settingsUI = createSettingsUI();
  document.body.appendChild(settingsUI);
}
