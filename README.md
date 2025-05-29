# 🚀 Spaceship Dodge

A fast-paced arcade-style web game where you pilot a spaceship, dodge and destroy falling asteroids, and level up through escalating challenges. Designed for mouse and keyboard play.

---

## 🎮 Features
- **Vector-style spaceship** with concave rear and trapezoidal engine
- **Multiple asteroid sizes** that break apart when hit
- **Fragment tracking & bonuses** for fully shattering large asteroids
- **Score popups** that float on each successful hit
- **Background music and sound effects** with mute and volume control
- **Pause/Resume** via right-click or `P` key
- **Mouse + keyboard support** for movement and firing
- **Level progression** every 2000 points, with transitions between waves
- **Quit confirmation prompt** to return to the start

---

## 📁 Folder Structure
```
spaceship-dodge-game/
│
├── index.html               # Main UI and overlays
├── styles/
│   └── main.css             # Styling for canvas and overlays
├── js/
│   ├── main.js              # Game bootstrap and button listeners
│   ├── loop.js              # Main game loop and control flow
│   ├── state.js             # Shared game state and constants
│   ├── player.js            # Player rendering and logic
│   ├── asteroid.js          # Obstacle generation, tracking, IDs
│   ├── bullet.js            # Bullet creation and update
│   ├── collisions.js        # Collision detection and bonus logic
│   ├── ui.js                # Overlay rendering, game state prompts
│   ├── scoreDisplay.js      # HUD score/level drawing
│   ├── audioControls.js     # Volume slider and mute/unmute
│   └── soundManager.js      # Global sound handling
└── assets/
    └── sounds/              # All .wav and .mp3 sound files
```

---

## 🐞 Known Issues
- `gameLevel.value` displays correctly, but level HUD may not reflect real-time progress
- Level-up detection waits for obstacle clear but may trigger oddly if fragments stall
- Rapid fire sound continues briefly after pause without cleanup
- Rare race condition with multiple bullets hitting same asteroid simultaneously

---

## 🌟 Future Enhancements
- ⭐ **Rotating asteroids** with canvas transforms
- ✨ **Animated starfield background**
- 🚀 **Spaceship redesign** with thrust animation and color trails
- 🧠 AI-based or pattern-based asteroid swarms
- 📈 High score leaderboard (local or Firebase-based)
- 🕹️ Touch support for mobile play

---

## ✅ Status
This is a complete vertical slice ready for expansion. Core mechanics, audio/visuals, and game flow are all functional and modular. Great job, Captain! 🛸
