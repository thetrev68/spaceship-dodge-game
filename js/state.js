/*
    state.js
    Created: 2025-05-28
    Author: ChatGPT + Trevor Clark

    Updates:
        Added isMobile flag for platform detection.
        Added playerLives state.
*/

export const gameState = { value: 'START' };
export const score = { value: 0 };
export const gameLevel = { value: 0 };
export const playerLives = { value: 3 };
export const lastObstacleSpawnTime = { value: 0 };
export const bullets = [];
export const obstacles = [];

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

export const player = {
  x: 380,
  y: 500,
  width: 30,
  height: 45,
  speed: 7,
  dx: 0,
  dy: 0,
};