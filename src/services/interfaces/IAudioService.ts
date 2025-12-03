/**
 * Audio service interface
 * Abstracts audio playback for testing and flexibility
 */
export interface IAudioService {
  /**
   * Unlocks audio context (required for mobile browsers)
   */
  unlock(): Promise<void>;

  /**
   * Plays a sound effect by name
   * @param name - Sound identifier (e.g., 'fire', 'break')
   */
  playSound(name: string): void;

  /**
   * Starts background music loop
   */
  startMusic(): void;

  /**
   * Stops background music
   */
  stopMusic(): void;

  /**
   * Sets master volume
   * @param value - Volume level (0.0 to 1.0)
   */
  setVolume(value: number): void;

  /**
   * Mutes all audio
   */
  muteAll(): void;

  /**
   * Unmutes all audio
   */
  unmuteAll(): void;

  /**
   * Checks if audio is currently muted
   */
  isMuted(): boolean;
}
