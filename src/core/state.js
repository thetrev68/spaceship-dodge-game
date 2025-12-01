/**
 * @fileoverview Global game state management with reactive objects.
 * Created: 2025-05-28
 * Author: ChatGPT + Trevor Clark
 */

/**
 * @template T extends object
 * @typedef {T & { watch: (fn: () => void) => void }} ReactiveState<T>
 */

/**
 * Creates a minimal reactive object with watchers.
 * @template T extends object
 * @param {T} obj - The object to make reactive.
 * @returns {ReactiveState<T>} The reactive proxy object with a watch method.
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

  // @ts-ignore - augment proxy
  proxy.watch = (fn) => listeners.add(fn);
  return /** @type {ReactiveState<T>} */ (proxy);
}

/**
 * @typedef {'START'|'PLAYING'|'PAUSED'|'GAME_OVER'|'LEVEL_TRANSITION'} GameStateValue
 * @typedef {{ active: boolean, timer: number }} PowerUpState
 * @typedef {{ x: number, y: number, width: number, height: number, speed: number, dx: number, dy: number }} PlayerState
 * @typedef {{ x: number, y: number, radius: number, dy: number, parentId?: number }} BulletState
 * @typedef {{ x: number, y: number, radius: number, dx: number, dy: number, id?: number, level?: number, parentId?: number, scoreValue?: number }} AsteroidState
 */

/**
 * Reactive game state object.
 * @constant {ReactiveState<{ value: GameStateValue }>}
 */
export const gameState = reactive({ value: 'START' });

/**
 * Reactive score object.
 * @constant {ReactiveState<{ value: number }>}
 */
export const score = reactive({ value: 0 });

/**
 * Reactive game level object.
 * @constant {ReactiveState<{ value: number }>}
 */
export const gameLevel = reactive({ value: 0 });

/**
 * Reactive player lives object.
 * @constant {ReactiveState<{ value: number }>}
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
 * @constant {ReactiveState<{ value: boolean }>}
 */
export const allowSpawning = reactive({ value: true });

/**
 * Array of active bullets.
 * @type {BulletState[]}
 */
export const bullets = [];

/**
 * Array of active obstacles.
 * @type {AsteroidState[]}
 */
export const obstacles = [];

/**
 * Power-up states.
 * @constant {{ [key: string]: PowerUpState }}
 */
export const powerUps = {
  doubleBlaster: { active: false, timer: 0 },
  shield: { active: false, timer: 0 },
};

/**
 * Player state object.
 * @constant {PlayerState}
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
