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
