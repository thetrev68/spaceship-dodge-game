// soundManager.js (Mobile Optimized)

const BASE_URL = import.meta.env.BASE_URL;
const isMobile = /Mobi|Android/i.test(navigator.userAgent); // crude but effective

const sounds = {
    bgm: new Audio(`${BASE_URL}sounds/bg-music.mp3`),
    fire: `${BASE_URL}sounds/fire.mp3`,
    break: `${BASE_URL}sounds/break.mp3`,
    gameover: `${BASE_URL}sounds/gameover.mp3`,
    levelup: `${BASE_URL}sounds/levelup.mp3`
};

export let currentVolume = 0.4;
let isMuted = false;
let isAudioUnlocked = false;

const soundPools = {}; // Map sound name → Audio[] pool
const maxPoolSize = isMobile ? 4 : 8;

sounds.bgm.loop = true;
applyVolumeAndMute();

function applyVolumeAndMute() {
    sounds.bgm.volume = isMuted ? 0 : currentVolume;
    sounds.bgm.muted = isMuted;

    Object.values(soundPools).flat().forEach(audio => {
        audio.volume = isMuted ? 0 : currentVolume;
        audio.muted = isMuted;
    });
}

export function setVolume(val) {
    currentVolume = val;
    if (!isMuted) applyVolumeAndMute();
}

export function muteAll() {
    isMuted = true;
    applyVolumeAndMute();
}

export function unmuteAll() {
    isMuted = false;
    applyVolumeAndMute();
}

// Play sound with pooling
export function playSound(name) {
    if (isMuted || !sounds[name]) return;
    if (!isAudioUnlocked) unlockAudio();

    const src = sounds[name];
    if (typeof src !== 'string') return; // skip bgm

    if (!soundPools[name]) {
        soundPools[name] = [];
    }

    const pool = soundPools[name];

    // Try to reuse a non-playing sound
    for (const sfx of pool) {
        if (sfx.paused || sfx.ended) {
            sfx.currentTime = 0;
            sfx.play().catch(() => {});
            return;
        }
    }

    // Create new only if pool size allows
    if (pool.length < maxPoolSize) {
        const newAudio = new Audio(src);
        newAudio.volume = currentVolume;
        newAudio.muted = isMuted;
        newAudio.play().catch(() => {});
        pool.push(newAudio);
    }
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

    const unlockables = [sounds.bgm];
    Object.keys(sounds).forEach(name => {
        if (name === 'bgm') return;
        const src = sounds[name];
        const a = new Audio(src);
        a.volume = 0;
        a.play().then(() => {
            a.pause();
            a.currentTime = 0;
        }).catch(() => {});
    });

    Promise.all(unlockables.map(audio => {
        return audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {});
    })).then(() => {
        isAudioUnlocked = true;
        // console.log('Audio context unlocked');
    });
}