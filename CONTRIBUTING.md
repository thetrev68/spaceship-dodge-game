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

## Local Development Workflow

### Before Committing

Our pre-commit hooks will automatically:

- Fix ESLint issues
- Run tests for changed files
- Format code with Prettier

If hooks fail:

1. Review the errors
2. Fix any failing tests
3. Commit again

### Manual Quality Checks

Run full validation suite:

```bash
npm run validate
```

This runs:

- TypeScript type checking
- ESLint linting
- Full test suite with coverage (2x repeat for flake detection)

Individual checks:

- `npm run lint` - ESLint only
- `npm run typecheck` - TypeScript only
- `npm run test` - Tests only
- `npm run test:coverage` - Tests with coverage report

For UI/input changes, do a quick smoke test (start, pause/resume, level transition, settings open/close; touch on mobile).

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new powerup type` - New features
- `fix: resolve collision bug` - Bug fixes
- `docs: update README` - Documentation
- `test: add asteroid tests` - Tests
- `refactor: extract collision logic` - Code improvements
- `chore: update dependencies` - Maintenance
- `ci: update GitHub Actions workflow` - CI/CD changes

The commit-msg hook will validate your commit messages automatically.

### Pull Requests

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit (hooks will run automatically)
3. Push: `git push origin feat/my-feature`
4. Open PR on GitHub
5. Wait for CI to pass ✅
6. Request review

CI will automatically run:

- Type checking
- Linting
- Full test suite with coverage
- Build verification
- Bundle size check
- Lighthouse performance audit (on PRs to main)

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
