import type {
  Asteroid,
  Bullet,
  GameStateValue,
  Player,
  PowerUpMap,
} from '@types';

type Watcher = () => void;
type ReactiveState<T extends object> = T & { watch: (fn: Watcher) => void };

function reactive<T extends object>(obj: T): ReactiveState<T> {
  const listeners = new Set<Watcher>();

  const proxy = new Proxy(obj, {
    set(target, key, value) {
      (target as Record<PropertyKey, unknown>)[key] = value;
      listeners.forEach(fn => fn());
      return true;
    },
  }) as ReactiveState<T>;

  proxy.watch = (fn: Watcher) => {
    listeners.add(fn);
  };

  return proxy;
}

export const gameState = reactive<{ value: GameStateValue }>({ value: 'START' });
export const score = reactive<{ value: number }>({ value: 0 });
export const gameLevel = reactive<{ value: number }>({ value: 0 });
export const playerLives = reactive<{ value: number }>({ value: 3 });

export const lastObstacleSpawnTime: { value: number } = { value: 0 };
export const levelStartTime: { value: number } = { value: 0 };
export const allowSpawning = reactive<{ value: boolean }>({ value: true });

export const bullets: Bullet[] = [];
export const obstacles: Asteroid[] = [];

export const powerUps: PowerUpMap = {
  doubleBlaster: { active: false, timer: 0 },
  shield: { active: false, timer: 0 },
};

export const player: Player = {
  x: 380,
  y: 500,
  width: 30,
  height: 45,
  speed: 7,
  dx: 0,
  dy: 0,
  overridePosition: null,
};
