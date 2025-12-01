# TS Migration Plan — Phase 2: Incremental TS Conversion

Goals: convert low-risk modules to `.ts`, establish shared types, and reduce JS surface area gradually while keeping the game runnable after each batch. Aim for 2–3 day chunks with checkpoints.

## Steps
- **Create shared types module**
  - Add `src/types/index.ts` exporting interfaces/types: `GameStateValue`, `Player`, `Bullet`, `Asteroid`, `PowerUp`, `PowerUpKey` (string union), `Volumes`, `SoundKey`, `LevelConfig`, `GameConfig`, `HudTextAlign`, `OverlayState` (string union), `Vector2`.
  - Define `ReadonlyConfig<T>` helper for configs, `Nullable<T> = T | null`, `Optional<T, K extends keyof T>` if needed.
  - Consider `as const` objects for enums (game states, sound keys, power-up keys) and derive unions via `keyof`.
- **Convert low-dependency modules first**
  - `src/utils/*` → `.ts` (math, canvas utils, platform checks). Adjust exports to named exports if needed; keep API stable.
  - `src/core/constants.js`, `uiConstants.js`, `gameConstants.js` → `.ts` using `ReadonlyConfig<T>`, `as const` for literal safety.
  - Add `types` imports where referenced (HUD constants, game config).
- **Migrate core state**
  - Convert `src/core/state.js` → `state.ts`. Replace ad-hoc `reactive` proxy with a typed helper or keep it but type the proxy via an interface `{ value: T; watch(fn: () => void): void; }`.
  - Type arrays: `export const bullets: Bullet[] = [];`, `obstacles: Asteroid[] = [];`.
  - Type `powerUps` state with `PowerUpKey`-indexed object.
- **Systems conversion (batch)**
  - `src/systems/renderManager.js`, `collisionHandler.js`, `poolManager.js`, `soundManager.js` → `.ts`.
  - For `soundManager`, type the sounds map (`Record<SoundKey, HTMLAudioElement | null>`) and volume controls; keep Web Audio hook for later if desired.
  - Resolve any `any` by adding small interfaces for collision results, renderables, etc.
- **Effects/entities conversion**
  - Convert `src/entities/*` and `src/effects/*` to `.ts` once shared types are stable.
  - Ensure update functions carry typed params (`canvasWidth: number`, etc.) and return `void`.
- **UI input/controls postponed**
  - Keep UI/overlays/input in JS until shared DOM helpers exist (Phase 3), but update imports to accept TS neighbors.
- **Tooling updates**
  - Update `tsconfig.json`: keep `allowJs: true` during transition; add `"include": ["src/**/*"]`.
  - Ensure ESLint config understands TS (`@typescript-eslint/parser` / plugin) or add a minimal override for `.ts`.
  - Keep `npm run typecheck` (`tsc --noEmit`) green after each batch.
- **Checkpoints**
  - After constants/utils/state conversion, run: `npm run typecheck`, `npm run lint`, and a quick `npm run dev` smoke (start, shoot, pause).
  - Track any API surface changes in `docs/ts-migration-errors.md` or a short changelog.

## Exit criteria
- Majority of non-UI utilities and core/state are `.ts`.
- Shared types imported across systems/entities; no duplicate type definitions.
- `npm run typecheck` passes with `strict` settings; game runs in dev after each batch.
