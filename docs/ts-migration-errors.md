## Context
- git branch name: typescript-conversion
- last commit: b3d2e30 (local changes on top)
- `npm run typecheck` currently **passes**.
- Shared types live in `src/types/shared.ts` (imported via `import('../types/shared.js')` JSDoc).

## Typecheck status (branch: typscript-conversion)
- Command: `npm run typecheck` (green)
- Recent work: typed object pools/entities (asteroid/bullet/powerup), collision grid, sound manager/settings/input/overlays guards, HUD typings.

## Outstanding buckets
- None right now. Next steps are Phase 2/3 conversions (convert modules to `.ts`, keep shared types centralized) while keeping typecheck green.

## Quick reproduction
- Run: `npm run typecheck`
- Last run: ✅ success (no diagnostics)
