/*
    soundManager.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

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

sounds.bgm.loop = true;
sounds.bgm.volume = currentVolume;

export function playSound(name) {
    if (sounds[name]) {
        const s = sounds[name].cloneNode();
        s.volume = currentVolume;
        s.play();
    }
}

export function startMusic() {
    sounds.bgm.volume = currentVolume;
    sounds.bgm.play();
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
