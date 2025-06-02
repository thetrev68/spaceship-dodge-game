/*
    soundManager.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        2025-06-01: Added error logging for audio playback.
        2025-06-01: Added unlockAudio to handle iOS audio restrictions.

    Notes:
    Modular audio manager for game sound effects and music.
*/

const sounds = {
    bgm: new Audio('assets/sounds/bg-music.mp3'),
    fire: new Audio('assets/sounds/fire.wav'),
    break: new Audio('assets/sounds/break.wav'),
    gameover: new Audio('assets/sounds/gameover.wav'),
    levelup: new Audio('assets/sounds/levelup.wav')
};

let currentVolume = 0.4;
let isAudioUnlocked = false;

sounds.bgm.loop = true;
sounds.bgm.volume = currentVolume;

// Unlock audio context for iOS
export function unlockAudio() {
    if (isAudioUnlocked) return;
    Object.values(sounds).forEach(audio => {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {});
    });
    isAudioUnlocked = true;
    console.log('Audio context unlocked');
}

export function playSound(name) {
    if (!sounds[name]) return;
    if (!isAudioUnlocked) unlockAudio();
    const s = sounds[name].cloneNode();
    s.volume = currentVolume;
    s.play().catch((e) => console.error(`Error playing sound ${name}:`, e));
}

export function startMusic() {
    if (!isAudioUnlocked) unlockAudio();
    setTimeout(() => {
        sounds.bgm.play().catch((e) => console.error('Error playing bgm:', e));
    }, 100); // Delay to avoid AbortError
}

export function stopMusic() {
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
}

export function muteAll() {
    Object.values(sounds).forEach(audio => audio.muted = true);
}

export function unmuteAll() {
    Object.values(sounds).forEach(audio => audio.muted = false);
}

export function setVolume(val) {
    currentVolume = val;
    sounds.bgm.volume = val;
}