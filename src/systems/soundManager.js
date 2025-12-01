// soundManager.js

import { debug, info, warn, error } from '@core/logger.js';

const BASE_URL = import.meta.env.BASE_URL || '/spaceship-dodge-game/';
debug('audio', 'soundManager BASE_URL', BASE_URL);

const SILENT_MP3 = `${BASE_URL}sounds/silence.mp3`;

export let currentVolume = 0.4;
let isMuted = false;
let isAudioUnlocked = false;

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

  sounds.bgm.play()
    .then(() => {
      info('audio', 'BGM playback started');
    })
    .catch((err) => {
      error('audio', 'startMusic failed:', err);
    });
}

export function stopMusic() {
  if (!sounds.bgm) return;
  sounds.bgm.pause();
  sounds.bgm.currentTime = 0;
}

export function muteAll() {
  debug('audio', 'muteAll called');
  isMuted = true;
  applyVolumeAndMute();
}

export function unmuteAll() {
  debug('audio', 'unmuteAll called');
  isMuted = false;
  applyVolumeAndMute();
  startMusic();
}

function applyVolumeAndMute() {
  debug('audio', 'applyVolumeAndMute', { isMuted, currentVolume });
  Object.entries(sounds).forEach(([_key, audio]) => {
    if (!audio) return;
    audio.volume = isMuted ? 0 : currentVolume;
    audio.muted = isMuted;
  });
}

export function setVolume(val) {
  currentVolume = val;
  debug('audio', 'setVolume', { currentVolume: val });
  if (!isMuted) applyVolumeAndMute();
}

export function playSound(name) {
  if (!isAudioUnlocked || isMuted || !sounds[name]) return;

  const base = sounds[name];
  const sfx = base.cloneNode();
  sfx.volume = currentVolume;
  sfx.muted = isMuted;

  sfx.play()
    .then(() => {
      debug('audio', `playSound(${name}) triggered`);
    })
    .catch((err) => {
      error('audio', `playSound(${name}) failed:`, err);
    });
}

// Removed unused sounds export