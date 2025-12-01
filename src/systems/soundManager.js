/**
 * @fileoverview Audio and sound management system.
 */

import { debug, info, warn, error } from '@core/logger.js';
import { VOLUME_CONSTANTS } from '@core/uiConstants.js';

const BASE_URL = import.meta.env.BASE_URL || '/spaceship-dodge-game/';
debug('audio', 'soundManager BASE_URL', BASE_URL);

const SILENT_MP3 = `${BASE_URL}sounds/silence.mp3`;

/**
 * Current volume levels.
 * @type {Object}
 */
export let volumes = {
  backgroundMusic: VOLUME_CONSTANTS.DEFAULT_BACKGROUND_MUSIC,
  soundEffects: VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS
};

/**
 * Current volume level (legacy - kept for backward compatibility).
 * @type {number}
 * @deprecated Use volumes.soundEffects instead
 */
export let currentVolume = VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS;

/**
 * Flag for muted state.
 * @type {boolean}
 */
let isMuted = false;

/**
 * Flag for audio unlock state.
 * @type {boolean}
 */
let isAudioUnlocked = false;

/**
 * Sound effects and music.
 * @constant {Object<string, Audio|null>}
 */
const sounds = {
  bgm: null, // Will be created dynamically
  fire: new Audio(`${BASE_URL}sounds/fire.mp3`),
  break: new Audio(`${BASE_URL}sounds/break.mp3`),
  gameover: new Audio(`${BASE_URL}sounds/gameover.mp3`),
  levelup: new Audio(`${BASE_URL}sounds/levelup.mp3`),
};

// Preload all non-bgm sounds
Object.entries(sounds).forEach(([key, audio]) => {
  if (key === 'bgm') return;
  audio.volume = currentVolume;
  audio.muted = isMuted;
  audio.addEventListener('loadeddata', () => {
    debug('audio', 'Audio loaded:', key);
  });
  audio.load();
});

/**
 * Forces audio unlock by playing a silent sound.
 * @returns {Promise} Promise that resolves when unlock is attempted.
 */
export function forceAudioUnlock() {
  return new Promise((resolve) => {
    try {
      const silent = new Audio(SILENT_MP3);
      silent.volume = 0;

      // Add error handling for audio loading
      silent.addEventListener('error', (err) => {
        warn('audio', 'Silent audio failed to load, but continuing:', err);
        isAudioUnlocked = true; // Still consider unlocked to allow other audio
        resolve();
      }, { once: true });

      const play = silent.play();
      if (play && typeof play.then === 'function') {
        play.then(() => {
          silent.pause();
          silent.remove();
          isAudioUnlocked = true;
          debug('audio', 'Silent audio unlocked the audio context');
          resolve();
        }).catch((err) => {
          warn('audio', 'Silent audio unlock failed, but continuing:', err);
          isAudioUnlocked = true; // Still consider unlocked to allow other audio
          resolve(); // Resolve anyway to prevent blocking
        });
      } else {
        warn('audio', 'Silent audio play() did not return a promise');
        isAudioUnlocked = true;
        resolve();
      }
    } catch (err) {
      warn('audio', 'Audio unlock exception, but continuing:', err);
      isAudioUnlocked = true;
      resolve(); // Resolve anyway to prevent blocking
    }
  });
}

/**
 * Starts background music playback.
 */
export function startMusic() {
  debug('audio', 'startMusic called');

  if (!isAudioUnlocked || isMuted) {
    debug('audio', 'startMusic blocked: muted or not unlocked');
    return;
  }

  if (!sounds.bgm) {
    debug('audio', 'Creating bgm audio element');
    sounds.bgm = new Audio(`${BASE_URL}sounds/bg-music.mp3`);
    sounds.bgm.loop = true;
    sounds.bgm.volume = currentVolume;
    sounds.bgm.muted = isMuted;
  }

  sounds.bgm.currentTime = 0;

  sounds.bgm.volume = volumes.backgroundMusic;
  sounds.bgm.muted = isMuted;

  sounds.bgm.play()
    .then(() => {
      info('audio', 'BGM playback started');
    })
    .catch((err) => {
      error('audio', 'startMusic failed:', err);
    });
}

/**
 * Stops background music.
 */
export function stopMusic() {
  if (!sounds.bgm) return;
  sounds.bgm.pause();
  sounds.bgm.currentTime = 0;
}

/**
 * Mutes all audio.
 */
export function muteAll() {
  debug('audio', 'muteAll called');
  isMuted = true;
  applyVolumeAndMute();
}

/**
 * Unmutes all audio and starts music.
 */
export function unmuteAll() {
  debug('audio', 'unmuteAll called');
  isMuted = false;
  applyVolumeAndMute();
  startMusic();
}

/**
 * Applies volume and mute settings to all sounds.
 */
function applyVolumeAndMute() {
  debug('audio', 'applyVolumeAndMute', { isMuted, volumes });
  Object.entries(sounds).forEach(([key, audio]) => {
    if (!audio) return;
    // Background music uses its own volume setting
    if (key === 'bgm') {
      audio.volume = isMuted ? 0 : volumes.backgroundMusic;
    } else {
      // Sound effects use their volume setting
      audio.volume = isMuted ? 0 : volumes.soundEffects;
    }
    audio.muted = isMuted;
  });
}

/**
 * Sets the volume level (legacy - kept for backward compatibility).
 * @param {number} val - Volume value (0-1).
 * @deprecated Use setSoundEffectsVolume instead
 */
export function setVolume(val) {
  currentVolume = val;
  volumes.soundEffects = val;
  debug('audio', 'setVolume (legacy)', { currentVolume: val });
  if (!isMuted) applyVolumeAndMute();
}

/**
 * Sets the background music volume.
 * @param {number} val - Volume value (0-1).
 */
export function setBackgroundMusicVolume(val) {
  volumes.backgroundMusic = val;
  debug('audio', 'setBackgroundMusicVolume', { backgroundMusicVolume: val });
  if (!isMuted && sounds.bgm) {
    sounds.bgm.volume = val;
  }
}

/**
 * Sets the sound effects volume.
 * @param {number} val - Volume value (0-1).
 */
export function setSoundEffectsVolume(val) {
  volumes.soundEffects = val;
  currentVolume = val; // Keep legacy variable in sync
  debug('audio', 'setSoundEffectsVolume', { soundEffectsVolume: val });
  if (!isMuted) applyVolumeAndMute();
}

/**
 * Plays a sound effect.
 * @param {string} name - Sound name.
 */
export function playSound(name) {
  if (!isAudioUnlocked || isMuted || !sounds[name]) return;

  const base = sounds[name];
  const sfx = base.cloneNode();
  sfx.volume = volumes.soundEffects;
  sfx.muted = isMuted;

  sfx.play()
    .then(() => {
      debug('audio', `playSound(${name}) triggered`);
    })
    .catch((err) => {
      error('audio', `playSound(${name}) failed:`, err);
    });
}
