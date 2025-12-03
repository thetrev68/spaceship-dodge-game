import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameEvent } from '@core/events/GameEvents.js';
let mockIsMobile = false;
const emitSpy = vi.fn();

vi.mock('@utils/platform.js', () => ({ isMobile: () => mockIsMobile }));
vi.mock('@core/events/EventBus.js', () => ({ eventBus: { emit: (...args: unknown[]) => emitSpy(...args) } }));
vi.mock('@core/events/GameEvents.js', async () => {
  const actual = await vi.importActual<typeof import('@core/events/GameEvents.js')>('@core/events/GameEvents.js');
  return actual;
});

// Use the real state module so timers/powerups update normally
let state = await import('@core/state.js');

async function loadPowerups() {
  return import('@entities/powerup.js');
}

describe('powerup behaviors', () => {
  beforeEach(async () => {
    vi.resetModules();
    state = await import('@core/state.js');
    mockIsMobile = false;
    emitSpy.mockClear();
    // Reset player and powerup state
    state.playerState.player.x = 0;
    state.playerState.player.y = 0;
    state.playerState.player.width = 50;
    state.playerState.player.height = 50;
    Object.values(state.playerState.powerUps).forEach((p) => {
      p.active = false;
      p.timer = 0;
    });
  });

  it('spawns powerups with pooled objects and correct type', async () => {
    const { activePowerups, spawnPowerup } = await loadPowerups();
    activePowerups.length = 0;
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.2).mockReturnValueOnce(0.7);

    spawnPowerup(400);
    expect(activePowerups).toHaveLength(1);
    const spawned = activePowerups[0]!;
    expect(spawned).toMatchObject({ type: 'shield', dy: 1.5 });
    expect(spawned.x).toBeLessThan(400);
  });

  it('collects powerups, activates state, and emits events', async () => {
    const { activePowerups, updatePowerups } = await loadPowerups();
    activePowerups.length = 0;
    activePowerups.push({ x: 0, y: 0, size: 50, type: 'doubleBlaster', dy: 0 });
    state.playerState.player.x = 10;
    state.playerState.player.y = 10;

    await updatePowerups(200);

    const collectedCall = emitSpy.mock.calls.find((args) => args[0] === 'powerup:collected') as [GameEvent, unknown] | undefined;
    expect(collectedCall).toBeTruthy();
    expect(state.playerState.powerUps.doubleBlaster.active).toBe(true);
    expect(activePowerups).toHaveLength(0);
  });

  it('expires timers and emits expiration events', async () => {
    const { updatePowerups } = await loadPowerups();
    state.playerState.powerUps.shield.active = true;
    state.playerState.powerUps.shield.timer = 1;

    await updatePowerups(200);
    const expiredCall = emitSpy.mock.calls.find((args) => args[0] === 'powerup:expired');
    expect(expiredCall).toBeTruthy();
    expect(state.playerState.powerUps.shield.active).toBe(false);
  });

  it('renders powerups for both desktop and mobile styles', async () => {
    const gradientStops = vi.fn();
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      lineTo: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fillStyle: '',
      shadowColor: '',
      shadowBlur: 0,
      createRadialGradient: vi.fn(() => ({ addColorStop: gradientStops })),
    } as unknown as CanvasRenderingContext2D;

    mockIsMobile = false;
    let module = await loadPowerups();
    module.activePowerups.length = 0;
    module.activePowerups.push({ x: 5, y: 5, size: 50, type: 'doubleBlaster', dy: 0 });
    module.activePowerups.push({ x: 10, y: 10, size: 50, type: 'shield', dy: 0 });
    module.drawPowerups(ctx);
    expect(module.activePowerups).toHaveLength(2);
    expect(gradientStops).toHaveBeenCalled();

    // Re-import in mobile mode to exercise simplified shapes
    vi.resetModules();
    mockIsMobile = true;
    emitSpy.mockClear();
    module = await loadPowerups();
    module.activePowerups.length = 0;
    module.activePowerups.push({ x: 1, y: 1, size: 40, type: 'doubleBlaster', dy: 0 });
    module.activePowerups.push({ x: 2, y: 2, size: 40, type: 'shield', dy: 0 });
    module.drawPowerups(ctx);
    expect(ctx.rect).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  });
});
