/**
 * Centralized TypeScript types shared across the game.
 */

/** Nullable helper type. */
export type Nullable<T> = T | null;

/** Optional helper for selecting keys to make partial. */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Primitive values supported by ReadonlyConfig. */
export type Primitive = string | number | boolean | bigint | symbol | undefined | null;

/**
 * Deep readonly helper used for exported config objects.
 */
export type ReadonlyConfig<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<ReadonlyConfig<U>>
    : { readonly [K in keyof T]: ReadonlyConfig<T[K]> };

/**
 * Two-dimensional vector.
 */
export type Vector2 = {
  /** Horizontal component (pixels). */
  x: number;
  /** Vertical component (pixels). */
  y: number;
};

/** All possible game state values. */
export type GameStateValue = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_TRANSITION';
/** Overlay states mirror the game states. */
export type OverlayState = GameStateValue;

/** Text alignment options for HUD labels. */
export type HudTextAlign = 'left' | 'center' | 'right';

/** Supported power-up identifiers. */
export type PowerUpKey = 'doubleBlaster' | 'shield';

/** Power-up activation state. */
export type PowerUpState = {
  /** Whether the power-up is currently active. */
  active: boolean;
  /** Remaining duration in milliseconds. */
  timer: number;
};

/** Power-up activation map keyed by power-up type. */
export type PowerUpMap = Record<PowerUpKey, PowerUpState>;

/** Player render/movement state. */
export type Player = {
  /** Current x position (pixels). */
  x: number;
  /** Current y position (pixels). */
  y: number;
  /** Ship width (pixels). */
  width: number;
  /** Ship height (pixels). */
  height: number;
  /** Movement speed (pixels per frame). */
  speed: number;
  /** Current x velocity (pixels per frame). */
  dx: number;
  /** Current y velocity (pixels per frame). */
  dy: number;
  /** Optional override position for scripted moves. */
  overridePosition: Nullable<Vector2>;
};

/** Bullet instance tracked in state and rendering. */
export type Bullet = {
  /** Current x position (pixels). */
  x: number;
  /** Current y position (pixels). */
  y: number;
  /** Bullet radius (pixels). */
  radius: number;
  /** Vertical velocity (pixels per frame). */
  dy: number;
  /** Parent player id for ownership or null. */
  parentId: Nullable<number>;
};

/** Asteroid instance definition. */
export type Asteroid = {
  /** Current x position (pixels). */
  x: number;
  /** Current y position (pixels). */
  y: number;
  /** Asteroid radius (pixels). */
  radius: number;
  /** Horizontal velocity (pixels per frame). */
  dx: number;
  /** Vertical velocity (pixels per frame). */
  dy: number;
  /** Unique identifier. */
  id: number;
  /** Size level index. */
  level: number;
  /** Parent asteroid id when fragmented. */
  parentId: Nullable<number>;
  /** Score awarded on destruction. */
  scoreValue: number;
  /** Creation timestamp (ms). */
  creationTime: number;
  /** Current rotation angle (radians). */
  rotation: number;
  /** Rotation speed (radians per frame). */
  rotationSpeed: number;
  /** Current scalar speed (pixels per frame). */
  speed: number;
  /** Precomputed polygon shape points. */
  shape: ReadonlyArray<Vector2>;
};

/** User-configurable audio volumes. */
export type Volumes = {
  /** Background music volume (0-1). */
  backgroundMusic: number;
  /** Sound effects volume (0-1). */
  soundEffects: number;
};

/** Available sound asset identifiers. */
export type SoundKey = 'bgm' | 'fire' | 'break' | 'gameover' | 'levelup';
/** Map of audio elements keyed by sound id. */
export type SoundMap = Record<SoundKey, HTMLAudioElement | null>;

/** Difficulty scaling configuration. */
export type LevelConfig = {
  /** Base spawn interval for desktop (ms). */
  BASE_SPAWN_INTERVAL_DESKTOP: number;
  /** Base spawn interval for mobile (ms). */
  BASE_SPAWN_INTERVAL_MOBILE: number;
  /** Amount to decrease spawn interval per level (ms). */
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: number;
  /** Level at which difficulty scaling increases. */
  DIFFICULTY_SCALE_THRESHOLD: number;
  /** Level at which logarithmic scaling begins. */
  LOGARITHMIC_SCALE_START: number;
};

/** Core timing and geometry configuration. */
export type GameConfig = {
  /** Target frames per second. */
  TARGET_FPS: number;
  /** Frame duration derived from FPS (ms). */
  FRAME_DURATION: number;
  /** Maximum lifetime for entities (ms). */
  MAX_LIFETIME: number;
  /** Off-screen margin for spawning entities (pixels). */
  SPAWN_MARGIN: number;
};

/**
 * Color palette for theming all game visuals
 */
