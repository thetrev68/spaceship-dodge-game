import type { Player, PowerUpKey, PowerUpMap } from '@types';

/**
 * Player state management
 * Tracks player entity and active powerup effects
 * @internal
 */
export class PlayerState {
  private _player: Player;
  private _powerUps: PowerUpMap;

  constructor() {
    this._player = this.createDefaultPlayer();
    this._powerUps = this.createDefaultPowerUps();
  }

  /**
   * Get the current player entity
   * @returns The player object with position, velocity, and dimensions
   */
  get player(): Player {
    return this._player;
  }

  /**
   * Update the player entity state
   * @param player - New player object, or null to reset to defaults
   *
   * @example
   * ```typescript
   * playerState.setPlayer({ ...playerState.player, x: 100, y: 200 });
   * playerState.setPlayer(null); // Reset to default position
   * ```
   */
  setPlayer(player: Player | null): void {
    const next = player ?? this.createDefaultPlayer();
    Object.assign(this._player, next);
  }

  /**
   * Get the current powerup states
   * @returns Map of powerup types to their active state and remaining duration
   */
  get powerUps(): PowerUpMap {
    return this._powerUps;
  }

  /**
   * Activate a powerup with specified duration
   * @param type - Powerup type to activate ('doubleBlaster' or 'shield')
   * @param frames - Duration in frames (60 frames = 1 second at 60 FPS)
   *
   * @example
   * ```typescript
   * // Activate shield for 5 seconds (300 frames)
   * playerState.activatePowerup('shield', 300);
   * ```
   */
  activatePowerup(type: PowerUpKey, frames: number): void {
    const powerup = this._powerUps[type];
    if (!powerup) return;
    powerup.active = true;
    powerup.timer = Math.max(0, frames);
  }

  /**
   * Deactivate all powerups immediately
   *
   * @example
   * ```typescript
   * playerState.clearPowerups(); // Called on player death
   * ```
   */
  clearPowerups(): void {
    (Object.keys(this._powerUps) as PowerUpKey[]).forEach((key) => {
      this._powerUps[key].active = false;
      this._powerUps[key].timer = 0;
    });
  }

  /**
   * Decrement powerup timers and deactivate expired powerups
   * Called once per frame from game loop
   *
   * @example
   * ```typescript
   * // In game loop
   * playerState.tickPowerups();
   * ```
   */
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

  /**
   * Reset player and powerup state to defaults
   * Called on game restart
   *
   * @example
   * ```typescript
   * playerState.reset(); // Start new game
   * ```
   */
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
