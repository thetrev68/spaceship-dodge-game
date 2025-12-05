import { log } from '@core/logger';

/**
 * Game Metrics Tracker
 *
 * Tracks detailed gameplay statistics for performance analysis
 * and game balance tuning.
 */

/**
 * @internal
 * Represents a complete game session with detailed statistics.
 *
 * @example
 * ```typescript
 * const session: GameSession = {
 *   sessionId: "session_1234567890_abc123",
 *   startTime: 1640995200000,
 *   endTime: 1640995260000,
 *   finalScore: 12500,
 *   finalLevel: 5,
 *   totalHits: 3,
 *   totalKills: 42,
 *   powerupsCollected: 2,
 *   bulletsFired: 150,
 *   accuracy: 28,
 *   survivalTime: 60
 * };
 * ```
 */
interface GameSession {
  /** Unique identifier for the game session */
  sessionId: string;
  /** Session start time in milliseconds since epoch */
  startTime: number;
  /** Session end time in milliseconds since epoch (undefined if ongoing) */
  endTime?: number;
  /** Final score achieved in the session */
  finalScore: number;
  /** Final level reached in the session */
  finalLevel: number;
  /** Total number of times the player was hit */
  totalHits: number;
  /** Total number of asteroids destroyed */
  totalKills: number;
  /** Total number of power-ups collected */
  powerupsCollected: number;
  /** Total number of bullets fired */
  bulletsFired: number;
  /** Shooting accuracy as a percentage (0-100) */
  accuracy: number;
  /** Total survival time in seconds */
  survivalTime: number;
}

/**
 * @internal
 */
export class GameMetrics {
  private currentSession: Partial<GameSession> | null = null;
  private sessions: GameSession[] = [];

  /**
   * Start a new game session
   */
  public startSession(): void {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      totalHits: 0,
      totalKills: 0,
      powerupsCollected: 0,
      bulletsFired: 0,
    };

    log.debug('[Metrics] Session started', { sessionId: this.currentSession.sessionId });
  }

  /**
   * End current session
   */
  public endSession(finalScore: number, finalLevel: number): void {
    if (!this.currentSession || !this.currentSession.startTime) return;

    const session: GameSession = {
      sessionId: this.currentSession.sessionId!,
      startTime: this.currentSession.startTime,
      endTime: Date.now(),
      finalScore,
      finalLevel,
      totalHits: this.currentSession.totalHits || 0,
      totalKills: this.currentSession.totalKills || 0,
      powerupsCollected: this.currentSession.powerupsCollected || 0,
      bulletsFired: this.currentSession.bulletsFired || 0,
      survivalTime: Math.floor((Date.now() - this.currentSession.startTime) / 1000),
      accuracy: this.calculateAccuracy(),
    };

    this.sessions.push(session);
    this.currentSession = null;

    log.info('[Metrics] Session ended', session);
  }

  /**
   * Record a bullet fired
   */
  public recordBulletFired(): void {
    if (this.currentSession) {
      this.currentSession.bulletsFired = (this.currentSession.bulletsFired || 0) + 1;
    }
  }

  /**
   * Record an asteroid destroyed
   */
  public recordKill(): void {
    if (this.currentSession) {
      this.currentSession.totalKills = (this.currentSession.totalKills || 0) + 1;
    }
  }

  /**
   * Record player hit
   */
  public recordHit(): void {
    if (this.currentSession) {
      this.currentSession.totalHits = (this.currentSession.totalHits || 0) + 1;
    }
  }

  /**
   * Record powerup collection
   */
  public recordPowerupCollected(): void {
    if (this.currentSession) {
      this.currentSession.powerupsCollected = (this.currentSession.powerupsCollected || 0) + 1;
    }
  }

  /**
   * Calculate shooting accuracy
   */
  private calculateAccuracy(): number {
    if (!this.currentSession || !this.currentSession.bulletsFired) return 0;
    return (this.currentSession.totalKills! / this.currentSession.bulletsFired!) * 100;
  }

  /**
   * Get all sessions
   */
  public getSessions(): readonly GameSession[] {
    return this.sessions;
  }

  /**
   * Get average statistics across all sessions
   */
  public getAverageStats(): {
    avgScore: number;
    avgLevel: number;
    avgSurvivalTime: number;
    avgAccuracy: number;
    totalSessions: number;
  } {
    if (this.sessions.length === 0) {
      return {
        avgScore: 0,
        avgLevel: 0,
        avgSurvivalTime: 0,
        avgAccuracy: 0,
        totalSessions: 0,
      };
    }

    const totals = this.sessions.reduce(
      (acc, session) => ({
        score: acc.score + session.finalScore,
        level: acc.level + session.finalLevel,
        survivalTime: acc.survivalTime + session.survivalTime,
        accuracy: acc.accuracy + session.accuracy,
      }),
      { score: 0, level: 0, survivalTime: 0, accuracy: 0 }
    );

    const count = this.sessions.length;

    return {
      avgScore: Math.round(totals.score / count),
      avgLevel: Math.round(totals.level / count),
      avgSurvivalTime: Math.round(totals.survivalTime / count),
      avgAccuracy: Math.round(totals.accuracy / count),
      totalSessions: count,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Export metrics data
   */
  public exportMetrics(): string {
    return JSON.stringify(
      {
        sessions: this.sessions,
        averages: this.getAverageStats(),
        exportDate: new Date().toISOString(),
      },
      null,
      2
    );
  }
}

export const gameMetrics = new GameMetrics();
