import { gameState, playerLives, isMobile } from './state.js';

const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const levelTransitionOverlay = document.getElementById('levelTransitionOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const levelUpMessage = document.getElementById('levelUpMessage');
const currentLevelInfo = document.getElementById('currentLevelInfo');
const currentScoreInfo = document.getElementById('currentScoreInfo');

const livesInfoStart = document.getElementById('livesInfoStart');
const livesInfoLevel = document.getElementById('livesInfoLevel');
const livesInfoPause = document.getElementById('livesInfoPause');

const pauseText = document.getElementById('pauseResumeMessage');
const startText = document.getElementById('startHint');

export function showOverlay(state, score = 0, level = 0) {
  const overlays = [startOverlay, pauseOverlay, gameOverOverlay, levelTransitionOverlay];
  overlays.forEach(overlay => {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  });

  if (livesInfoStart) livesInfoStart.textContent = `Lives: ${playerLives.value}`;
  if (livesInfoLevel) livesInfoLevel.textContent = `Lives: ${playerLives.value}`;
  if (livesInfoPause) livesInfoPause.textContent = `Lives: ${playerLives.value}`;

  switch (state) {
    case 'START':
      if (startText) {
        startText.textContent = isMobile
          ? 'Touch and Hold the Screen to Begin'
          : 'Press SPACE or Left Mouse Click to fire!';
      }
      startOverlay.classList.remove('hidden');
      startOverlay.classList.add('flex');
      break;

    case 'GAME_OVER':
      import('./soundManager.js').then(m => m.stopMusic());
      finalScoreDisplay.textContent = `Final Score: ${score} (Level ${level + 1})`;
      gameOverOverlay.classList.remove('hidden');
      gameOverOverlay.classList.add('flex');
      break;

    case 'LEVEL_TRANSITION':
      import('./soundManager.js').then(m => m.stopMusic());
      levelUpMessage.textContent = `LEVEL ${level + 1} !`;
      currentLevelInfo.textContent = `Get Ready!`;
      currentScoreInfo.textContent = `Score: ${score}`;
      levelTransitionOverlay.classList.remove('hidden');
      levelTransitionOverlay.classList.add('flex');
      break;

    case 'PAUSED':
      import('./soundManager.js').then(m => m.stopMusic());
      if (pauseText) {
        pauseText.textContent = isMobile
          ? 'Touch and Hold to Resume'
          : 'Press P to Resume';
      }
      pauseOverlay.classList.remove('hidden');
      pauseOverlay.classList.add('flex');
      break;

    case 'PLAYING':
      document.querySelectorAll('.game-overlay').forEach(ov => {
        ov.classList.add('hidden');
        ov.classList.remove('flex');
      });
      import('./soundManager.js').then(m => m.startMusic());
      break;

    default:
      break;
  }

  document.dispatchEvent(new Event('gameStateChange'));
}

export function initializeCanvas(canvas) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw < 600) {
    canvas.width = 480;
    canvas.height = 854;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.objectFit = 'contain';
    canvas.style.display = 'block';
    canvas.style.backgroundColor = 'black';
  } else {
    canvas.width = vw * 0.9;
    canvas.height = vh * 0.9;
    canvas.style.width = '';
    canvas.style.height = '';
    canvas.style.objectFit = '';
    canvas.style.backgroundColor = '';
  }
}

export function quitGame() {
  const confirmed = confirm('Are you sure you want to quit the game?');
  if (!confirmed) return;

  Promise.all([
    import('./soundManager.js'),
    import('./state.js'),
    import('./ui.js')
  ]).then(([soundManager, state, ui]) => {
    soundManager.stopMusic();
    state.gameState.value = 'GAME_OVER';
    state.bullets.length = 0;
    state.obstacles.length = 0;

    Object.keys(state.powerUps).forEach(key => {
      state.powerUps[key].active = false;
      state.powerUps[key].timer = 0;
    });

    soundManager.playSound('gameover');
    ui.showOverlay('GAME_OVER', state.score.value, state.gameLevel.value);
  });
}

export function setOverlayDimensions(canvas) {
  const canvasRect = canvas.getBoundingClientRect();
  [startOverlay, gameOverOverlay, levelTransitionOverlay, pauseOverlay].forEach(overlay => {
    overlay.style.width = canvasRect.width + 'px';
    overlay.style.height = canvasRect.height + 'px';
    overlay.style.left = canvasRect.left + 'px';
    overlay.style.top = canvasRect.top + 'px';
  });
}