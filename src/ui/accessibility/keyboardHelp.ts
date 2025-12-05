import { log } from '@core/logger';
import { isMobile } from '@utils/platform';

/**
 * Keyboard Shortcuts Help System
 *
 * Provides an accessible reference for all keyboard controls.
 * Accessible via '?' key or help button.
 */

interface Shortcut {
  key: string;
  action: string;
  group: 'movement' | 'actions' | 'system';
}

const SHORTCUTS: Shortcut[] = [
  // Movement
  { key: 'W / ↑', action: 'Move up', group: 'movement' },
  { key: 'A / ←', action: 'Move left', group: 'movement' },
  { key: 'S / ↓', action: 'Move down', group: 'movement' },
  { key: 'D / →', action: 'Move right', group: 'movement' },
  { key: 'Mouse', action: 'Move to cursor position', group: 'movement' },

  // Actions
  { key: 'Space', action: 'Fire bullets', group: 'actions' },
  { key: 'Click', action: 'Fire bullets at cursor', group: 'actions' },

  // System
  { key: 'P', action: 'Pause / Resume game', group: 'system' },
  { key: 'M', action: 'Mute / Unmute audio', group: 'system' },
  { key: '?', action: 'Show this help', group: 'system' },
];

export function initializeKeyboardHelp(): void {
  // Skip on mobile
  if (isMobile()) return;

  // Add '?' key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      toggleKeyboardHelp();
    }
  });

  log.debug('Keyboard help initialized (press ? to view)');
}

function toggleKeyboardHelp(): void {
  const overlay = document.getElementById('keyboard-help-overlay') as HTMLDivElement | null;

  if (!overlay) {
    showKeyboardHelp();
    return;
  }

  hideKeyboardHelp();
}

function showKeyboardHelp(): void {
  let overlay = document.getElementById('keyboard-help-overlay') as HTMLDivElement | null;

  if (!overlay) {
    overlay = createKeyboardHelpOverlay();
  }

  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');

  // Focus first close button
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.close-button');
  closeBtn?.focus();

  log.debug('Keyboard help displayed');
}

function hideKeyboardHelp(): void {
  const overlay = document.getElementById('keyboard-help-overlay') as HTMLDivElement | null;
  if (!overlay) return;

  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');

  log.debug('Keyboard help hidden');
}

function createKeyboardHelpOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'keyboard-help-overlay';
  overlay.className = 'game-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-labelledby', 'keyboard-help-title');
  overlay.setAttribute('aria-modal', 'true');

  // Group shortcuts by category
  const groupedShortcuts: {
    movement: Shortcut[];
    actions: Shortcut[];
    system: Shortcut[];
  } = {
    movement: [],
    actions: [],
    system: [],
  };

  SHORTCUTS.forEach((shortcut) => {
    groupedShortcuts[shortcut.group].push(shortcut);
  });

  overlay.innerHTML = `
    <div class="overlay-content">
      <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>

      <div class="shortcuts-container">
        <section>
          <h3>Movement</h3>
          <dl class="shortcuts-list">
            ${groupedShortcuts.movement.map((s) => `<dt>${s.key}</dt><dd>${s.action}</dd>`).join('')}
          </dl>
        </section>

        <section>
          <h3>Actions</h3>
          <dl class="shortcuts-list">
            ${groupedShortcuts.actions.map((s) => `<dt>${s.key}</dt><dd>${s.action}</dd>`).join('')}
          </dl>
        </section>

        <section>
          <h3>System</h3>
          <dl class="shortcuts-list">
            ${groupedShortcuts.system.map((s) => `<dt>${s.key}</dt><dd>${s.action}</dd>`).join('')}
          </dl>
        </section>
      </div>

      <button class="close-button" aria-label="Close keyboard shortcuts">
        Close (Esc)
      </button>
    </div>
  `;

  // Add event listeners
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.close-button');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideKeyboardHelp);
  }

  // Escape key to close
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideKeyboardHelp();
    }
  });

  document.body.appendChild(overlay);

  return overlay;
}
