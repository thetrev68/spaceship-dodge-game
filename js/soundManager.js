const BASE_URL = import.meta.env.BASE_URL || '/';
console.log('[DEBUG] soundManager BASE_URL', BASE_URL);

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

const sounds = {
    bgm: new Audio(`${BASE_URL}sounds/bg-music.mp3`),
    fire: `${BASE_URL}sounds/fire.mp3`,
    break: `${BASE_URL}sounds/break.mp3`,
    gameover: `${BASE_URL}sounds/gameover.mp3`,
    levelup: `${BASE_URL}sounds/levelup.mp3`
};

// Preload audio and log errors
Object.values(sounds).forEach((audio, i) => {
    if (typeof audio === 'string') return;
    audio.addEventListener('error', () => {
        console.error('[ERROR] Audio load failed:', Object.keys(sounds)[i]);
    });
    audio.addEventListener('loadeddata', () => {
        console.log('[DEBUG] Audio loaded:', Object.keys(sounds)[i]);
    });
    audio.load();
});

export let currentVolume = 0.4;
let isMuted = false;
let isAudioUnlocked = false;
let audioContext = null;

const soundPools = {};
const maxPoolSize = isMobile ? 4 : 8;

sounds.bgm.loop = true;
applyVolumeAndMute();

function applyVolumeAndMute() {
    console.log('[DEBUG] applyVolumeAndMute', { isMuted, currentVolume });
    sounds.bgm.volume = isMuted ? 0 : currentVolume;
    sounds.bgm.muted = isMuted;

    Object.values(soundPools).flat().forEach(audio => {
        audio.volume = isMuted ? 0 : currentVolume;
        audio.muted = isMuted;
    });
}

export function setVolume(val) {
    currentVolume = val;
    console.log('[DEBUG] setVolume', { currentVolume: val });
    if (!isMuted) applyVolumeAndMute();
}

export function muteAll() {
    console.log('[DEBUG] muteAll called');
    isMuted = true;
    applyVolumeAndMute();
}

export function unmuteAll() {
    console.log('[DEBUG] unmuteAll called');
    isMuted = false;
    applyVolumeAndMute();
    startMusic(); // Ensure music resumes
}

export function playSound(name) {
    console.log('[DEBUG] playSound', { name });
    if (isMuted || !sounds[name]) return;
    if (!isAudioUnlocked) unlockAudio();

    const src = sounds[name];
    if (typeof src !== 'string') return;

    if (!soundPools[name]) {
        soundPools[name] = [];
    }

    const pool = soundPools[name];

    for (const sfx of pool) {
        if (sfx.paused || sfx.ended) {
            sfx.currentTime = 0;
            sfx.play().catch(err => console.error('[ERROR] playSound failed:', err));
            return;
        }
    }

    if (pool.length < maxPoolSize) {
        const newAudio = new Audio(src);
        newAudio.volume = currentVolume;
        newAudio.muted = isMuted;
        newAudio.play().catch(err => console.error('[ERROR] playSound new audio failed:', err));
        pool.push(newAudio);
    }
}

export function startMusic() {
    console.log('[DEBUG] startMusic called', { isAudioUnlocked, isMuted });
    if (isMuted || !isAudioUnlocked) return;

    sounds.bgm.currentTime = 0;
    sounds.bgm.volume = currentVolume;
    sounds.bgm.muted = isMuted;
    sounds.bgm.play().catch(err => console.error('[ERROR] startMusic failed:', err));
}

export function stopMusic() {
    console.log('[DEBUG] stopMusic called');
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
}

export function unlockAudio() {
    console.log('[DEBUG] unlockAudio called');
    if (isAudioUnlocked) return;

    try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('[DEBUG] AudioContext resumed');
            }).catch(err => console.error('[ERROR] AudioContext resume failed:', err));
        }

        const unlockables = [sounds.bgm];
        Object.keys(sounds).forEach(name => {
            if (name === 'bgm') return;
            const src = sounds[name];
            const a = new Audio(src);
            a.volume = 0;
            a.play().then(() => {
                a.pause();
                a.currentTime = 0;
            }).catch(err => console.error('[ERROR] Preload sound failed:', name, err));
        });

        Promise.all(unlockables.map(audio => {
            return audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(err => console.error('[ERROR] Unlock audio failed:', err));
        })).then(() => {
            isAudioUnlocked = true;
            console.log('[DEBUG] Audio context unlocked');
            startMusic(); // Play music immediately after unlock
        }).catch(err => console.error('[ERROR] unlockAudio Promise.all failed:', err));
    } catch (err) {
        console.error('[ERROR] unlockAudio failed:', err);
    }
}