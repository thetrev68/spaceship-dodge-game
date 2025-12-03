import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('@systems/soundManager.js', () => ({
  forceAudioUnlock: vi.fn().mockResolvedValue(undefined),
  playSound: vi.fn(),
  startMusic: vi.fn(),
  stopMusic: vi.fn(),
  setBackgroundMusicVolume: vi.fn(),
  setSoundEffectsVolume: vi.fn(),
  muteAll: vi.fn(),
  unmuteAll: vi.fn(),
  isAudioMuted: vi.fn(() => false),
}));

const resetCollisionState = vi.fn();
const checkCollisions = vi.fn();

vi.mock('@systems/collisionHandler.js', () => ({
  checkCollisions: (...args: unknown[]) => checkCollisions(...args),
  resetCollisionState: (...args: unknown[]) => resetCollisionState(...args),
}));

const poolAcquire = vi.fn();
const poolRelease = vi.fn();
const poolClear = vi.fn();
const poolSize = vi.fn(() => 0);

vi.mock('@systems/poolManager.js', () => {
  return {
    ObjectPool: class MockPool {
      acquire = (...args: unknown[]) => poolAcquire(...args);
      release = (...args: unknown[]) => poolRelease(...args);
      clear = (...args: unknown[]) => poolClear(...args);
      size = (...args: unknown[]) => poolSize(...args);
    }
  };
});

import { services } from '@services/ServiceProvider.js';
import * as soundManager from '@systems/soundManager.js';

describe('ServiceProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    services.resetServices();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('routes audio calls through audioService adapter', async () => {
    await services.audioService.unlock();
    services.audioService.playSound('fire');
    services.audioService.startMusic();
    services.audioService.stopMusic();
    services.audioService.setBackgroundMusicVolume(0.5);
    services.audioService.setSoundEffectsVolume(0.7);
    services.audioService.muteAll();
    services.audioService.unmuteAll();
    services.audioService.isMuted();

    expect(soundManager.forceAudioUnlock).toHaveBeenCalled();
    expect(soundManager.playSound).toHaveBeenCalledWith('fire');
    expect(soundManager.startMusic).toHaveBeenCalled();
    expect(soundManager.stopMusic).toHaveBeenCalled();
    expect(soundManager.setBackgroundMusicVolume).toHaveBeenCalledWith(0.5);
    expect(soundManager.setSoundEffectsVolume).toHaveBeenCalledWith(0.7);
    expect(soundManager.muteAll).toHaveBeenCalled();
    expect(soundManager.unmuteAll).toHaveBeenCalled();
    expect(soundManager.isAudioMuted).toHaveBeenCalled();
  });

  it('routes collision calls through collisionService adapter', () => {
    services.collisionService.checkCollisions();
    services.collisionService.reset();

    // resetServices() in beforeEach already calls reset once; account for that
    expect(checkCollisions).toHaveBeenCalledTimes(1);
    expect(resetCollisionState).toHaveBeenCalledTimes(2);
  });

  it('tracks pool stats across acquire and release', () => {
    poolSize.mockReturnValue(2);
    const bullet = { id: 1 } as unknown as object;
    poolAcquire.mockReturnValue(bullet);

    const acquired = services.bulletPool.acquire();
    expect(acquired).toBe(bullet);

    let stats = services.bulletPool.getStats();
    expect(stats.active).toBe(1);
    expect(stats.available).toBe(2);
    expect(stats.total).toBe(3);

    services.bulletPool.release(bullet);
    stats = services.bulletPool.getStats();
    expect(stats.active).toBe(0);
    expect(stats.available).toBe(2);
    expect(stats.total).toBe(2);

    services.bulletPool.reset();
    expect(poolClear).toHaveBeenCalled();
  });
});
