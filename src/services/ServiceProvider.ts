import type { IAudioService } from './interfaces/IAudioService.js';
import type { ICollisionService } from './interfaces/ICollisionService.js';
import type { IPoolService } from './interfaces/IPoolService.js';
import type { Asteroid, Bullet, SoundKey, SoundPlayOptions } from '@types';
import { debug } from '@core/logger.js';
import * as soundManager from '@systems/soundManager.js';
import { checkCollisions, resetCollisionState } from '@systems/collisionHandler.js';
import { ObjectPool } from '@systems/poolManager.js';

class AudioServiceAdapter implements IAudioService {
  unlock(): Promise<void> {
    return soundManager.forceAudioUnlock();
  }

  playSound(name: SoundKey, options?: SoundPlayOptions): void {
    if (options) {
      soundManager.playSound(name, options);
    } else {
      soundManager.playSound(name);
    }
  }

  startMusic(): void {
    soundManager.startMusic();
  }

  stopMusic(): void {
    soundManager.stopMusic();
  }

  setVolume(value: number): void {
    soundManager.setBackgroundMusicVolume(value);
    soundManager.setSoundEffectsVolume(value);
  }

  setBackgroundMusicVolume(value: number): void {
    soundManager.setBackgroundMusicVolume(value);
  }

  setSoundEffectsVolume(value: number): void {
    soundManager.setSoundEffectsVolume(value);
  }

  muteAll(): void {
    soundManager.muteAll();
  }

  unmuteAll(): void {
    soundManager.unmuteAll();
  }

  isMuted(): boolean {
    return soundManager.isAudioMuted();
  }
}

class CollisionServiceAdapter implements ICollisionService {
  checkCollisions(): void {
    checkCollisions();
  }

  reset(): void {
    resetCollisionState();
  }
}

class PoolServiceAdapter<T> implements IPoolService<T> {
  private active = 0;

  constructor(private readonly pool: ObjectPool<T>) {}

  acquire(): T | null {
    const item = this.pool.acquire();
    if (item) {
      this.active += 1;
      return item;
    }
    return null;
  }

  release(item: T): void {
    this.pool.release(item);
    this.active = Math.max(0, this.active - 1);
  }

  reset(): void {
    this.pool.clear();
    this.active = 0;
  }

  getStats(): { total: number; active: number; available: number } {
    const available = this.pool.size();
    return {
      total: available + this.active,
      active: this.active,
      available,
    };
  }
}

/**
 * Service provider (singleton)
 * Manages service instances and allows swapping implementations (e.g., for tests)
 * @internal
 */
class ServiceProvider {
  private static instance: ServiceProvider | null = null;

  public audioService: IAudioService;
  public collisionService: ICollisionService;
  public bulletPool: IPoolService<Bullet>;
  public asteroidPool: IPoolService<Asteroid>;

  private constructor() {
    this.audioService = new AudioServiceAdapter();
    this.collisionService = new CollisionServiceAdapter();
    this.bulletPool = new PoolServiceAdapter<Bullet>(new ObjectPool(() => this.createBullet()));
    this.asteroidPool = new PoolServiceAdapter<Asteroid>(
      new ObjectPool(() => this.createAsteroid())
    );

    debug('service', 'ServiceProvider initialized with default implementations');
  }

  static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }

  /**
   * Swaps audio service implementation (useful for testing)
   */
  setAudioService(service: IAudioService): void {
    this.audioService = service;
    debug('service', 'Audio service implementation swapped');
  }

  /**
   * Swaps collision service implementation
   */
  setCollisionService(service: ICollisionService): void {
    this.collisionService = service;
    debug('service', 'Collision service implementation swapped');
  }

  /**
   * Resets all services (useful for tests)
   */
  resetServices(): void {
    this.collisionService.reset();
    this.bulletPool.reset();
    this.asteroidPool.reset();
    debug('service', 'All services reset');
  }

  // Factory methods for pooled objects
  private createBullet(): Bullet {
    return {
      x: 0,
      y: 0,
      radius: 0,
      dy: 0,
      parentId: null,
    };
  }

  private createAsteroid(): Asteroid {
    return {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      radius: 0,
      id: 0,
      level: 0,
      parentId: null,
      scoreValue: 0,
      creationTime: 0,
      rotation: 0,
      rotationSpeed: 0,
      speed: 0,
      shape: [],
    };
  }
}

export const services = ServiceProvider.getInstance();
