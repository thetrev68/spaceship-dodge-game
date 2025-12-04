import type { Player, PowerUpKey, PowerUpMap } from '@types';

/**
 * Player state management
 * Tracks player entity and active powerup effects
 * @internal
 */
class PlayerState {
  private _player: Player;
  private _powerUps: PowerUpMap;

  constructor() {
    this._player = this.createDefaultPlayer();
    this._powerUps = this.createDefaultPowerUps();
  }

  get player(): Player {
    return this._player;
  }

  setPlayer(player: Player | null): void {
    const next = player ?? this.createDefaultPlayer();
    Object.assign(this._player, next);
  }

  get powerUps(): PowerUpMap {
    return this._powerUps;
  }

  activatePowerup(type: PowerUpKey, frames: number): void {
    const powerup = this._powerUps[type];
    if (!powerup) return;
    powerup.active = true;
    powerup.timer = Math.max(0, frames);
  }

  clearPowerups(): void {
    (Object.keys(this._powerUps) as PowerUpKey[]).forEach((key) => {
      this._powerUps[key].active = false;
      this._powerUps[key].timer = 0;
    });
  }

  tickPowerups(): void {
    (Object.keys(this._powerUps) as PowerUpKey[]).forEach((key) => {
      const state = this._powerUps[key];
      if (!state.active) return;
      state.timer -= 1;
      if (state.timer <= 0) {
        state.active = false;
        state.timer = 0;
      }
    });
  }

  reset(): void {
    Object.assign(this._player, this.createDefaultPlayer());
    const defaults = this.createDefaultPowerUps();
    (Object.keys(defaults) as PowerUpKey[]).forEach((key) => {
      this._powerUps[key].active = defaults[key].active;
      this._powerUps[key].timer = defaults[key].timer;
    });
  }

  private createDefaultPlayer(): Player {
    return {
      x: 380,
      y: 500,
      width: 30,
      height: 45,
      speed: 7,
      dx: 0,
      dy: 0,
      overridePosition: null,
    };
  }

  private createDefaultPowerUps(): PowerUpMap {
    return {
      doubleBlaster: { active: false, timer: 0 },
      shield: { active: false, timer: 0 },
    };
  }
}

export const playerState = new PlayerState();
