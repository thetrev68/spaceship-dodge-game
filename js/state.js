/*
    state.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark
    Updates:
        2025-06-01: Added isMobile flag and conditional BASE_SPAWN_INTERVAL for mobile tuning.
        2025-06-02: Kept player.x: 380, y: 500 for 800x600 canvas.
    Notes:
    Central store for game state and shared objects.
*/


export const gameState = { value: 'START' };
export const score = { value: 0 };
export const gameLevel = { value: 0 };
export const lastObstacleSpawnTime = { value: 0 };
export const lastShotTime = { value: 0 };
export const levelStartTime = { value: 0 };
export const allowSpawning = { value: true };

export const player = {
    x: 380, // Center of 800px canvas
    y: 500, // Near bottom of 600px canvas
    width: 40,
    height: 40,
    speed: 7,
    dx: 0,
    dy: 0
};

export const obstacles = [];
export const bullets = [];

export const ASTEROID_LEVEL_SIZES = [35, 22, 12];
export const ASTEROID_SCORE_VALUES = [20, 50, 100];
export const BASE_OBSTACLE_MIN_SPEED = 0.8;
export const BASE_OBSTACLE_MAX_SPEED = 2.5;
export const SPEED_INCREASE_PER_LEVEL = 0.5;

export const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
export const BASE_SPAWN_INTERVAL = isMobile ? 2400 : 1500;
export const SPAWN_INTERVAL_DECREASE_PER_LEVEL = 70;
export const bulletSpeed = 10;
export const bulletRadius = 3;
export const fireRate = 100;