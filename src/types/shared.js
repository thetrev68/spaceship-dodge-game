/**
 * Shared type aliases used for JSDoc type checking.
 */

/**
 * @typedef {'START'|'PLAYING'|'PAUSED'|'GAME_OVER'|'LEVEL_TRANSITION'} GameStateValue
 * @typedef {{ x: number; y: number }} Vector2
 * @typedef {{ x: number; y: number; width: number; height: number; speed: number; dx: number; dy: number; overridePosition?: boolean }} PlayerState
 * @typedef {{ x: number; y: number; radius: number; dy: number; parentId?: number }} BulletState
 * @typedef {{ x: number; y: number; radius: number; dx: number; dy: number; id?: number; level?: number; parentId?: number; scoreValue?: number; creationTime?: number; rotation?: number; rotationSpeed?: number; speed?: number; shape?: Array<{x:number;y:number}> }} AsteroidState
 * @typedef {{ active: boolean; timer: number }} PowerUpState
 * @typedef {{ [key: string]: PowerUpState }} PowerUpMap
 * @typedef {{ backgroundMusic: number; soundEffects: number }} VolumeState
 * @typedef {{ bgm: HTMLAudioElement|null; [key: string]: HTMLAudioElement|null }} SoundMap
 * @typedef {ReturnType<typeof setTimeout>} TimerId
 */

export {};
