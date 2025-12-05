/**
 * Centralized TypeScript types shared across the game.
 */

/**
 * @internal
 */
type _Nullable<T> = T | null;

/**
 * @internal
 */
type _Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * @internal
 */
type Primitive = string | number | boolean | bigint | symbol | undefined | null;

export type ReadonlyConfig<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<ReadonlyConfig<U>>
    : { readonly [K in keyof T]: ReadonlyConfig<T[K]> };

export type Vector2 = { x: number; y: number };

export type GameStateValue = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_TRANSITION';
export type OverlayState = GameStateValue;

export type HudTextAlign = 'left' | 'center' | 'right';

export type PowerUpKey = 'doubleBlaster' | 'shield';

/**
 * @internal
 */
type _PowerUp = { active: boolean; timer: number };

export type PowerUpMap = Record<PowerUpKey, _PowerUp>;

export type Player = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dx: number;
  dy: number;
  overridePosition: _Nullable<Vector2>;
};

export type Bullet = {
  x: number;
  y: number;
  radius: number;
  dy: number;
  parentId: number | null;
};

export type Asteroid = {
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
  shape: Vector2[];
};

export type Volumes = { backgroundMusic: number; soundEffects: number };
export type SoundKey = 'bgm' | 'fire' | 'break' | 'gameover' | 'levelup';
export type SoundMap = Record<SoundKey, HTMLAudioElement | null>;

export type LevelConfig = {
  BASE_SPAWN_INTERVAL_DESKTOP: number;
  BASE_SPAWN_INTERVAL_MOBILE: number;
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: number;
  DIFFICULTY_SCALE_THRESHOLD: number;
  LOGARITHMIC_SCALE_START: number;
};

export type GameConfig = {
  TARGET_FPS: number;
  FRAME_DURATION: number;
  MAX_LIFETIME: number;
  SPAWN_MARGIN: number;
};

/**
 * Color palette for theming all game visuals
 */
export type ColorPalette = {
  // Entity colors
  player: string;
  playerEngine: string;
  playerShield: string;
  bullet: string;
  asteroid: string;

  // UI colors
  hudText: string;
  hudAccent: string;
  scorePopup: string;
  bonusPopup: string;
  powerupPopup: string;

  // Effects
  starfield: string;

  // Powerup specific
  powerupShield: string;
  powerupBlaster: string;
};

/**
 * Font configuration for themed typography
 */
export type FontConfig = {
  family: string;
  hudSize: string;
};

/**
 * Complete theme definition
 */
export type Theme = {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  fonts: FontConfig;
};

/**
 * Valid theme identifiers
 */
export type ThemeId = 'default' | 'monochrome';
