# 🚀 Spaceship Dodge

A fast-paced arcade-style browser game where you pilot a glowing vector spaceship, dodge and shoot asteroids, and level up against rising difficulty. Built with JavaScript, Tailwind CSS, and Vite — supports mouse, keyboard, and full touch/mobile controls with layered audio effects.

**Recently refactored to a modular, domain-driven architecture for better scalability and maintainability.**

---

## 🎮 Features

- ✨ **Vector-style spaceship** with animated thruster glow
- 🪨 **Asteroids of multiple sizes** that break into fragments, with score bonuses
- 📈 **Dynamic difficulty scaling** — smoother asteroid speeds and spawn rates per level
- 💥 **Floating score popups** on hits and bonuses
- 🔊 **Full audio management**:
  - Background music
  - Laser/break/levelup/gameover effects
  - Volume slider & mute/unmute toggle
- ❤️ **3-lives system** with overlay transitions and continue support
- 📱 **Mobile support**:
  - Tap/drag to move and shoot
  - Pause on release
  - Touch resume and floating button support
- ⌨️ **Desktop support**:
  - Mouse, WASD, arrows, spacebar
  - Right-click or `P` to pause/resume
- 🧩 **Responsive canvas** with fullscreen scaling
- 🌀 **Level-up every ~15 seconds** with obstacle-clear gating
- ⚙️ **Mobile performance optimizations** — FPS capping, capped spawns
- 🚫 **Quit confirmation** when exiting during pause

---

## 🏗️ Architecture & File Structure

The codebase has been migrated to a modular, domain-driven structure. Path aliases (e.g., `@core`, `@game`) are used for cleaner imports.

For a detailed breakdown, see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md).

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
- **Core**: `main.js` (entry), `state.js` (global state), `constants.js` (config), `logger.js`
- **Game**: `gameLoop.js` (loop), `gameStateManager.js` (state machine), `flowManager.js`
- **Systems**: `collisionHandler.js` (spatial grid), `renderManager.js`, `soundManager.js`
- **Entities**: `player.js`, `asteroid.js`, `bullet.js`, `powerup.js`

---

## 🔧 Technical Improvements (v1.1.0)

Recent updates focus on performance, stability, and code quality. See [UPGRADE_NOTES.md](./UPGRADE_NOTES.md) for details.

*   **Modular Architecture**: Codebase split into domain-specific modules (Entities, Systems, UI, etc.).
*   **Spatial Partitioning**: Implemented a spatial grid for O(n) collision detection, significantly improving performance with many objects.
*   **DOM Caching**: New system to cache DOM elements and reduce expensive `getElementById` calls.
*   **Tailwind CSS v4**: Upgraded to the latest version for better performance and smaller build size.
*   **Constants Centralization**: All magic numbers moved to `core/constants.js` for easier tuning.
*   **Bug Fixes**: Resolved array mutation issues during collisions and improved audio unlocking resilience.

---

## 🐞 Known Issues

* Level-up waits until all fragments are cleared (intended but sometimes feels delayed)
* If game is paused at exact collision frame, rare scoring overlap occurs
* Background music requires user interaction to start (browser policy) - handled via silent unlock, but may still be silent initially on some devices.

---

## 🌟 Future Enhancements

### Gameplay

* 🔁 Rotating asteroids with angular momentum
* 🛡️ Shields, rapid fire, score multipliers
* 👾 Enemy ships with pathfinding AI
* 💣 Explosive chain reactions

### Visual Polish

* 🌌 Starfield and depth scrolling (Basic implementation in `@effects/starfield.js`)
* 🔥 Particle thrust trails
* 💥 Screen shake on hit/death

### Audio

* 🎶 Layered dynamic music based on level/intensity
* 🔊 Per-sound sliders in audio menu
* 🗣️ Voiceovers: "Level Up!", "Shield Activated", etc.

### Technical

* 🧪 FPS display toggle (dev mode)
* 🛠️ Accessibility: remappable keys, visual assist modes
* 📊 Performance reporting/logging tools

---

## ✅ Status

> ✅ Complete core game loop
> ✅ Mobile + desktop support
> ✅ Modular architecture (v1.1.0)
> ✅ Spatial grid collision detection
> ✅ Ready for feature expansion

---

## 🔗 GitHub Repository

[https://github.com/thetrev68/spaceship-dodge-game](https://github.com/thetrev68/spaceship-dodge-game)

Pull requests welcome! 🚀