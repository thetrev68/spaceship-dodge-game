/**
 * @fileoverview Lightweight performance HUD for FPS and timing metrics.
 */

let hudElement;
let enabled = false;
let lastRenderedText = '';

function ensureHudElement() {
  if (hudElement) return hudElement;
  hudElement = document.createElement('div');
  hudElement.id = 'perfHud';
  hudElement.style.position = 'fixed';
  hudElement.style.top = '12px';
  hudElement.style.left = '50%';
  hudElement.style.transform = 'translateX(-50%)';
  hudElement.style.padding = '6px 10px';
  hudElement.style.background = 'rgba(0, 0, 0, 0.7)';
  hudElement.style.color = '#00e7ff';
  hudElement.style.fontFamily = 'monospace';
  hudElement.style.fontSize = '12px';
  hudElement.style.zIndex = '999';
  hudElement.style.border = '1px solid rgba(0, 231, 255, 0.4)';
  hudElement.style.borderRadius = '6px';
  hudElement.style.display = 'none';
  hudElement.setAttribute('aria-hidden', 'true');
  document.body.appendChild(hudElement);
  return hudElement;
}

/**
 * Initializes the HUD element.
 */
export function initPerfHud() {
  ensureHudElement();
}

/**
 * Returns whether the HUD is currently enabled.
 * @returns {boolean}
 */
export function isPerfHudEnabled() {
  return enabled;
}

/**
 * Toggles HUD visibility.
 */
export function togglePerfHud() {
  setPerfHudEnabled(!enabled);
}

/**
 * Enables or disables the HUD.
 * @param {boolean} state - Desired enabled state.
 */
export function setPerfHudEnabled(state) {
  enabled = state;
  if (!hudElement) return;
  hudElement.style.display = enabled ? 'inline-flex' : 'none';
}

/**
 * Updates the HUD text.
 * @param {Object} params - Performance data.
 * @param {number} params.fps - Frames per second.
 * @param {number} params.frameMs - Total frame time in ms.
 * @param {number} params.logicMs - Logic/update time in ms.
 */
export function updatePerfHud({ fps, frameMs, logicMs }) {
  if (!enabled) return;
  const el = ensureHudElement();
  const text = `FPS ${fps.toFixed(0)} | frame ${frameMs.toFixed(1)}ms | logic ${logicMs.toFixed(1)}ms`;
  if (text === lastRenderedText) return;
  lastRenderedText = text;
  el.textContent = text;
}
