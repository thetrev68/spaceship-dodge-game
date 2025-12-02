import type { OverlayState } from '@types';

export type EventKey =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'w'
  | 'a'
  | 's'
  | 'd'
  | 'f'
  | 'F'
  | 'p'
  | 'P'
  | 'Enter'
  | ' '
  | 'Escape';

export function isHTMLElement<T extends HTMLElement = HTMLElement>(node: unknown): node is T {
  return node instanceof HTMLElement;
}

export function getById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  const el = document.getElementById(id);
  return isHTMLElement<T>(el) ? el : null;
}

export function requireById<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = getById<T>(id);
  if (!el) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return el;
}

export function isOverlayState(state: string): state is OverlayState {
  return state === 'START' || state === 'PLAYING' || state === 'PAUSED' || state === 'GAME_OVER' || state === 'LEVEL_TRANSITION';
}
