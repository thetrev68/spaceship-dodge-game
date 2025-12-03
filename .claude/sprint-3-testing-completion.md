# Sprint 3: Testing Completion & Quality Gates

## Goal
Reach **85%+ test coverage** with stable, event-driven integration coverage, and wire quality gates (coverage thresholds, flake checks) using the refactored architecture from Sprint 2.

## Prerequisites
- Sprint 1 & 2 completed (state split, services, event bus in place)
- `npm run test`, `npm run typecheck`, `npm run lint` currently green
- Vitest 4 configured with jsdom and test setup in `tests/setup.ts`

## Scope
1) Finish unit/integration tests for all gameplay flows (state + services + events)  
2) Add UI/input coverage via event-driven patterns  
3) Enforce coverage thresholds and flake detection in CI scripts  
4) Optional: lightweight perf guardrails for hot paths

---

## Part 1: Coverage Targets & Harness Updates

### 1.1 Tighten Coverage Thresholds
- Update `vitest.config.ts` coverage thresholds to **85/85/80/85** (lines/functions/branches/statements).  
- Add `test:coverage` script (if missing): `vitest run --coverage`.

### 1.2 Flake Detection Script
- Add `npm run test:repeat` → `vitest run --repeat 3` to catch flaky suites.
- Document in README/CLAUDE.md how/when to use (pre-PR gate).

---

## Part 2: Unit Tests — Services, Events, State (High ROI)

### 2.1 ServiceProvider + Adapters
- File: `tests/services/serviceProvider.test.ts`
- Cases:
  - `audioService` routes to soundManager methods (spy on soundManager).
  - `collisionService.reset()` clears spatial grid (spy on collision handler reset).
  - Pool adapters track `active/available` correctly on acquire/release/reset.

### 2.2 Event Bus & GameEvents Contracts
- File: `tests/core/eventBus.test.ts`
- Cases: `on/off/emit`, multiple handlers, handler errors not breaking others, `clear/clearAll`.
- Add payload contract tests for emitted events (shape validation using simple type guards).

### 2.3 State Modules
- File: `tests/core/stateModules.test.ts`
- Cases:
  - `entityState` swap-and-pop for bullets/obstacles.
  - `playerState` powerup timers expire & reset.
  - `addScore` increments total; no negative lives underflows.

---

## Part 3: Gameplay Flow Integration (Event-Driven)

### 3.1 Collision → Events → UI
- File: `tests/integration/collisionEvents.test.ts`
- Arrange: seed obstacles/bullets via `entityState`; stub `services.audioService`.
- Assert:
  - `GameEvent.ASTEROID_DESTROYED` emitted with position/score/level.
  - `GameEvent.BONUS_AWARDED` emitted when fragments completed.
  - `scorePopups` subscriber adds popup entries (can spy on internal array length via exported helper or event side effect).

### 3.2 Level Flow & Game State
- File: `tests/game/flowManager.events.test.ts`
- Assert `LEVEL_UP` & `LEVEL_TRANSITION_START` events fire when screen clears; audio service called via ServiceProvider.
- File: `tests/game/gameStateManager.events.test.ts`
- Assert `GAME_STARTED`, `GAME_RESUMED`, `GAME_PAUSED`, `GAME_OVER` events fire on transitions; verify audio service usage.

### 3.3 Powerups
- File: `tests/entities/powerup.events.test.ts`
- Assert `POWERUP_COLLECTED` & `POWERUP_EXPIRED` events fire; timers tick; playerState powerups cleared on expiry.

---

## Part 4: UI & Input Tests (jsdom-focused)

### 4.1 Overlays & HUD
- File: `tests/ui/overlays/overlayManager.test.ts`
- Cases:
  - `showOverlay` toggles visibility/aria/inert, updates lives/score text.
  - Pause/level/game over flows call audio service via ServiceProvider.

### 4.2 HUD Score Popups
- File: `tests/ui/hud/scorePopups.test.ts`
- Simulate `GameEvent.ASTEROID_DESTROYED`, `BONUS_AWARDED`, `POWERUP_COLLECTED/EXPIRED`; assert popup queue increments and animates down (y decreases) on `updateScorePopups`.

### 4.3 Input (Desktop & Mobile)
- Files: `tests/input/inputManager.test.ts`, `tests/input/mobileControls.test.ts`
- Cases:
  - Pause toggle emits events & calls audio service.
  - Fire throttling (cooldown) respected.
  - Touch drag moves player; touchend pauses & mutes.
  - Overlay interactions ignored when overlay active.

---

## Part 5: Performance & Regression Guards (Optional but Recommended)

### 5.1 Spatial Grid Performance Smoke
- File: `tests/perf/collisionHandler.perf.test.ts`
- Time `checkCollisions` with 500 obstacles/300 bullets (use `performance.now` mock); assert duration < 16ms budget (loose, but catches regressions).

### 5.2 Render Loop Guard (Lightweight)
- File: `tests/perf/gameLoop.perf.test.ts`
- Mock `renderAll` and assert it’s invoked once per iteration; ensure mobile render skip toggles every other frame.

---

## Documentation & Tooling
- Update `CLAUDE.md` and `.claude/sprint-3-testing-completion.md` checklist with new scripts and where tests live.
- Add section to README: “Quality Gates” describing coverage thresholds and `test:repeat`.
- Consider adding `test:ci` script: `vitest run --coverage --repeat 2`.

---

## Validation Checklist
- [ ] `npm run test` (all suites pass, no flakiness)
- [ ] `npm run test:coverage` ≥ 85/85/80/85
- [ ] `npm run test:repeat` stable (no intermittent failures)
- [ ] `npm run typecheck` / `npm run lint` clean
- [ ] Event emissions validated in integration tests
- [ ] Audio/Collision routed solely through ServiceProvider mocks in tests

---

## Files to Create/Update
```
.claude/
├─ sprint-3-testing-completion.md  (this document)
tests/
├─ services/serviceProvider.test.ts
├─ core/eventBus.test.ts
├─ core/stateModules.test.ts
├─ integration/collisionEvents.test.ts
├─ game/flowManager.events.test.ts
├─ game/gameStateManager.events.test.ts
├─ entities/powerup.events.test.ts
├─ ui/overlays/overlayManager.test.ts
├─ ui/hud/scorePopups.test.ts
├─ input/inputManager.test.ts
├─ input/mobileControls.test.ts
├─ perf/collisionHandler.perf.test.ts        (optional)
├─ perf/gameLoop.perf.test.ts                (optional)
```

## Estimated Effort
- Core/event/service/unit tests: **8-10 hours**
- UI/input jsdom tests: **6-8 hours**
- Integration/perf smoke: **3-4 hours**
- Docs/quality gates: **1 hour**
**Total:** ~18-23 hours

## Next Steps After Completion
- Sprint 4: Documentation, ADRs, and code-quality hardening (error handling, validation, perf budgets, Storybook/monitoring if prioritized).
