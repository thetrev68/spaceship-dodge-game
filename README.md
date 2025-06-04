```markdown
# 🚀 Spaceship Dodge

A fast-paced arcade-style web game where you pilot a vector-style spaceship, dodge and destroy falling asteroids, and level up through escalating challenges. Supports mouse, keyboard, and touch controls with full audio management.

---

## 🎮 Features
- **Vector-style spaceship** with pulsing thruster flame and sleek shape
- **Multiple asteroid sizes** that break apart and fragment tracking with bonuses
- **Dynamic difficulty scaling** with smooth asteroid speed and spawn rate progression
- **Score popups** with animated floating text on hits
- **Full audio management**: background music, sound effects, mute/unmute, and volume slider that control all sounds uniformly
- **3 lives per player** system with level transition and continue support
- **Mobile support** including touch controls and floating pause button
- **Pause/Resume** via right-click, `P` key, or floating button on mobile
- **Responsive canvas**: scales to fill most of the screen while maintaining aspect ratio
- **Level progression** every 15 seconds with smooth transitions and spawn gating
- **Performance optimizations** with FPS capping and object limits on mobile devices
- **Mouse, keyboard, and touch input** for movement and firing
- **Quit confirmation** prompt to safely exit game

---

## 📁 Folder Structure
```

spaceship-dodge-game/
│
├── index.html               # Main UI and overlays with Tailwind CSS
├── styles/
│   └── main-tailwind.css    # Compiled Tailwind CSS for styling
├── js/
│   ├── main.js              # Game bootstrap and event listeners
│   ├── loop.js              # Main game loop, state management, and difficulty scaling
│   ├── state.js             # Shared game state and constants
│   ├── player.js            # Player rendering and update logic with thruster animation
│   ├── asteroid.js          # Asteroid generation, shape, movement, and speed scaling
│   ├── bullet.js            # Bullet creation, update, and rendering
│   ├── collisions.js        # Collision detection and scoring logic
│   ├── mobileControls.js    # Mobile-specific input and pause button handling
│   ├── controls.js          # Desktop input handlers (keyboard/mouse)
│   ├── ui.js                # UI overlays, canvas sizing, and game state prompts
│   ├── scoreDisplay.js      # HUD rendering for score, level, and lives
│   ├── audioControls.js     # Audio controls UI and event handlers
│   └── soundManager.js      # Unified sound playback, volume, and mute control
└── assets/
└── sounds/              # All game sound assets (.wav, .mp3)

```

---

## 🐞 Known Issues
- Level HUD may lag behind actual `gameLevel.value` updates occasionally
- Level-up triggers only after clearing obstacles; fragments lingering may delay progression
- Sound effects sometimes linger briefly after pausing due to race conditions
- Rare bullet-asteroid simultaneous collision glitches

---

## 🌟 Future Enhancements

### Gameplay Enhancements
- Rotating Asteroids with smooth animation
- Asteroid Trails for visual flair
- Power-ups like shields, rapid fire, score multipliers
- Enemy ships with basic AI behaviors

### Visual/UI Improvements
- Animated Starfield background for immersion
- Spaceship glow and dynamic thrust trails
- Damage feedback effects (flash, screen shake)

### Audio & Feedback
- Dynamic music layers changing with game intensity
- Voice/SFX overlays (e.g., “Level Up!” alerts)
- More granular audio controls (per effect volume)

### UX & Polish
- Detailed pause menu with restart, quit, settings
- On-screen joystick and gestures for mobile
- Persistent high score leaderboard and stats

### Technical
- Save/load player progress and settings locally
- Performance monitoring (FPS, memory)
- Accessibility modes: colorblind, remappable controls

---

## ✅ Status
Complete core gameplay with responsive design, multi-device support, sound management, and polished visuals. Modular architecture for easy expansion and maintenance. Ready for deployment or further feature development.
