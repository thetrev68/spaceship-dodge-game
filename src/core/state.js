/**
 * @fileoverview Global game state management with reactive objects.
 * Created: 2025-05-28
 * Author: ChatGPT + Trevor Clark
 */

/**
 * Creates a minimal reactive object with watchers.
 * @param {Object} obj - The object to make reactive.
 * @returns {Proxy} The reactive proxy object with a watch method.
 */
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

/**
 * Reactive game state object.
 * @constant {Proxy}
 */
export const gameState = reactive({ value: 'START' });

/**
 * Reactive score object.
 * @constant {Proxy}
 */
export const score = reactive({ value: 0 });

/**
 * Reactive game level object.
 * @constant {Proxy}
 */
export const gameLevel = reactive({ value: 0 });

/**
 * Reactive player lives object.
 * @constant {Proxy}
 */
export const playerLives = reactive({ value: 3 });

/**
 * Last obstacle spawn time.
 * @constant {Object}
 * @property {number} value - Timestamp.
 */
export const lastObstacleSpawnTime = { value: 0 };

/**
 * Level start time.
 * @constant {Object}
 * @property {number} value - Timestamp.
 */
export const levelStartTime = { value: 0 };

/**
 * Reactive flag for allowing spawning.
 * @constant {Proxy}
 */
export const allowSpawning = reactive({ value: true });

/**
 * Array of active bullets.
 * @type {Array}
 */
export const bullets = [];

/**
 * Array of active obstacles.
 * @type {Array}
 */
export const obstacles = [];

/**
 * Power-up states.
 * @constant {Object}
 * @property {Object} doubleBlaster - Double blaster power-up state.
 * @property {boolean} doubleBlaster.active - Whether active.
 * @property {number} doubleBlaster.timer - Timer value.
 * @property {Object} shield - Shield power-up state.
 * @property {boolean} shield.active - Whether active.
 * @property {number} shield.timer - Timer value.
 */
export const powerUps = {
  doubleBlaster: { active: false, timer: 0 },
  shield: { active: false, timer: 0 },
};

/**
 * Player state object.
 * @constant {Object}
 * @property {number} x - X position.
 * @property {number} y - Y position.
 * @property {number} width - Width.
 * @property {number} height - Height.
 * @property {number} speed - Movement speed.
 * @property {number} dx - X velocity.
 * @property {number} dy - Y velocity.
 */
export const player = {
  x: 380,
  y: 500,
  width: 30,
  height: 45,
  speed: 7,
  dx: 0,
  dy: 0,
};