import type { SoundKey, SoundMap, Volumes, Theme } from '@types';
import { debug, info, warn, error } from '@core/logger.js';
import { validateAudioVolume } from '@utils/validation.js';
import { VOLUME_CONSTANTS } from '@core/uiConstants.js';
import { getCurrentTheme } from '@core/themes/themeManager.js';

const envBaseUrl =
  typeof import.meta !== 'undefined' && typeof import.meta.env?.BASE_URL === 'string'
    ? import.meta.env.BASE_URL
    : undefined;
const BASE_URL = envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : '/spaceship-dodge-game/';
debug('audio', 'soundManager BASE_URL', BASE_URL);

const SILENT_MP3 = `${BASE_URL}sounds/silence.mp3`;

const volumes: Volumes = {
  backgroundMusic: VOLUME_CONSTANTS.DEFAULT_BACKGROUND_MUSIC,
  soundEffects: VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS,
};

let currentVolume = VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS;

let isMuted = false;
let isAudioUnlocked = false;

const sounds: SoundMap = {
  bgm: null,
  fire: new Audio(`${BASE_URL}sounds/fire.mp3`),
  break: new Audio(`${BASE_URL}sounds/break.mp3`),
  gameover: new Audio(`${BASE_URL}sounds/gameover.mp3`),
  levelup: new Audio(`${BASE_URL}sounds/levelup.mp3`),
};

// Theme-specific sound overrides
const currentThemeAudio: Record<string, HTMLAudioElement> = {};

Object.entries(sounds).forEach(([key, audio]) => {
  if (key === 'bgm' || !(audio instanceof HTMLAudioElement)) return;
  audio.volume = currentVolume;
  audio.muted = isMuted;
  audio.addEventListener('loadeddata', () => {
    debug('audio', 'Audio loaded:', key);
  });
  audio.load();
});

/**
 * Loads theme-specific audio files
 */
export function loadThemeAudio(theme: Theme): void {
  if (!theme.audio) return;

  // Clear existing theme audio
  Object.values(currentThemeAudio).forEach((audio) => {
    audio.pause();
    audio.remove();
  });

  // Load new theme audio
  if (theme.audio.fireSound) {
    currentThemeAudio.fire = new Audio(`${BASE_URL}${theme.audio.fireSound}`);
    currentThemeAudio.fire.volume = currentVolume;
    currentThemeAudio.fire.muted = isMuted;
    currentThemeAudio.fire.load();
  }

  if (theme.audio.breakSound) {
    currentThemeAudio.break = new Audio(`${BASE_URL}${theme.audio.breakSound}`);
    currentThemeAudio.break.volume = currentVolume;
    currentThemeAudio.break.muted = isMuted;
    currentThemeAudio.break.load();
  }

  debug('audio', 'Theme audio loaded', { themeId: theme.id });
}

export function forceAudioUnlock(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const silent = new Audio(SILENT_MP3);
      silent.volume = 0;

      silent.addEventListener(
        'error',
        (err) => {
          warn('audio', 'Silent audio failed to load, but continuing:', err);
          isAudioUnlocked = true;
          resolve();
        },
        { once: true }
      );

      const play = silent.play();
      if (play && typeof play.then === 'function') {
        play
          .then(() => {
            silent.pause();
            silent.remove();
            isAudioUnlocked = true;
            debug('audio', 'Silent audio unlocked the audio context');
            resolve();
          })
          .catch((err: unknown) => {
            warn('audio', 'Silent audio unlock failed, but continuing:', err);
            isAudioUnlocked = true;
            resolve();
          });
      } else {
        warn('audio', 'Silent audio play() did not return a promise');
        isAudioUnlocked = true;
        resolve();
      }
    } catch (err) {
      warn('audio', 'Audio unlock exception, but continuing:', err);
      isAudioUnlocked = true;
      resolve();
    }
  });
}

export function startMusic(): void {
  debug('audio', 'startMusic called');

  if (!isAudioUnlocked || isMuted) {
    debug('audio', 'startMusic blocked: muted or not unlocked');
    return;
  }

  const theme = getCurrentTheme();
  const bgmPath = theme.audio?.bgMusic || 'sounds/bg-music.mp3';

  if (!sounds.bgm) {
    debug('audio', 'Creating bgm audio element');
    sounds.bgm = new Audio(`${BASE_URL}${bgmPath}`);
    sounds.bgm.loop = true;
    sounds.bgm.volume = currentVolume;
    sounds.bgm.muted = isMuted;
  }

  const bgm = sounds.bgm;
  if (!bgm) return;

  // Update BGM if theme changed
  if (bgm.src !== `${BASE_URL}${bgmPath}`) {
    bgm.src = `${BASE_URL}${bgmPath}`;
    bgm.load();
  }

  bgm.currentTime = 0;
  bgm.volume = volumes.backgroundMusic;
  bgm.muted = isMuted;

  bgm
    .play()
    .then(() => {
      info('audio', 'BGM playback started');
    })
    .catch((err: unknown) => {
      error('audio', 'startMusic failed:', err);
    });
}

export function stopMusic(): void {
  const bgm = sounds.bgm;
  if (!bgm) return;
  bgm.pause();
  bgm.currentTime = 0;
}

export function muteAll(): void {
  debug('audio', 'muteAll called');
  isMuted = true;
  applyVolumeAndMute();
}

export function unmuteAll(): void {
  debug('audio', 'unmuteAll called');
  isMuted = false;
  applyVolumeAndMute();
  startMusic();
}

export function isAudioMuted(): boolean {
  return isMuted;
}

function applyVolumeAndMute(): void {
  debug('audio', 'applyVolumeAndMute', { isMuted, volumes });
  Object.entries(sounds).forEach(([key, audio]) => {
    if (!audio) return;
    if (key === 'bgm') {
      audio.volume = isMuted ? 0 : volumes.backgroundMusic;
    } else {
      audio.volume = isMuted ? 0 : volumes.soundEffects;
    }
    audio.muted = isMuted;
  });
}

export function setBackgroundMusicVolume(val: number): void {
  const volume = validateAudioVolume(val);
  volumes.backgroundMusic = volume;
  debug('audio', 'setBackgroundMusicVolume', { backgroundMusicVolume: volume });
  if (!isMuted && sounds.bgm) {
    sounds.bgm.volume = volume;
  }
}

export function setSoundEffectsVolume(val: number): void {
  const volume = validateAudioVolume(val);
  volumes.soundEffects = volume;
  currentVolume = volume;
  debug('audio', 'setSoundEffectsVolume', { soundEffectsVolume: volume });
  if (!isMuted) applyVolumeAndMute();
}

export function playSound(name: SoundKey): void {
  // Check for theme-specific sound first
  const themeAudio = currentThemeAudio[name];
  const base = themeAudio || sounds[name];
  if (!isAudioUnlocked || isMuted || !base) return;

  const sfx = base.cloneNode(true) as HTMLAudioElement;
  sfx.volume = volumes.soundEffects;
  sfx.muted = isMuted;

  sfx
    .play()
    .then(() => {
      debug('audio', `playSound(${name}) triggered`);
    })
    .catch((err: unknown) => {
      error('audio', `playSound(${name}) failed:`, err);
    });
}

/**
 * Handles theme change by loading theme-specific audio
 */
export function handleThemeChange(): void {
  const theme = getCurrentTheme();
  loadThemeAudio(theme);

  // Restart music with new theme
  if (!isMuted && isAudioUnlocked) {
    startMusic();
  }
}