export type ColorPalette = {
  /** Player ship body color. */
  player: string;
  /** Player engine glow color. */
  playerEngine: string;
  /** Player shield color. */
  playerShield: string;
  /** Bullet projectile color. */
  bullet: string;
  /** Asteroid outline color. */
  asteroid: string;

  /** HUD text color. */
  hudText: string;
  /** HUD accent color (powerup, highlights). */
  hudAccent: string;
  /** Score popup text color. */
  scorePopup: string;
  /** Bonus popup text color. */
  bonusPopup: string;
  /** Powerup popup text color. */
  powerupPopup: string;

  /** Starfield particle color. */
  starfield: string;

  /** Shield powerup icon color. */
  powerupShield: string;
  /** Blaster powerup icon color. */
  powerupBlaster: string;
};

/**
 * UI color palette for theming menus, overlays, and buttons
 */
export type UIColorPalette = {
  /** Background color for overlays. */
  overlayBackground: string;
  /** Primary text color inside overlays. */
  overlayText: string;
  /** Title color for overlay headings. */
  overlayTitle: string;

  /** Button background color. */
  buttonBackground: string;
  /** Button text color. */
  buttonText: string;
  /** Button hover background color. */
  buttonHover: string;
  /** Button focus outline color. */
  buttonFocus: string;

  /** Settings button background color. */
  settingsButtonBackground: string;
  /** Settings button text color. */
  settingsButtonText: string;
};

/**
 * Font configuration for themed typography
 */
export type FontConfig = {
  /** Font family for UI and HUD text. */
  family: string;
  /** HUD font size (e.g., 24px). */
  hudSize: string;
};

/**
 * Rendering strategy for a single entity instance.
 * Receives entity data and renders it to the canvas.
 *
 * @template T - The entity type (Player, Asteroid, Bullet, etc.)
 */
export type EntityRenderer<T> = (ctx: CanvasRenderingContext2D, entity: T) => void;

/**
 * Background rendering strategy for full-screen effects.
 * Handles background rendering like starfield, ocean gradients, etc.
 */
export type BackgroundRenderer = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;

/**
 * Particle system renderer for theme-specific animated effects.
 * Provides setup and animation loop for particle systems.
 */
export type ParticleRenderer = {
  /** Initialize particle system with canvas dimensions */
  setup: (canvas: HTMLCanvasElement) => void;
  /** Animation loop function (called via requestAnimationFrame) */
  animate: () => void;
};

/**
 * Active powerup instance for rendering.
 * Internal type used by powerup system.
 *
 * @internal
 */
export type ActivePowerup = {
  x: number;
  y: number;
  size: number;
  type: PowerUpKey | null;
  dy: number;
};

/**
 * Complete rendering strategy set for a theme.
 * All fields are optional - falls back to default rendering if not provided.
 *
 * This enables themes to customize visual representation without duplicating
 * game logic. Renderers receive entity data (position, size, velocity) and
 * draw custom visuals while reusing all physics, collision, and spawning code.
 *
 * @example
 * ```typescript
 * const underwaterRenderers: ThemeRenderers = {
 *   player: drawSubmarine,      // Render player as submarine
 *   obstacle: drawJellyfish,    // Render asteroids as jellyfish
 *   bullet: drawTorpedo,        // Render bullets as torpedoes
 * };
 * ```
 */
export type ThemeRenderers = {
  /** Custom player rendering (e.g., spaceship → submarine) */
  player?: EntityRenderer<Player>;

  /** Custom obstacle rendering (e.g., asteroids → jellyfish) */
  obstacle?: EntityRenderer<Asteroid>;

  /** Custom bullet rendering (e.g., laser → torpedo) */
  bullet?: EntityRenderer<Bullet>;

  /** Custom powerup rendering by type */
  powerups?: {
    shield?: EntityRenderer<ActivePowerup>;
    doubleBlaster?: EntityRenderer<ActivePowerup>;
  };

  /** Custom background rendering (e.g., starfield → ocean gradient) */
  background?: BackgroundRenderer;

  /** Custom particle system (e.g., stars → plankton) */
  particles?: ParticleRenderer;
};

/**
 * Complete theme definition with UI support
 */
export type Theme = {
  /** Unique theme identifier. */
  id: ThemeId;
  /** Human-readable theme name. */
  name: string;
  /** User-facing description. */
  description: string;
  /** Color palette applied in rendering. */
  colors: ColorPalette;
  /** UI-specific color palette. */
  uiColors: UIColorPalette;
  /** Font configuration. */
  fonts: FontConfig;
  /** Custom rendering strategies (optional - falls back to defaults) */
  renderers?: ThemeRenderers;
};

/**
 * Valid theme identifiers
 *
 * Note: This type should be kept in sync with THEME_REGISTRY keys in themeConstants.ts.
 * Theme.id is now typed as ThemeId to enforce compile-time validation.
 */
export type ThemeId = 'default' | 'monochrome';
