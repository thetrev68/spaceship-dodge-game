import type { BreakVariant, SoundKey, SoundMap, SoundPlayOptions, Theme, Volumes } from '@types';
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

const DEFAULT_SOUND_PATHS: Record<SoundKey, string> = {
  bgm: 'sounds/space-bgm.mp3',
  fire: 'sounds/space-fire.mp3',
  break: 'sounds/space-break-medium.mp3',
  gameover: 'sounds/space-gameover.mp3',
  levelup: 'sounds/space-levelup.mp3',
  player_hit: 'sounds/space-player_hit.mp3',
  powerup_collect: 'sounds/space-powerup_collect.mp3',
  ui_click: 'sounds/space-ui_click.mp3',
};

const DEFAULT_BREAK_VARIANTS: Partial<Record<BreakVariant, string>> = {
  small: 'sounds/space-break-small.mp3',
  medium: 'sounds/space-break-medium.mp3',
  large: 'sounds/space-break-large.mp3',
};

const volumes: Volumes = {
  backgroundMusic: VOLUME_CONSTANTS.DEFAULT_BACKGROUND_MUSIC,
  soundEffects: VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS,
};

let currentVolume = VOLUME_CONSTANTS.DEFAULT_SOUND_EFFECTS;

let isMuted = false;
let isAudioUnlocked = false;

const sounds: SoundMap = {
  bgm: null,
  fire: null,
  break: null,
  gameover: null,
  levelup: null,
  player_hit: null,
  powerup_collect: null,
  ui_click: null,
};

// Theme-specific sound overrides
const currentThemeAudio: Partial<Record<SoundKey, HTMLAudioElement>> = {};
const currentThemeBreakVariants: Partial<Record<BreakVariant, HTMLAudioElement>> = {};
const baseBreakVariants: Partial<Record<BreakVariant, HTMLAudioElement>> = {};

function createAudio(path: string): HTMLAudioElement {
  const audio = new Audio(`${BASE_URL}${path}`);
  audio.volume = currentVolume;
  audio.muted = isMuted;
  audio.addEventListener('loadeddata', () => {
    debug('audio', 'Audio loaded:', path);
  });
  audio.load();
  return audio;
}

function initBaseSounds(): void {
  (Object.keys(DEFAULT_SOUND_PATHS) as SoundKey[]).forEach((key) => {
    if (key === 'bgm') return;
    const path = DEFAULT_SOUND_PATHS[key];
    sounds[key] = createAudio(path);
  });

  Object.entries(DEFAULT_BREAK_VARIANTS).forEach(([variant, path]) => {
    baseBreakVariants[variant as BreakVariant] = createAudio(path);
  });
}

initBaseSounds();

/**
 * Loads theme-specific audio files
 */
function loadThemeAudio(theme: Theme): void {
  if (!theme.audio) {
    // Clear overrides if theme has none
    Object.values(currentThemeAudio).forEach((audio) => {
      audio.pause();
      audio.remove();
    });
    Object.values(currentThemeBreakVariants).forEach((audio) => {
      audio.pause();
      audio.remove();
    });
    return;
  }

  // Clear existing theme audio
  Object.values(currentThemeAudio).forEach((audio) => {
    audio.pause();
    audio.remove();
  });
  Object.values(currentThemeBreakVariants).forEach((audio) => {
    audio.pause();
    audio.remove();
  });

  const { audio } = theme;
  if (audio.fireSound) currentThemeAudio.fire = createAudio(audio.fireSound);
  if (audio.breakSound) currentThemeAudio.break = createAudio(audio.breakSound);
  if (audio.gameoverSound) currentThemeAudio.gameover = createAudio(audio.gameoverSound);
  if (audio.levelupSound) currentThemeAudio.levelup = createAudio(audio.levelupSound);
  if (audio.playerHitSound) currentThemeAudio.player_hit = createAudio(audio.playerHitSound);
  if (audio.powerupCollectSound)
    currentThemeAudio.powerup_collect = createAudio(audio.powerupCollectSound);
  if (audio.uiClickSound) currentThemeAudio.ui_click = createAudio(audio.uiClickSound);

  if (audio.breakVariants) {
    Object.entries(audio.breakVariants).forEach(([variant, path]) => {
      if (!path) return;
      const audioEl = createAudio(path);
      currentThemeBreakVariants[variant as BreakVariant] = audioEl;
    });
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
  const bgmPath = theme.audio?.bgMusic || DEFAULT_SOUND_PATHS.bgm;

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

  Object.values(baseBreakVariants).forEach((audio) => {
    if (!audio) return;
    audio.volume = isMuted ? 0 : volumes.soundEffects;
    audio.muted = isMuted;
  });

  Object.values(currentThemeAudio).forEach((audio) => {
    if (!audio) return;
    audio.volume = isMuted ? 0 : volumes.soundEffects;
    audio.muted = isMuted;
  });

  Object.values(currentThemeBreakVariants).forEach((audio) => {
    if (!audio) return;
    audio.volume = isMuted ? 0 : volumes.soundEffects;
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

function resolveBreakAudio(variant?: BreakVariant): HTMLAudioElement | undefined {
  if (variant) {
    return (
      currentThemeBreakVariants[variant] ||
      baseBreakVariants[variant] ||
      currentThemeAudio.break ||
      sounds.break ||
      undefined
    );
  }
  return currentThemeAudio.break || sounds.break || undefined;
}

export function playSound(name: SoundKey, options?: SoundPlayOptions): void {
  // Check for theme-specific sound first
  let base: HTMLAudioElement | null | undefined;
  if (name === 'break') {
    base = resolveBreakAudio(options?.variant);
  } else {
    base = currentThemeAudio[name] || sounds[name];
  }

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
