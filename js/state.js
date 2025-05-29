/*
    state.js
    Created: 2025-05-28
    Author: ChatGPT + [Your Name Here]

    Notes:
    Central store for game state and shared objects.
*/

export const gameState = { value: 'START' }; // 'START', 'PLAYING', 'LEVEL_TRANSITION', 'GAME_OVER'
export let score = 0;
export let gameLevel = 0;
export let lastObstacleSpawnTime = 0;
export let lastShotTime = 0;

export const player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 7,
    dx: 0,
    dy: 0
};

export const obstacles = [];
export const bullets = [];

// Constants
export const ASTEROID_LEVEL_SIZES = [35, 22, 12];
export const ASTEROID_SCORE_VALUES = [100, 50, 20];
export const BASE_OBSTACLE_MIN_SPEED = 0.8;
export const BASE_OBSTACLE_MAX_SPEED = 2.5;
export const SPEED_INCREASE_PER_LEVEL = 0.5;
export const BASE_SPAWN_INTERVAL = 1500;
export const SPAWN_INTERVAL_DECREASE_PER_LEVEL = 70;
export const LEVEL_UP_SCORE_THRESHOLD = 2000;
export const bulletSpeed = 10;
export const bulletRadius = 3;
export const fireRate = 100;