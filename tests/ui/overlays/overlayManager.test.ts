import { describe, it, expect, beforeEach, vi } from 'vitest';
import { showOverlay } from '@ui/overlays/overlayManager';
import { playerLives, score, gameLevel, gameState } from '@core/state';
import { services } from '@services/ServiceProvider';

vi.mock('@services/ServiceProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@services/ServiceProvider')>();
  return {
    ...actual,
    services: {
      ...actual.services,
      audioService: {
        playSound: vi.fn(),
        stopMusic: vi.fn(),
        startMusic: vi.fn(),
        unlock: vi.fn(),
        setBackgroundMusicVolume: vi.fn(),
        setSoundEffectsVolume: vi.fn(),
        muteAll: vi.fn(),
        unmuteAll: vi.fn(),
        isMuted: vi.fn(() => false),
      },
    },
  };
});

function setupDOM() {
  document.body.innerHTML = `
    <div id="startOverlay" class="game-overlay"></div>
    <div id="gameOverOverlay" class="game-overlay"></div>
    <div id="levelTransitionOverlay" class="game-overlay"></div>
    <div id="pauseOverlay" class="game-overlay"></div>
    <div id="liveRegionStatus"></div>
    <div id="liveRegionScore"></div>
    <div id="finalScore"></div>
    <div id="levelUpMessage"></div>
    <div id="currentLevelInfo"></div>
    <div id="currentScoreInfo"></div>
    <button id="startButton"></button>
    <button id="continueButton"></button>
    <button id="quitButton"></button>
    <div id="tapToContinueMobile"></div>
    <div id="desktopControlHint"></div>
    <div id="mobileControlHint"></div>
    <div id="pauseResumeMessage"></div>
    <canvas id="gameCanvas"></canvas>
  `;
}

describe('overlayManager showOverlay', () => {
  beforeEach(() => {
    setupDOM();
    gameState.value = 'START';
    score.value = 0;
    gameLevel.value = 0;
    playerLives.value = 3;
  });

  it('shows game over overlay and stops music', () => {
    showOverlay('GAME_OVER', 123, 2);
    const overlay = document.getElementById('gameOverOverlay');
    expect(overlay?.classList.contains('visible')).toBe(true);
    expect(services.audioService.stopMusic as ReturnType<typeof vi.fn>).toHaveBeenCalled();
    expect(document.getElementById('finalScore')?.textContent).toContain('123');
  });

  it('shows pause overlay and stops music', () => {
    showOverlay('PAUSED');
    const overlay = document.getElementById('pauseOverlay');
    expect(overlay?.classList.contains('visible')).toBe(true);
    expect(services.audioService.stopMusic as ReturnType<typeof vi.fn>).toHaveBeenCalled();
  });
});
