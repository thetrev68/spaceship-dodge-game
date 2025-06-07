Absolutely, Trevor — here's your **updated and accurate `README.md`**, reflecting your actual folder structure, updated sound system, mobile fixes, and a polished dev-ready status.

---

````markdown
# 🚀 Spaceship Dodge

A fast-paced arcade-style browser game where you pilot a glowing vector spaceship, dodge and shoot asteroids, and level up against rising difficulty. Built with JavaScript, Tailwind CSS, and Vite — supports mouse, keyboard, and full touch/mobile controls with layered audio effects.

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

## 📁 Folder Structure

```plaintext
spaceship-dodge-game/
│
├── index.html                 # Game UI layout + overlays
├── styles/
│   └── main-tailwind.css      # Compiled Tailwind output
├── public/
│   └── sounds/                # bg-music.mp3, fire.mp3, etc.
├── src/
│   ├── main.js                # Entry point, unlock flow, canvas init
│   ├── gameLoop.js            # Game loop and frame updates
│   ├── state.js               # Shared game state (score, level, etc.)
│   ├── player.js              # Player update, draw, fire logic
│   ├── asteroid.js            # Asteroid pooling, generation, updates
│   ├── bullet.js              # Bullet pool, rendering
│   ├── collisionHandler.js    # Player/bullet collision checks
│   ├── mobileControls.js      # Touch input, pause handling
│   ├── controls.js            # Keyboard & mouse input
│   ├── ui.js                  # Overlay management, canvas sizing
│   ├── scoreDisplay.js        # HUD rendering: lives, level, score
│   ├── audioControls.js       # Volume slider + mute/unmute buttons
│   ├── soundManager.js        # 🎵 Manages all sound playback + unlock
│   ├── renderManager.js       # All canvas draw calls centralized
│   ├── flowManager.js         # Level progression and timers
│   └── powerups.js            # Spawning, pickup, visual effects
````

---

## 🐞 Known Issues

* Level-up waits until all fragments are cleared (intended but sometimes feels delayed)
* If game is paused at exact collision frame, rare scoring overlap occurs
* SFX race condition may play 1–2 extra sounds when pausing rapidly
* Background music won’t start unless gesture is detected (handled by silent unlock now)

---

## 🌟 Future Enhancements

### Gameplay

* 🔁 Rotating asteroids with angular momentum
* 🛡️ Shields, rapid fire, score multipliers
* 👾 Enemy ships with pathfinding AI
* 💣 Explosive chain reactions

### Visual Polish

* 🌌 Starfield and depth scrolling
* 🔥 Particle thrust trails
* 💥 Screen shake on hit/death

### Audio

* 🎶 Layered dynamic music based on level/intensity
* 🔊 Per-sound sliders in audio menu
* 🗣️ Voiceovers: "Level Up!", "Shield Activated", etc.

### UX / Controls

* 🎮 On-screen joystick (mobile)
* ⏸️ Pause menu with resume, restart, settings
* 🏆 Persistent high scores + best level tracking
* 🧭 Save + load settings and progress to localStorage

### Technical

* 🧪 FPS display toggle (dev mode)
* 🛠️ Accessibility: remappable keys, visual assist modes
* 📊 Performance reporting/logging tools

---

## ✅ Status

> ✅ Complete core game loop
> ✅ Mobile + desktop support
> ✅ Audio unlock and playback system
> ✅ Modular, well-structured codebase
> ✅ Ready for feature expansion or open-source contribution

---

## 🔗 GitHub Repository

[https://github.com/thetrev68/spaceship-dodge-game](https://github.com/thetrev68/spaceship-dodge-game)

Pull requests welcome! 🚀

```


