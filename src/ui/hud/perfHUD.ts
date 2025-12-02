/**
 * @fileoverview Lightweight performance HUD for FPS and timing metrics.
 */

let hudElement: HTMLDivElement | null = null;
let enabled = false;
let lastRenderedText = '';

function ensureHudElement(): HTMLDivElement {
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

export function initPerfHud(): void {
  ensureHudElement();
}

function _isPerfHudEnabled(): boolean {
  return enabled;
}

export function togglePerfHud(): void {
  setPerfHudEnabled(!enabled);
}

function setPerfHudEnabled(state: boolean): void {
  enabled = state;
  const el = ensureHudElement();
  el.style.display = enabled ? 'inline-flex' : 'none';
}

export function updatePerfHud({ fps, frameMs, logicMs }: { fps: number; frameMs: number; logicMs: number }): void {
  if (!enabled) return;
  const el = ensureHudElement();
  const text = `FPS ${fps.toFixed(0)} | frame ${frameMs.toFixed(1)}ms | logic ${logicMs.toFixed(1)}ms`;
  if (text === lastRenderedText) return;
  lastRenderedText = text;
  el.textContent = text;
}
