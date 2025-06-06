// state.js
// Created: 2025-05-28
// Author: ChatGPT + Trevor Clark

// 🔧 Minimal reactive() implementation for global game state
function reactive(obj) {
  const listeners = new Set();

  const proxy = new Proxy(obj, {
    set(target, key, value) {
      target[key] = value;
      listeners.forEach(fn => fn());
      return true;
    }
  });

  proxy.watch = (fn) => listeners.add(fn);
  return proxy;
}

// 📱 Platform check
export const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// 🎮 Game state
export const gameState = reactive({ value: 'START' });
export const score = reactive({ value: 0 });
export const gameLevel = reactive({ value: 0 });
export const playerLives = reactive({ value: 3 });
export const lastObstacleSpawnTime = { value: 0 };
export const levelStartTime = { value: 0 };
export const allowSpawning = reactive({ value: true });

// 🚀 Entities
export const bullets = [];
export const obstacles = [];

// 🌠 Asteroid constants
export const ASTEROID_LEVEL_SIZES = [35, 22, 12];
export const ASTEROID_SCORE_VALUES = [20, 50, 100];
export const BASE_OBSTACLE_MIN_SPEED = 0.8;
export const BASE_OBSTACLE_MAX_SPEED = 2.5;
export const SPEED_INCREASE_PER_LEVEL = 0.5;

// 🔫 Bullet constants
export const bulletSpeed = 10;
export const bulletRadius = 3;
export const fireRate = 100;

// 💥 Power-up system
export const powerUps = {
  doubleBlaster: { active: false, timer: 0 },
  shield: { active: false, timer: 0 },
};

// 🧍 Player state
export const player = {
  x: 380,
  y: 500,
  width: 30,
  height: 45,
  speed: 7,
  dx: 0,
  dy: 0,
};

// 🪐 Spawning
export const BASE_SPAWN_INTERVAL = isMobile ? 2400 : 1500;
export const SPAWN_INTERVAL_DECREASE_PER_LEVEL = 70;