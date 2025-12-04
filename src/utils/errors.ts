import { stopGameLoop } from '@game/gameLoop.js';
import { error as logError, warn as logWarn } from '@core/logger.js';

/**
 * @fileoverview Custom error classes for game-specific error handling.
 *
 * Provides structured error types with recoverability metadata to enable
 * centralized error handling with appropriate user feedback and logging.
 *
 * ## Error Hierarchy
 * - GameError (base)
 *   - AudioError (recoverable)
 *   - CanvasError (non-recoverable)
 *   - AssetError (non-recoverable)
 *
 * ## Usage Pattern
 * ```
 * try {
 *   // Risky operation
 *   initializeCanvas();
 * } catch (err) {
 *   handleError(err); // Centralized error handling
 * }
 * ```
 *
 * @see handleError - Centralized error handler with user feedback
 */

/**
 * Base game error class with recoverability metadata.
 * All game-specific errors should extend this class.
 *
 * ## Recoverability
 * - **Recoverable** (true): Game can continue without this feature
 *   - Example: Audio fails -> Mute game, continue playing
 * - **Non-recoverable** (false): Game cannot function
 *   - Example: Canvas fails -> Show error overlay, halt game
 *
 * ## Error Codes
 * Unique codes for debugging and logging:
 * - `AUDIO_ERROR` - Audio system failures
 * - `CANVAS_ERROR` - Canvas rendering failures
 * - `ASSET_ERROR` - Asset loading failures
 * - `UNKNOWN_ERROR` - Unexpected errors
 *
 * @example
 * ```
 * throw new GameError(
 *   'Failed to initialize audio context',
 *   'AUDIO_ERROR',
 *   true // recoverable - can play without sound
 * );
 * ```
 */
