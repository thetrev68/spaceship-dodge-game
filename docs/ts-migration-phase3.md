# TS Migration Plan — Phase 3: UI, Build, and Cleanup

Goals: finish converting UI/DOM modules, solidify build tooling, and remove legacy JS/compat baggage. This phase has the most DOM nullability/typing work; plan for careful testing.

## Steps
- **Add DOM helper utilities**
  - Create `src/utils/dom.ts` with helpers like `getById<T extends HTMLElement>(id): T | null`, `requireById<T>(id): T` (throws or logs), `isHTMLElement`.
  - Add `EventKey` string union for keyboard controls (e.g., `'ArrowUp' | 'w' | 'P' | 'Enter' | ' ' | 'Escape'`).
- **Convert UI/DOM modules**
  - `src/ui/overlays`, `src/ui/hud`, `src/ui/settings`, `src/ui/controls`, `src/input` to `.ts` using DOM helpers and `OverlayState` union from shared types.
  - Replace inline `document.getElementById` with `getById/requireById`; handle nullable nodes gracefully with fallbacks or early returns.
  - Type settings UI state, event handlers (`KeyboardEvent`, `PointerEvent`, `TouchEvent`), and aria/live region elements as `HTMLElement | null`.
  - Use discriminated unions for overlay states and keyboard actions to avoid stringly-typed logic.
- **Finalize audio/platform typing**
  - Ensure `soundManager.ts` uses `SoundKey` unions; type Web Audio hooks if adding them; guard autoplay/unlock flow types.
  - Type mobile vibration/platform checks and feature flags in `platform.ts`.
- **Testing and validation**
  - Add light unit tests for pure functions (math utils, collision math, pool manager). A minimal Vitest setup is fine; keep scope small.
  - Run `npm run typecheck`, `npm run lint`, and manual smoke tests (desktop + mobile/touch emulation: start, pause/resume, level transition, settings open/close).
- **Build/tooling cleanup**
  - Remove `allowJs` and `checkJs` once all source is `.ts`; optionally delete JSDoc type comments replaced by TS.
  - Update `tailwind.config.js` / `vite.config.js` to `.ts` if desired; ensure `ts-node`/`tsx` support or inline type-friendly config.
  - Simplify `jsconfig.json` (or remove) if `tsconfig.json` covers IDE support.

## Exit criteria
- All source modules are `.ts` with strict settings passing (no `allowJs`).
- No leftover dual JS/TS implementations or stale JSDoc type comments.
- `npm run typecheck`, `npm run lint`, and manual smoke tests pass; build artifacts unchanged functionally.
