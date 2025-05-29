# Spaceship Dodge Game

A browser-based asteroid dodge and shoot game where you control a spaceship to avoid and destroy falling asteroids. Built using HTML5, Tailwind CSS, and modular JavaScript.

## 🚀 Live Demo

You can play the game at: [https://thetrev68.github.io/spaceship-dodge-game/](https://thetrev68.github.io/spaceship-dodge-game/)

## 🎮 Controls

- Move: `W`, `A`, `S`, `D` or Arrow Keys
- Shoot: `Spacebar`

## 🧩 Features

- Responsive canvas and overlay UI
- Level progression with increasing difficulty
- Asteroid breakup into smaller pieces upon destruction
- Vector-style graphics with dynamic obstacle generation

## 🗂️ Folder Structure

```
spaceship-dodge-game/
│
├── index.html                # Main HTML entry point
├── styles/
│   └── main.css              # All custom styling
├── js/
│   ├── main.js               # Entry script: setup and event binding
│   ├── loop.js               # Game loop and core control functions
│   ├── ui.js                 # Overlay handling and canvas resizing
│   ├── controls.js           # Keyboard input handlers
│   ├── asteroid.js           # Asteroid logic and rendering
│   ├── bullet.js             # Bullet logic and rendering
│   ├── collisions.js         # Collision detection functions
│   └── state.js              # Game state and config constants
├── .nojekyll                 # Disables Jekyll processing on GitHub Pages
└── README.md                 # Project overview and notes
```

## 🧭 Roadmap & Expansion Ideas

- Add sound effects and background music
- Introduce power-ups (shields, rapid fire, etc.)
- Implement touch controls for mobile
- Add player lives and high score tracking
- Improve visuals with animations and particles

## 🛠️ Setup

To run locally:
```bash
git clone https://github.com/thetrev68/spaceship-dodge-game.git
cd spaceship-dodge-game
# Open index.html in your browser
```

## 📄 License

MIT License

---

This README helps both you and me manage and extend the game in future sessions. Let me know when you're ready to implement new features!