class GameError extends Error {
  /**
   * Creates a new game error with metadata
   *
   * @param message - Human-readable error description
   * @param code - Unique error code for debugging (e.g., "AUDIO_ERROR")
   * @param recoverable - Whether game can continue after this error
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = true
  ) {
    super(message);
    this.name = 'GameError';

    // Maintain proper stack trace in V8 (Chrome, Node.js)
    type CaptureStackTrace = (
      target: object,
      ctor?: abstract new (...args: unknown[]) => unknown
    ) => void;
    const capture = (Error as typeof Error & { captureStackTrace?: CaptureStackTrace })
      .captureStackTrace;
    if (typeof capture === 'function') {
      capture(this, GameError as unknown as abstract new (...args: unknown[]) => unknown);
    }
  }
}

/**
 * Audio system errors (typically recoverable).
 * Game can continue in muted state if audio fails.
 *
 * ## Common Causes
 * - Browser autoplay policy blocking audio
 * - Missing audio files (404 errors)
 * - Unsupported audio codec
 * - Audio context initialization failure
 *
 * ## Recovery Strategy
 * - Log warning to console
 * - Mute game audio
 * - Continue gameplay silently
 * - Show mute icon in UI
 *
 * @example
 * ```
 * export async function forceAudioUnlock(): Promise<void> {
 *   try {
 *     const silentAudio = sounds.get('silence');
 *     if (!silentAudio) {
 *       throw new AudioError(
 *         'Silent audio file not loaded - cannot unlock audio context',
 *         true
 *       );
 *     }
 *     await silentAudio.play();
 *   } catch (err) {
 *     throw new AudioError(`Audio unlock failed: ${err.message}`, true);
 *   }
 * }
 * ```
 */
export class AudioError extends GameError {
  /**
   * @param message - Error description
   * @param recoverable - Whether audio is optional (default: true)
   */
  constructor(message: string, recoverable = true) {
    super(message, 'AUDIO_ERROR', recoverable);
    this.name = 'AudioError';
  }
}

/**
 * Canvas rendering errors (non-recoverable).
 * Game cannot display without a working canvas.
 *
 * ## Common Causes
 * - Canvas element not found in DOM
 * - Failed to get 2D rendering context
 * - Browser does not support HTML5 Canvas
 *
 * ## Recovery Strategy
 * - Show fatal error overlay
 * - Display browser compatibility message
 * - Halt game loop
 *
 * @example
 * ```
 * const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
 * if (!canvas) {
 *   throw new CanvasError('Canvas element #gameCanvas not found in DOM');
 * }
 *
 * const ctx = canvas.getContext('2d');
 * if (!ctx) {
 *   throw new CanvasError('Failed to get 2D rendering context - browser may not support Canvas API');
 * }
 * ```
 */
export class CanvasError extends GameError {
  /**
   * @param message - Error description
   */
  constructor(message: string) {
    super(message, 'CANVAS_ERROR', false); // Always non-recoverable
    this.name = 'CanvasError';
  }
}

export class AssetError extends GameError {
  /**
   * @param message - Error description
   */
  constructor(message: string) {
    super(message, 'ASSET_ERROR', false); // Always non-recoverable
    this.name = 'AssetError';
  }
}

/**
 * Asset loading errors (non-recoverable).
 * Game cannot function with missing critical assets.
 *
 * ## Common Causes
 * - Missing audio files (sounds/music)
 * - 404 errors on asset URLs
 * - Network failures during asset loading
 *
 * ## Recovery Strategy
 * - Show loading error overlay
 * - Display specific missing asset
 * - Provide retry button
 * - Halt game initialization
 *
 * @example
 * ```
 * export async function loadAudio(name: string, path: string): Promise<void> {
 *   try {
 *     const audio = new Audio();
 *     audio.src = path;
 *     await audio.load();
 *     sounds.set(name, audio);
 *   } catch (err) {
 *     throw new AssetError(`Failed to load audio file: ${path}`);
 *   }
 * }
 * ```
 */
/**
 * Centralized error handler with user feedback and logging.
 *
 * ## Behavior
 * - **Recoverable errors**: Log warning, continue game
 * - **Non-recoverable errors**: Show fatal error overlay, halt game
 * - **Unknown errors**: Treat as non-recoverable for safety
 *
 * ## Error Handling Flow
 * ```
 * handleError(err)
 *   |- Is GameError?
 *   |  |- Recoverable?
 *   |  |  |- Yes -> Log warning, continue
 *   |  |  `- No -> Show overlay, halt game
 *   |  `- Log with error code
 *   `- Unknown error -> Treat as non-recoverable
 * ```
 *
 *
 * @param error - Error to handle (GameError or generic Error)
 *
 * @example
 * ```
 * // In main initialization
 * try {
 *   await loadAllAssets();
 *   initializeCanvas();
 *   startGameLoop();
 * } catch (err) {
 *   handleError(err); // Shows appropriate UI based on error type
 * }
 *
 * // In audio system
 * export function startMusic(): void {
 *   try {
 *     if (!isAudioUnlocked) {
 *       throw new AudioError('Audio context locked - awaiting user gesture', true);
 *     }
 *     bgMusic.play();
 *   } catch (err) {
 *     handleError(err); // Logs warning, continues silently
 *   }
 * }
 * ```
 */
export function handleError(err: Error): void {
  if (err instanceof GameError) {
    // Structured error with metadata
    logError('error', `[${err.code}] ${err.message}`, {
      recoverable: err.recoverable,
      stack: err.stack,
    });

    if (!err.recoverable) {
      // Fatal error - show overlay and halt
      showFatalErrorOverlay(err.message, err.code);
      stopGameLoop();
    } else {
      // Recoverable - log and continue
      logWarn('error', `Recoverable error: ${err.message}`);
    }
  } else {
    // Unknown error type - treat as fatal
    logError('error', 'Unexpected error:', err);
    showFatalErrorOverlay(
      'An unexpected error occurred. Please refresh the page.',
      'UNKNOWN_ERROR'
    );
    stopGameLoop();
  }
}

/**
 * Shows fatal error overlay to user (stub - implementation in overlayManager).
 * @param message - User-friendly error message
 * @param code - Error code for debugging
 */
function showFatalErrorOverlay(message: string, code: string): void {
  // TODO: Implement in overlayManager.ts
  console.error(`FATAL ERROR [${code}]: ${message}`);
  alert(`Fatal Error: ${message}\n\nError Code: ${code}\n\nPlease refresh the page.`);
}
