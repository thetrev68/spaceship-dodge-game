# Contributing to Spaceship Dodge

Thanks for your interest in improving the game! This guide outlines the preferred workflow, coding standards, and quality checks.

## Getting Started
- Use Node 20+.
- Install dependencies with `npm install`.
- Run the game locally with `npm run dev`.

## Branching & Commits
- Work off feature branches from `feature-adds` (or the current mainline branch).
- Keep commits focused and descriptive. Example: `feat: add shield cooldown HUD`, `chore: tighten collision typing`.

## Coding Standards
- Language: TypeScript for all source (`src/**/*`). Avoid new `.js` files.
- Paths: Use existing aliases (`@core`, `@game`, `@entities`, `@systems`, `@ui`, `@utils`, `@types`).
- Null safety: Prefer helper utilities in `src/utils/dom.ts` for DOM access; handle nullable elements explicitly.
- Types: Import shared types from `@types`; avoid `any`. Keep discriminated unions for game/overlay states.
- Style: Follow lint rules in `eslint.config.js`. Prefer small, pure functions where possible.

## Testing & Quality
- Run before opening a PR:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- For UI/input changes, do a quick smoke test (start, pause/resume, level transition, settings open/close; touch on mobile).

## Documentation
- Update `README.md`, `UPGRADE_NOTES.md`, or relevant docs when changing behavior or adding features.
- Keep `docs/ts-migration-errors.md` in sync with new typecheck/lint status if you adjust TS build health.

## Accessibility & UX
- Use proper focus management for overlays and modals; avoid hiding focused elements (see `overlayManager.ts`).
- Keep keyboard support for primary actions (start, pause, continue). Ensure touch parity.

## Submitting
- Open a PR with a concise summary, testing notes, and any outstanding risks.
- Prefer small, reviewable PRs. If a change is large, include a checklist of touched areas.

Thank you for contributing! 🚀
