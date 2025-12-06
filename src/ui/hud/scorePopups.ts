/**
 * @module ui/hud/scorePopups
 * Score popup display with object pooling.
 */

import { isMobile } from '@utils/platform.js';
import { ObjectPool } from '@systems/poolManager.js';
import { ANIMATION_CONSTANTS, HUD_CONSTANTS } from '@core/gameConstants.js';
import { eventBus } from '@core/events/EventBus.js';
import {
  GameEvent,
  type AsteroidDestroyedEvent,
  type BonusAwardedEvent,
  type PowerupCollectedEvent,
  type PowerupExpiredEvent,
} from '@core/events/GameEvents.js';
import { getCurrentTheme } from '@core/themes';
import { formatNumber } from '@utils/formatNumber.js';

type ScorePopup = { text: string; x: number; y: number; opacity: number; color: string };

const scorePopups: ScorePopup[] = [];

const scorePopupPool = new ObjectPool<ScorePopup>(() => ({
  text: '',
  x: 0,
  y: 0,
  opacity: HUD_CONSTANTS.GLOBAL_ALPHA,
  color: '', // Always assigned before use in addScorePopup
}));

let subscribersRegistered = false;

export function initializeScorePopups(): void {
  if (subscribersRegistered) return;
  subscribersRegistered = true;

  eventBus.on<AsteroidDestroyedEvent>(GameEvent.ASTEROID_DESTROYED, (data) => {
    const theme = getCurrentTheme();
    addScorePopup(
      `+${formatNumber(data.score)}`,
      data.position.x,
      data.position.y,
      theme.colors.scorePopup
    );
  });

  eventBus.on<BonusAwardedEvent>(GameEvent.BONUS_AWARDED, (data) => {
    const theme = getCurrentTheme();
    addScorePopup(
      `+${formatNumber(data.bonusAmount)} (${data.bonusType})`,
      data.position.x,
      data.position.y,
      theme.colors.bonusPopup
    );
  });

  eventBus.on<PowerupCollectedEvent>(GameEvent.POWERUP_COLLECTED, (data) => {
    const theme = getCurrentTheme();
    addScorePopup(
      `Power-up! ${data.type}`,
      data.position.x,
      data.position.y,
      theme.colors.powerupPopup
    );
  });

  // Powerup expiration is now handled silently - powerup just disappears from HUD
  // No popup notification needed (was appearing behind HUD)
  eventBus.on<PowerupExpiredEvent>(GameEvent.POWERUP_EXPIRED, () => {
    // Silent expiration - powerup is removed from HUD automatically
  });
}

function addScorePopup(text: string, x: number, y: number, color?: string): void {
  const skipForMobile = isMobile() && import.meta.env.MODE !== 'test';
  if (skipForMobile) return;

  const popup = scorePopupPool.acquire();

  popup.text = text;
  popup.x = x;
  popup.y = y;
  popup.opacity = HUD_CONSTANTS.GLOBAL_ALPHA;
  popup.color = color ?? getCurrentTheme().colors.scorePopup;

  scorePopups.push(popup);
}

export function updateScorePopups(): void {
  const skipForMobile = isMobile() && import.meta.env.MODE !== 'test';
  if (skipForMobile) return;

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
  const skipForMobile = isMobile() && import.meta.env.MODE !== 'test';
  if (skipForMobile) return;

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

// Auto-register listeners for production and tests (idempotent)
initializeScorePopups();
