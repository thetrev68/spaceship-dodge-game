## Context
- git branch name: typescript-conversion
- last commit: b3d2e30 (local changes on top)
- Shared types now centralized in `src/types/index.ts` (legacy re-export in `src/types/shared.ts` for JSDoc paths).

## Typecheck / Lint status (branch: typscript-conversion)
- `npm run typecheck` ✅ (after Phase 2 conversions)
- `npm run lint` ✅ (ESLint now configured for TS via `typescript-eslint`)
- Recent work: converted core constants/state, utils, systems (render/collision/pool/sound), entities (player/bullet/asteroid/powerup), and starfield effect to `.ts`; added shared types module and Vite env types.

## Outstanding buckets
- None flagged. Next focus is remaining UI/input modules in Phase 3 once shared DOM helpers are ready.

## Quick reproduction
- Run: `npm run typecheck` and `npm run lint`
- Last run: success (no diagnostics)
