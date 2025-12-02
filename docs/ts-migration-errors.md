## Context
- git branch name: typescript-conversion
- last commit: b3d2e30 (local changes on top)
- Shared types now centralized in `src/types/index.ts` (legacy re-export in `src/types/shared.ts` for JSDoc paths).

## Typecheck / Lint / Tests (branch: typscript-conversion)
- `npm run typecheck` ✅ (2025-12-01)
- `npm run lint` ✅ (2025-12-01)
- `npm run test` ✅ (Vitest: math utils, pool manager, collision helper coverage)
- Recent work: converted remaining UI/input/game orchestration modules to `.ts`, added DOM helpers, tightened logger typings, removed `allowJs/checkJs` (and dropped `jsconfig.json`).

## Outstanding buckets
- Manual smoke on desktop/mobile overlays + audio unlock not exercised in this session.

## Quick reproduction
- Run: `npm run typecheck`, `npm run lint`, `npm run test`
- Last run: success (no diagnostics; unit tests green)
