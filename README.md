# 🎮 Multi-Theme Arcade Dodge

[![CI](https://github.com/thetrev68/spaceship-dodge-game/workflows/CI/badge.svg)](https://github.com/thetrev68/spaceship-dodge-game/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/thetrev68/spaceship-dodge-game/branch/main/graph/badge.svg)](https://codecov.io/gh/thetrev68/spaceship-dodge-game)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![Tested with Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18.svg)](https://vitest.dev/)

> A TypeScript-based multi-theme arcade game with world-class architecture and 85%+ test coverage

A fast-paced arcade-style browser game featuring three distinct visual themes: Space Explorer, Medieval Fantasy Dragon Rider, and Underwater Adventure. Pilot your vessel through treacherous environments, dodge obstacles, and level up against rising difficulty. Built with TypeScript, Tailwind CSS, and Vite — supports mouse, keyboard, and full touch/mobile controls with layered audio effects.

---

## 🌟 Features

- **Three Complete Visual Themes**: Space, Medieval Fantasy, and Underwater
- **Dynamic Difficulty Scaling**: Smoother obstacle speeds and spawn rates per level
- **Floating Score Popups**: Visual feedback on hits and bonuses
- **Full Audio Management**: Background music, effects, volume controls
- **3-Lives System**: Overlay transitions and continue support
- **Cross-Platform Support**: Mouse, keyboard, WASD, arrows, spacebar, and full touch controls
- **Responsive Canvas**: Fullscreen scaling for any device
- **Level Progression**: Advance every ~15 seconds with obstacle-clear gating
- **Performance Optimized**: FPS capping, capped spawns for smooth gameplay

---

## 🎨 Theme System

The game features a flexible theme system with three distinct visual experiences:

### 🚀 Space Explorer (Default)

- Glowing vector spaceship with animated thruster effects
- Asteroids of multiple sizes that break into fragments
- Neon space aesthetic with starfield background
- Classic sci-fi sound effects

### 🏰 Medieval Fantasy Dragon Rider

- Dragon rider vessel with wyvern obstacles
- Giant bats and arcane crystals as hazards
- Fireball bullets and magical powerups
- Castle ruins and ember background
- Rune shield and spell tome powerups
- Epic fantasy sound effects

### 🌊 Underwater Adventure

- Submarine vessel navigating ocean depths
- Jellyfish and coral obstacles
- Torpedo projectiles and treasure powerups
- Bubble effects and underwater ambiance
- Oceanic sound effects and music

### Theme Switching

1. Open Settings menu (🎛️ icon)
2. Navigate to "Theme" section
3. Select desired theme
4. Changes apply immediately and persist across sessions

### Customization

- Color palette customization per theme
- Font configuration options
- Asset-based renderers for all game entities
- Zero performance impact on gameplay

---

## 🏗️ Architecture & File Structure

The codebase follows a modular, domain-driven structure with path aliases for cleaner imports:

```text
src/
├── core/           # Application bootstrap, global state, configuration
├── game/           # Game loop, state machine, level progression
├── entities/       # Game objects (player, obstacles, projectiles, powerups)
├── systems/        # Cross-cutting concerns (collision, rendering, audio)
├── input/          # Input handling (desktop, mobile)
├── ui/             # User interface components
│   ├── overlays/   # Game overlays (start, pause, level transition)
│   ├── hud/        # Heads-up display (score, lives)
│   └── controls/   # UI controls (audio, settings)
├── effects/        # Visual effects (starfield, particles)
├── themes/         # Theme system and renderers
└── utils/          # Pure utility functions
```

### Key Technical Features

- **Spatial Partitioning**: Spatial grid for O(n) collision detection
- **Object Pooling**: Memory management for high-frequency objects
- **Fixed Timestep Game Loop**: Deterministic physics with accumulator pattern
- **Modular Architecture**: Domain-specific modules (Entities, Systems, UI, etc.)
- **TypeScript Strict Mode**: End-to-end type safety
- **Tailwind CSS v4**: Optimized styling with smaller builds

---

## 🎮 Gameplay

### Controls

- **Desktop**: Mouse movement, WASD/arrows, spacebar to shoot, P to pause
- **Mobile**: Tap/drag to move and shoot, touch controls
- **Universal**: Right-click or P key to pause/resume

### Obstacles & Powerups

- Multiple obstacle sizes with fragmentation
- Score bonuses for smaller fragments
- Themed powerups (shields, rapid fire, score multipliers)
- Explosive chain reactions

### Progression

- Level-up every ~15 seconds
- Increasing difficulty with each level
- Visual and audio feedback for milestones

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
git clone https://github.com/thetrev68/spaceship-dodge-game.git
cd spaceship-dodge-game
npm install
```

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Quality Checks

```bash
npm run validate    # Run all checks (typecheck + lint + test:ci)
npm run typecheck   # TypeScript only
npm run lint        # ESLint only
npm run test        # Tests only
npm run test:coverage   # Enforces 85/85/80/85 thresholds
npm run test:repeat     # Runs suites 3x to surface flakes
```

### Build

```bash
npm run build
```

---

## 📚 Documentation

### Start Here

- **Developers**: [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- **Designers**: [Game Design Document](./docs/GAME_DESIGN.md)

### Architecture Decision Records

- [ADR-001: Custom Reactive State](docs/architecture/decisions/ADR-001-custom-reactive-state.md)
- [ADR-002: Spatial Grid Collision](docs/architecture/decisions/ADR-002-spatial-grid-collision.md)
- [ADR-003: Object Pooling](docs/architecture/decisions/ADR-003-object-pooling.md)
- [ADR-004: Fixed Timestep Game Loop](docs/architecture/decisions/ADR-004-fixed-timestep-game-loop.md)
- [ADR-005: TypeScript Strict Mode](docs/architecture/decisions/ADR-005-typescript-strict-mode.md)
- [ADR-006: Theme System Architecture](docs/architecture/decisions/ADR-006-theme-system.md)
- [ADR-008: Medieval Fantasy Theme](docs/architecture/decisions/ADR-008-medieval-fantasy-theme.md)

### Additional Resources

- [LOGGER_USAGE.md](./LOGGER_USAGE.md) - Centralized logging API
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

---

## 🤝 Contributing

Pull requests welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, coding standards, and testing expectations.

---

## 📦 GitHub Repository

[https://github.com/thetrev68/spaceship-dodge-game](https://github.com/thetrev68/spaceship-dodge-game)

---

## ✅ Status

> ✅ Complete core game loop
> ✅ Three visual themes (Space, Medieval, Underwater)
> ✅ Mobile + desktop support
> ✅ Modular architecture
> ✅ Spatial grid collision detection
> ✅ 85%+ test coverage
> ✅ Ready for feature expansion

## Credits

> Space theme background Music by <a href="https://pixabay.com/users/serhii_kliets-36514165/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=318508">Serhii Kliets</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=318508">Pixabay</a>

> Medieval theme background Music by <a href="https://pixabay.com/users/amaksi-28332361/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=115518">Aleksey Voronin</a> from <a href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=115518">Pixabay</a>

> Underwater theme background Music by <a href="https://pixabay.com/users/lnplusmusic-47631836/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=371125">Andrii Poradovskyi</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=371125">Pixabay</a>
