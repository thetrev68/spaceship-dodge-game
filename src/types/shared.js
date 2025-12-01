/**
 * Shared type aliases used for JSDoc type checking.
 */

/**
 * @typedef {'START'|'PLAYING'|'PAUSED'|'GAME_OVER'|'LEVEL_TRANSITION'} GameStateValue
 * @typedef {{ x: number; y: number }} Vector2
 * @typedef {{ x: number; y: number; width: number; height: number; speed: number; dx: number; dy: number; overridePosition?: boolean; [key: string]: any }} PlayerState
 * @typedef {{ x: number; y: number; radius: number; dy: number; parentId?: number; [key: string]: any }} BulletState
 * @typedef {{ x: number; y: number; radius: number; dx: number; dy: number; id?: number; level?: number; parentId?: number; scoreValue?: number; creationTime?: number; rotation?: number; rotationSpeed?: number; speed?: number; shape?: Array<{x:number;y:number}>; [key: string]: any }} AsteroidState
 * @typedef {{ active: boolean; timer: number; [key: string]: any }} PowerUpState
 * @typedef {{ [key: string]: PowerUpState }} PowerUpMap
 * @typedef {{ backgroundMusic: number; soundEffects: number }} VolumeState
 * @typedef {{ bgm: HTMLAudioElement|null; [key: string]: HTMLAudioElement|null }} SoundMap
 * @typedef {number} TimerId
 */

export {};
