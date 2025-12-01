# TS Migration Plan — Phase 1: Foundations & Safety Net

Goals: enable type checking for existing JS with minimal disruption, surface real issues, and align tooling for a later TS conversion. This phase should be doable in a day and yields immediate safety without code churn.

## Steps
- **Create `tsconfig.json` (root) for checking JS**
  - `compilerOptions`: `allowJs: true`, `checkJs: true`, `noEmit: true`, `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `exactOptionalPropertyTypes: true`, `useUnknownInCatchVariables: true`, `noFallthroughCasesInSwitch: true`, `moduleResolution: bundler`, `module: ESNext`, `target: ES2022`.
  - `paths`: mirror `jsconfig` aliases (`@core/*`, `@game/*`, `@entities/*`, etc.).
  - `include`: `["src/**/*"]`; `exclude`: `["node_modules", "dist", "build"]`.
- **Add scripts**
  - In `package.json`, add `"typecheck": "tsc --noEmit"`.
  - Optionally add `"typecheck:watch": "tsc --noEmit --watch"` for iterative fixes.
- **Baseline run**
  - Run `npm run typecheck` to snapshot errors; save output in `docs/ts-migration-errors.md` (new file) for tracking and to avoid regressions during fixes.
- **Annotate and fix high-churn modules first**
  - `src/core/state.js`: add typedefs for `Player`, `Bullet`, `Asteroid`, `PowerUpState`, `GameStateValue`, and annotate exports. Guard mutations.
  - `src/game/gameLoop.js`: annotate params/returns, timers, frame counters; ensure nullable canvas/ctx checks.
  - `src/systems/soundManager.js`: type `sounds` map, `volumes`, and unlock flags; ensure `HTMLAudioElement | null` handling.
  - `src/ui/overlays/overlayManager.js`: annotate overlay elements as `HTMLElement|null`; define `GameOverlayState` string union in JSDoc.
  - `src/input/inputManager.js` / `mobileControls.js`: annotate event handlers (`KeyboardEvent`, `MouseEvent`, `TouchEvent`), guard against missing canvas.
  - `src/entities/*`: add typedefs for entity shapes and pools; document function inputs/outputs; ensure `update` functions have clear return type (void).
  - `src/utils/*`: annotate math helpers, canvas utils return types, platform detection.
- **Fix surfaced issues**
  - Add null checks around DOM queries (no blind `.textContent`).
  - Normalize return types (e.g., functions that sometimes return `undefined` vs value).
  - Resolve implicit `any` by annotating function params in JSDoc.
  - Tighten constant objects with `@readonly` / `@type` to lock shapes.
- **Documentation checkpoint**
  - Update `docs/ts-migration-errors.md` as items are fixed.
  - Note any blockers requiring code refactors in Phase 2.

## Exit criteria
- `npm run typecheck` passes on current JS (no TS files yet).
- No runtime behavior changes (manual smoke: start game, pause/resume, level transition).
- Key modules annotated; errors log cleared or tickets created for Phase 2 refactors.
