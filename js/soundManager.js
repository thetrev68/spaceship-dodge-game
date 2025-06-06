/*
    soundManager.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Unified mute and volume handling for all sounds and effects.
*/

// js/soundManager.js
const BASE_URL = import.meta.env.BASE_URL; // Get the base path from Vite config

const sounds = {
    // Prepend BASE_URL to the path, then reference the path relative to the public folder's root
    bgm: new Audio(`${BASE_URL}sounds/bg-music.mp3`),
    fire: new Audio(`${BASE_URL}sounds/fire.mp3`),
    break: new Audio(`${BASE_URL}sounds/break.mp3`),
    gameover: new Audio(`${BASE_URL}sounds/gameover.mp3`),
    levelup: new Audio(`${BASE_URL}sounds/levelup.mp3`)
};

export let currentVolume = 0.4;
let isMuted = false;
let isAudioUnlocked = false;

sounds.bgm.loop = true;
applyVolumeAndMute();

function applyVolumeAndMute() {
    Object.values(sounds).forEach(audio => {
        audio.volume = isMuted ? 0 : currentVolume;
        audio.muted = isMuted;
    });
}

export function setVolume(val) {
    currentVolume = val;
    if (!isMuted) {
        Object.values(sounds).forEach(audio => {
            audio.volume = currentVolume;
        });
    }
}

export function muteAll() {
    isMuted = true;
    applyVolumeAndMute();
}

export function unmuteAll() {
    isMuted = false;
    applyVolumeAndMute();
}

export function playSound(name) {
    if (isMuted) return;
    if (!sounds[name]) return;
    if (!isAudioUnlocked) unlockAudio();
    const s = sounds[name].cloneNode();
    s.volume = isMuted ? 0 : currentVolume;
    s.muted = isMuted;
    s.play().catch(e => console.error(`Error playing sound ${name}:`, e));
}

export function startMusic() {
    if (isMuted) return;
    if (!isAudioUnlocked) unlockAudio();
    setTimeout(() => {
        sounds.bgm.volume = isMuted ? 0 : currentVolume;
        sounds.bgm.muted = isMuted;
        sounds.bgm.play().catch(e => console.error('Error playing bgm:', e));
    }, 100);
}

export function stopMusic() {
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
}

export function unlockAudio() {
  if (isAudioUnlocked) return;
  Promise.all(Object.values(sounds).map(audio => {
    return audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
  })).then(() => {
    isAudioUnlocked = true;
    console.log('Audio context unlocked');
  });
}