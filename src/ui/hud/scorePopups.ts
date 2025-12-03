/**
 * @fileoverview Score popup display with object pooling.
 */

import { isMobile } from '@utils/platform.js';
import { ObjectPool } from '@systems/poolManager.js';
import { ANIMATION_CONSTANTS, HUD_CONSTANTS } from '@core/gameConstants.js';
import { eventBus } from '@core/events/EventBus.js';
import { GameEvent, type AsteroidDestroyedEvent, type BonusAwardedEvent, type PowerupCollectedEvent, type PowerupExpiredEvent } from '@core/events/GameEvents.js';

type ScorePopup = { text: string; x: number; y: number; opacity: number; color: string };

const scorePopups: ScorePopup[] = [];

const scorePopupPool = new ObjectPool<ScorePopup>(() => ({
  text: '',
  x: 0,
  y: 0,
  opacity: HUD_CONSTANTS.GLOBAL_ALPHA,
  color: '#ffffff',
}));

let subscribersRegistered = false;

export function initializeScorePopups(): void {
  if (subscribersRegistered) return;
  subscribersRegistered = true;

  eventBus.on<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, (data) => {
    addScorePopup(`+${data.score}`, data.position.x, data.position.y);
  });

  eventBus.on<BonusAwardedEvent>(GameEvent.BONUS_AWARDED, (data) => {
    addScorePopup(`+${data.bonusAmount} (${data.bonusType})`, data.position.x, data.position.y, '#00ff00');
  });

  eventBus.on<PowerupCollectedEvent>(GameEvent.POWERUP_COLLECTED, (data) => {
    addScorePopup(`Power-up! ${data.type}`, data.position.x, data.position.y, '#00ffff');
  });

  eventBus.on<PowerupExpiredEvent>(GameEvent.POWERUP_EXPIRED, (data) => {
    addScorePopup(`${data.type} expired`, 40, 60, '#ffaa00');
  });
}

export function addScorePopup(text: string, x: number, y: number, color = '#ffffff'): void {
  if (isMobile()) return;

  const popup = scorePopupPool.acquire();

  popup.text = text;
  popup.x = x;
  popup.y = y;
  popup.opacity = HUD_CONSTANTS.GLOBAL_ALPHA;
  popup.color = color;

  scorePopups.push(popup);
}

export function updateScorePopups(): void {
  if (isMobile()) return;

  for (let i = scorePopups.length - 1; i >= 0; i -= 1) {
    const popup = scorePopups[i];
    if (!popup) continue;
    popup.y -= ANIMATION_CONSTANTS.SCORE_POPUP_FALL_SPEED;
    popup.opacity -= ANIMATION_CONSTANTS.SCORE_POPUP_FADE_SPEED;

    if (popup.opacity <= 0) {
      scorePopups.splice(i, 1);
      scorePopupPool.release(popup);
    }
  }
}

export function drawScorePopups(ctx: CanvasRenderingContext2D): void {
  if (isMobile()) return;

  ctx.font = '16px Inter';
  scorePopups.forEach((popup) => {
    ctx.globalAlpha = popup.opacity;
    ctx.fillStyle = popup.color;
    ctx.fillText(popup.text, popup.x, popup.y);
  });
  ctx.globalAlpha = HUD_CONSTANTS.GLOBAL_ALPHA;
}

/**
 * Test helper - returns the current number of active score popups.
 * @internal - For test use only
 */
export function __getTestPopupCount(): number {
  return scorePopups.length;
}
