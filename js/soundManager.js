/*
    soundManager.js
    Created: 2025-05-28
    Author: ChatGPT + [Your Name Here]

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

// Loop background music
sounds.bgm.loop = true;

export function playSound(name) {
    if (sounds[name]) {
        // Clone sound if it needs to play overlapping instances
        const s = sounds[name].cloneNode();
        s.volume = 0.7; // You can adjust individual volumes
        s.play();
    }
}

export function startMusic() {
    sounds.bgm.volume = 0.4;
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