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