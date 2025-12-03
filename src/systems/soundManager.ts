import type { SoundKey, SoundMap, Volumes } from '@types';
import { debug, info, warn, error } from '@core/logger.js';
import { VOLUME_CONSTANTS } from '@core/uiConstants.js';

const envBaseUrl = typeof import.meta !== 'undefined' && typeof import.meta.env?.BASE_URL === 'string'
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

Object.entries(sounds).forEach(([key, audio]) => {
  if (key === 'bgm' || !(audio instanceof HTMLAudioElement)) return;
  audio.volume = currentVolume;
  audio.muted = isMuted;
  audio.addEventListener('loadeddata', () => {
    debug('audio', 'Audio loaded:', key);
  });
  audio.load();
});

export function forceAudioUnlock(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const silent = new Audio(SILENT_MP3);
      silent.volume = 0;

      silent.addEventListener('error', (err) => {
        warn('audio', 'Silent audio failed to load, but continuing:', err);
        isAudioUnlocked = true;
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
        }).catch((err: unknown) => {
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

  if (!sounds.bgm) {
    debug('audio', 'Creating bgm audio element');
    sounds.bgm = new Audio(`${BASE_URL}sounds/bg-music.mp3`);
    sounds.bgm.loop = true;
    sounds.bgm.volume = currentVolume;
    sounds.bgm.muted = isMuted;
  }

  const bgm = sounds.bgm;
  if (!bgm) return;

  bgm.currentTime = 0;
  bgm.volume = volumes.backgroundMusic;
  bgm.muted = isMuted;

  bgm.play()
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
  volumes.backgroundMusic = val;
  debug('audio', 'setBackgroundMusicVolume', { backgroundMusicVolume: val });
  if (!isMuted && sounds.bgm) {
    sounds.bgm.volume = val;
  }
}

export function setSoundEffectsVolume(val: number): void {
  volumes.soundEffects = val;
  currentVolume = val;
  debug('audio', 'setSoundEffectsVolume', { soundEffectsVolume: val });
  if (!isMuted) applyVolumeAndMute();
}

export function playSound(name: SoundKey): void {
  const base = sounds[name];
  if (!isAudioUnlocked || isMuted || !base) return;

  const sfx = base.cloneNode(true) as HTMLAudioElement;
  sfx.volume = volumes.soundEffects;
  sfx.muted = isMuted;

  sfx.play()
    .then(() => {
      debug('audio', `playSound(${name}) triggered`);
    })
    .catch((err: unknown) => {
      error('audio', `playSound(${name}) failed:`, err);
    });
}
