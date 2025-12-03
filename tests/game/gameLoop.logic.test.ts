import { beforeEach, describe, expect, it, vi } from 'vitest';

let mockIsMobile = false;
const updatePlayer = vi.fn();
const updateObstacles = vi.fn();
const resetNewAsteroidsSpawned = vi.fn();
const updateBullets = vi.fn();
const updatePowerups = vi.fn();
const spawnPowerup = vi.fn();
const updateScorePopups = vi.fn();
const updateLevelFlow = vi.fn((cb: () => void) => cb());
const renderAll = vi.fn();
const showOverlay = vi.fn();
const updatePerfHud = vi.fn();
const checkCollisions = vi.fn();

const state = {
  gameState: { value: 'PLAYING' as 'PLAYING' | 'PAUSED' },
  lastObstacleSpawnTime: { value: 0 },
  gameLevel: { value: 1 },
  allowSpawning: { value: true },
  score: { value: 0 },
};

vi.mock('@entities/player.js', () => ({ updatePlayer: (...args: unknown[]) => updatePlayer(...args) }));
vi.mock('@entities/asteroid.js', () => ({
  updateObstacles: (...args: unknown[]) => updateObstacles(...args),
  resetNewAsteroidsSpawned: (...args: unknown[]) => resetNewAsteroidsSpawned(...args),
}));
vi.mock('@entities/bullet.js', () => ({ updateBullets: (...args: unknown[]) => updateBullets(...args) }));
vi.mock('@entities/powerup.js', () => ({
  updatePowerups: (...args: unknown[]) => updatePowerups(...args),
  spawnPowerup: (...args: unknown[]) => spawnPowerup(...args),
}));
vi.mock('@ui/hud/scorePopups.js', () => ({ updateScorePopups: (...args: unknown[]) => updateScorePopups(...args) }));
vi.mock('@game/flowManager.js', () => ({ updateLevelFlow: (cb: () => void) => updateLevelFlow(cb), resetLevelFlow: vi.fn() }));
vi.mock('@systems/renderManager.js', () => ({ renderAll: (...args: unknown[]) => renderAll(...args) }));
vi.mock('@ui/overlays/overlayManager.js', () => ({ showOverlay: (...args: unknown[]) => showOverlay(...args) }));
vi.mock('@ui/hud/perfHUD.js', () => ({ updatePerfHud: (...args: unknown[]) => updatePerfHud(...args) }));
vi.mock('@services/ServiceProvider.js', () => ({
  services: { collisionService: { checkCollisions: (...args: unknown[]) => checkCollisions(...args) } },
}));
vi.mock('@utils/platform.js', () => ({ isMobile: () => mockIsMobile }));
vi.mock('@core/state.js', () => state);

describe('gameLoop logic', () => {
  let requestCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockIsMobile = false;
    state.gameState.value = 'PLAYING';
    requestCallback = null;
    global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      requestCallback = cb;
      return 1;
    }) as unknown as typeof requestAnimationFrame;
    global.cancelAnimationFrame = vi.fn() as unknown as typeof cancelAnimationFrame;
    // Deterministic Date and performance for spawn/perf HUD timing
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
  });

  it('runs a full update pass and renders when playing', async () => {
    const mockCtx = {
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const canvas = Object.assign(document.createElement('canvas'), {
      width: 640,
      height: 480,
      getContext: vi.fn(() => mockCtx),
    }) as HTMLCanvasElement;

    const perfTimes = [0, 5, 600];
    vi.spyOn(performance, 'now').mockImplementation(() => perfTimes.shift() ?? 600);

    const { setCanvas, restartGameLoop } = await import('@game/gameLoop.js');
    setCanvas(canvas);
    restartGameLoop();

    expect(requestCallback).toBeTypeOf('function');
    requestCallback?.(16);
    requestCallback?.(50);

    expect(updatePlayer).toHaveBeenCalled();
    expect(updateObstacles).toHaveBeenCalledWith(canvas.width, canvas.height, expect.any(Number), state.lastObstacleSpawnTime, state.allowSpawning.value);
    expect(updateBullets).toHaveBeenCalled();
    expect(updatePowerups).toHaveBeenCalledWith(canvas.height);
    expect(spawnPowerup).toHaveBeenCalledWith(canvas.width);
    expect(checkCollisions).toHaveBeenCalled();
    expect(updateLevelFlow).toHaveBeenCalled();
    expect(renderAll).toHaveBeenCalledWith(mockCtx);
    expect(updatePerfHud).toHaveBeenCalledWith(expect.objectContaining({ fps: expect.any(Number) }));
  });

  it('skips render every other frame on mobile', async () => {
    mockIsMobile = true;
    const mockCtx = {
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const canvas = Object.assign(document.createElement('canvas'), {
      width: 320,
      height: 240,
      getContext: vi.fn(() => mockCtx),
    }) as HTMLCanvasElement;

    vi.spyOn(performance, 'now').mockReturnValue(0);

    const { setCanvas, restartGameLoop } = await import('@game/gameLoop.js');
    setCanvas(canvas);
    restartGameLoop();

    requestCallback?.(16);
    expect(renderAll).not.toHaveBeenCalled();

    // Next frame should render
    requestCallback?.(32);
    expect(renderAll).toHaveBeenCalled();
  });
});
