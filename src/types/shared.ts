/**
 * Shared type aliases used for JSDoc/TS type checking.
 */

export type GameStateValue = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_TRANSITION';

export type Vector2 = { x: number; y: number };

export type PlayerState = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dx: number;
  dy: number;
  overridePosition: { x: number; y: number } | null;
  [key: string]: any;
};

export type BulletState = {
  x: number;
  y: number;
  radius: number;
  dy: number;
  parentId: number | null;
  [key: string]: any;
};

export type AsteroidState = {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  id: number;
  level: number;
  parentId: number | null;
  scoreValue: number;
  creationTime: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  shape: Array<{ x: number; y: number }>;
  [key: string]: any;
};

export type PowerUpState = {
  active: boolean;
  timer: number;
  [key: string]: any;
};

export type PowerUpKey = 'doubleBlaster' | 'shield';

export type PowerUpMap = Record<PowerUpKey, PowerUpState>;

export type VolumeState = { backgroundMusic: number; soundEffects: number };

export type SoundMap = { bgm: HTMLAudioElement | null; [key: string]: HTMLAudioElement | null };

export type TimerId = number;
