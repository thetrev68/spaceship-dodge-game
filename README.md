# 🚀 Spaceship Dodge

A fast-paced arcade-style browser game where you pilot a glowing vector spaceship, dodge and shoot asteroids, and level up against rising difficulty. Built with JavaScript, Tailwind CSS, and Vite — supports mouse, keyboard, and full touch/mobile controls with layered audio effects.

**Recently refactored to a modular, domain-driven architecture with TypeScript for better scalability and maintainability.**

---

## Features

- **Vector-style spaceship** with animated thruster glow
- **Asteroids of multiple sizes** that break into fragments, with score bonuses
- **Dynamic difficulty scaling** — smoother asteroid speeds and spawn rates per level
- **Floating score popups** on hits and bonuses
- **Full audio management**:
  - Background music
  - Laser/break/levelup/gameover effects
  - Volume slider & mute/unmute toggle
- **3-lives system** with overlay transitions and continue support
- **Mobile support**:
  - Tap/drag to move and shoot
  - Pause on release
  - Touch resume and floating button support
- **Desktop support**:
  - Mouse, WASD, arrows, spacebar
  - Right-click or `P` to pause/resume
- **Responsive canvas** with fullscreen scaling
- **Level-up every ~15 seconds** with obstacle-clear gating
- **Mobile performance optimizations** — FPS capping, capped spawns
- **Quit confirmation** when exiting during pause

---

## Architecture & File Structure

The codebase follows a modular, domain-driven structure. Path aliases (e.g., `@core`, `@game`) are used for cleaner imports.

```plaintext
src/
├── core/           # Application bootstrap, global state, configuration
├── game/           # Game loop, state machine, level progression
├── entities/       # Game objects (player, asteroids, bullets, powerups)
├── systems/        # Cross-cutting concerns (collision, rendering, audio)
├── input/          # Input handling (desktop, mobile)
├── ui/             # User interface components
│   ├── overlays/   # Game overlays (start, pause, level transition)
│   ├── hud/        # Heads-up display (score, lives)
│   └── controls/   # UI controls (audio)
├── effects/        # Visual effects (starfield)
└── utils/          # Pure utility functions (math, canvas, platform)
```

### Key Modules

- **Core**: `main.ts` (entry), `state.ts` (global state), `constants.ts` (config), `logger.ts`
- **Game**: `gameLoop.ts` (loop), `gameStateManager.ts` (state machine), `flowManager.ts`
- **Systems**: `collisionHandler.ts` (spatial grid), `renderManager.ts`, `soundManager.ts`
- **Entities**: `player.ts`, `asteroid.ts`, `bullet.ts`, `powerup.ts`

---

## Technical Improvements (v1.1.0+)

Recent updates focus on performance, stability, and code quality.

- **Modular Architecture**: Domain-specific modules (Entities, Systems, UI, etc.).
- **Spatial Partitioning**: Spatial grid for O(n) collision detection with many objects.
- **DOM Helpers**: Typed helpers for safer overlay/input handling.
- **TypeScript Migration**: Core, systems, entities, and UI/input layers now typed end-to-end.
- **Tailwind CSS v4**: Upgraded for smaller builds and better performance.
- **Constants Centralization**: All magic numbers in `core/constants.ts` for easy tuning.
- **Bug Fixes**: Safer audio unlocking, collision array mutations, and overlay focus handling.

---

## Known Issues

- Level-up waits until all fragments are cleared (intended but sometimes feels delayed).
- If game is paused at exact collision frame, rare scoring overlap occurs.
- Background music requires user interaction to start (browser policy) — handled via silent unlock, but may still be silent initially on some devices.

---

## Future Enhancements

### Gameplay

- Rotating asteroids with angular momentum
- Shields, rapid fire, score multipliers
- Enemy ships with pathfinding AI
- Explosive chain reactions

### Visual Polish

- Starfield and depth scrolling (expanded beyond `@effects/starfield.ts`)
- Particle thrust trails
- Screen shake on hit/death

### Audio

- Layered dynamic music based on level/intensity
- Per-sound sliders in audio menu
- Voiceovers: "Level Up!", "Shield Activated", etc.

### Technical

- FPS display toggle (dev mode)
- Accessibility: remappable keys, visual assist modes
- Performance reporting/logging tools

---

## Status

> ✅ Complete core game loop  
> ✅ Mobile + desktop support  
> ✅ Modular architecture (v1.1.0)  
> ✅ Spatial grid collision detection  
> ✅ Ready for feature expansion

---

## Getting Started

Prereqs: Node 20+ recommended. Install deps:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Quality gates:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage   # enforces 85/85/80/85 thresholds (lines/funcs/branches/stmts)
npm run test:repeat     # runs suites 3x to surface flakes
```

Build:

```bash
npm run build
```

Docs (JSDoc):

```bash
npm run docs
```

---

## Documentation

### Start Here

**New developers:** Begin with the [Developer Guide](./docs/DEVELOPER_GUIDE.md) for comprehensive onboarding covering architecture, workflows, testing, and common tasks.

**Game designers:** See the [Game Design Document](./docs/GAME_DESIGN.md) for mechanics, difficulty tuning, and feature roadmap.

### Architecture Decision Records (ADRs)

Key architectural decisions are documented in `docs/architecture/decisions/`:

- [ADR-001: Custom Reactive State](./docs/architecture/decisions/ADR-001-custom-reactive-state.md) - Why custom reactive system over MobX/Zustand
- [ADR-002: Spatial Grid Collision](./docs/architecture/decisions/ADR-002-spatial-grid-collision.md) - Spatial grid vs quadtree for O(n) collision detection
- [ADR-003: Object Pooling](./docs/architecture/decisions/ADR-003-object-pooling.md) - Memory management strategy for high-frequency objects
- [ADR-004: Fixed Timestep Game Loop](./docs/architecture/decisions/ADR-004-fixed-timestep-game-loop.md) - Deterministic physics with accumulator pattern
- [ADR-005: TypeScript Strict Mode](./docs/architecture/decisions/ADR-005-typescript-strict-mode.md) - Type safety configuration

### Additional Resources

- [LOGGER_USAGE.md](./LOGGER_USAGE.md) - Centralized logging API
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines and standards

### API Documentation

Generate TypeDoc API docs:

```bash
npm run docs
```

Output available in `docs/api/` after generation.

---

## Contributing

Pull requests welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, coding standards, and testing expectations.

---

## GitHub Repository

[https://github.com/thetrev68/spaceship-dodge-game](https://github.com/thetrev68/spaceship-dodge-game)

Pull requests welcome!
