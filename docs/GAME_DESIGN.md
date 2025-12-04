# Game Design Document

**Spaceship Dodge Game**
_A browser-based arcade shooter with progressive difficulty_

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [Core Gameplay Loop](#core-gameplay-loop)
3. [Game Mechanics](#game-mechanics)
4. [Difficulty Progression](#difficulty-progression)
5. [Visual & Audio Design](#visual--audio-design)
6. [Platform Support](#platform-support)
7. [Configuration & Tuning](#configuration--tuning)
8. [Future Enhancement Ideas](#future-enhancement-ideas)

---

## Game Overview

### Genre

**Arcade Shooter / Dodge'em-up**

### Core Concept

Players pilot a vector-style spaceship through increasingly dense asteroid fields. The game combines:

- **Offense:** Shoot asteroids to score points
- **Defense:** Dodge collisions to preserve lives
- **Progression:** Survive longer for higher scores and difficulty

### Target Audience

- Casual gamers looking for quick gameplay sessions
- Retro arcade fans (inspired by Asteroids)
- Mobile and desktop players

### Session Length

- **Quick Play:** 2-5 minutes (typical game session)
- **High Score Run:** 10+ minutes (advanced players)

---

## Core Gameplay Loop

```
Start Game
    ↓
Spawn at center with 3 lives
    ↓
Asteroids spawn from edges → Move toward center
    ↓
Player Actions:
  - Move spaceship (mouse/touch)
  - Shoot bullets (click/tap)
  - Collect powerups
    ↓
Destroy asteroids → Earn points → Fragments spawn
    ↓
Survive 15 seconds → Level up → Difficulty increases
    ↓
Hit by asteroid → Lose 1 life (unless shield active)
    ↓
Lives reach 0 → Game Over → Show final score
    ↓
Restart or Quit
```

### Win Condition

**None** - The game is endless. Goal is to achieve the highest score possible before losing all lives.

### Lose Condition

**All lives depleted** (starting with 3 lives)

---

## Game Mechanics

### 1. Player Control

#### Desktop (Mouse/Keyboard)

- **Movement:**
  - Mouse position (ship follows cursor)
  - WASD keys
  - Arrow keys
- **Shooting:**
  - Left click
  - Spacebar
- **Pause:** P key

#### Mobile (Touch)

- **Movement:** Drag finger (ship follows touch)
- **Shooting:** Tap anywhere
- **Pause:** Tap pause button overlay

**Design Rationale:**

- Mouse/touch control is more intuitive than keyboard-only
- Follows cursor pattern from games like Geometry Wars
- No rotation mechanics (ship always faces up for simplicity)

---

### 2. Asteroids

#### Spawning

- **Spawn from edges:** Random position on top/right/bottom/left edge
- **Initial velocity:** Toward screen center with random spread (±30°)
- **Spawn rate:** Increases per level (1500ms → 300ms cap)

#### Sizes

Three size tiers with different behaviors:

| Size           | Radius | Speed | Score  | Fragments on Destroy        |
| -------------- | ------ | ----- | ------ | --------------------------- |
| **Large (2)**  | 40px   | 1.0x  | 10 pts | 2-3 medium                  |
| **Medium (1)** | 25px   | 1.3x  | 25 pts | 2-3 small                   |
| **Small (0)**  | 15px   | 1.6x  | 50 pts | None (destroyed completely) |

#### Fragmentation

When hit by bullet:

1. Asteroid destroyed (score awarded)
2. If size > 0, spawn 2-3 smaller fragments
3. Fragments inherit parent velocity + random angle offset (±45°)
4. Fragments have 1.3x parent speed (faster, more dangerous)

**Bonus:** All fragments from same parent destroyed = +100 points

**Design Rationale:**

- Fragmentation creates risk/reward (shooting creates more threats)
- Smaller asteroids worth more points (harder to hit)
- Fragment bonus encourages aggressive play

---

### 3. Bullets

#### Firing

- **Cooldown:** 200ms (5 shots/second)
- **Speed:** 8 pixels/frame (fast, reliable)
- **Lifetime:** Off-screen removal
- **Object pooling:** 50 bullet pool (reused for performance)

#### Double Blaster Powerup

- **Duration:** 10 seconds
- **Effect:** Fire two bullets simultaneously (spread pattern)
- **No cooldown penalty**

**Design Rationale:**

- Fast bullets feel responsive
- Cooldown prevents screen spam
- Double blaster rewards accuracy (more projectiles = more hits)

---

### 4. Powerups

#### Types

**Shield (Blue)**

- **Duration:** 5 seconds
- **Effect:** Invulnerability to asteroid collisions
- **Visual:** Glowing blue aura around player
- **Score:** 200 points on pickup

**Double Blaster (Orange)**

- **Duration:** 10 seconds
- **Effect:** Fire two bullets in spread pattern
- **Visual:** Orange indicator on HUD
- **Score:** 200 points on pickup

#### Spawn Behavior

- **Spawn rate:** Random, ~10% chance every 5 seconds
- **Position:** Random X coordinate at top of screen
- **Movement:** Falls downward (gravity effect)
- **Lifetime:** Despawns if reaches bottom unpicked

**Design Rationale:**

- Temporary powerups encourage risk-taking (move to collect)
- Shield allows aggressive play through dense fields
- Double blaster rewards accuracy

---

### 5. Collision Detection

#### Spatial Grid Optimization

Uses 60px grid cells for O(n) collision detection:

```
Traditional approach: O(n²) - 100 entities = 4,950 checks/frame
Spatial grid: O(n) - 100 entities = ~15 checks/frame
```

**Collision Types:**

1. **Player ↔ Asteroid:** Lose 1 life (unless shield active)
2. **Bullet ↔ Asteroid:** Destroy asteroid, score points, spawn fragments
3. **Player ↔ Powerup:** Activate powerup effect

**Circle Collision Formula:**

```typescript
function circleCollision(a: Entity, b: Entity): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}
```

See [ADR-002](./architecture/decisions/ADR-002-spatial-grid-collision.md) for spatial grid design.

---

### 6. Lives System

- **Starting Lives:** 3
- **Life Loss:** Hit by asteroid (unless shield active)
- **No Life Gain:** No 1-up system (keeps sessions finite)
- **Game Over:** Lives reach 0

**Visual Feedback:**

- Heart icons on HUD (filled = alive, empty = lost)
- Red flash effect on player hit
- Explosion particle effect (future enhancement)

---

### 7. Scoring System

| Action                  | Base Points | Notes                       |
| ----------------------- | ----------- | --------------------------- |
| Destroy large asteroid  | 10          | Easiest to hit              |
| Destroy medium asteroid | 25          | 2.5x large                  |
| Destroy small asteroid  | 50          | 5x large (hardest)          |
| Fragment bonus          | 100         | All fragments cleared       |
| Collect powerup         | 200         | Risk/reward for positioning |

**Score Multipliers (Future):**

- Combo system (rapid successive hits)
- Level multiplier (score scales with difficulty)

---

## Difficulty Progression

### Level Advancement

- **Timer:** ~15 seconds per level (configurable)
- **Gating:** Level-up waits until all asteroids cleared from screen
- **Visual:** Brief "LEVEL X" overlay

### Difficulty Scaling

| Level | Spawn Interval | Asteroid Speed | Approximate Difficulty |
| ----- | -------------- | -------------- | ---------------------- |
| 1     | 1500ms         | 1.0x           | Easy (tutorial)        |
| 3     | 1360ms         | 1.5x           | Medium (comfortable)   |
| 5     | 1220ms         | 2.0x           | Challenging            |
| 10    | 870ms          | 3.0x           | Hard (screen full)     |
| 15+   | 300ms (cap)    | 3.0x (cap)     | Expert (sustained max) |

**Spawn Interval Formula:**

```typescript
const spawnInterval = Math.max(
  BASE_SPAWN_INTERVAL - level * DECREASE_PER_LEVEL,
  MIN_SPAWN_INTERVAL
);
```

**Speed Formula:**

```typescript
const asteroidSpeed = Math.min(1.0 + level * SPEED_INCREASE_PER_LEVEL, MAX_SPEED);
```

**Design Rationale:**

- Gradual ramp prevents frustration
- Caps prevent impossible difficulty
- Gating gives players breathing room between levels

---

## Visual & Audio Design

### Visual Style

**Vector Aesthetic (Inspired by Asteroids)**

- Clean geometric shapes
- Outline rendering (no fills)
- Monochrome color scheme
- Minimalist HUD

**Colors:**

```typescript
const VISUAL_CONFIG = {
  PLAYER: '#00FF00', // Green (iconic retro color)
  ASTEROID: '#FFFFFF', // White (clean, visible)
  BULLET: '#FFFF00', // Yellow (bullet tracer effect)
  POWERUP_SHIELD: '#00BFFF', // Blue (protection theme)
  POWERUP_BLASTER: '#FF8C00', // Orange (offense theme)
  BACKGROUND: '#000000', // Black (classic space)
};
```

**Effects:**

- Shield: Glowing blue circle around player
- Hit: Red screen flash
- Starfield: Parallax scrolling stars (desktop only)

---

### Audio Design

#### Sound Effects

| Event            | Sound          | Design Goal         |
| ---------------- | -------------- | ------------------- |
| Fire bullet      | `fire.mp3`     | Sharp laser zap     |
| Asteroid destroy | `break.mp3`    | Crunch/explosion    |
| Level up         | `levelup.mp3`  | Triumphant chime    |
| Game over        | `gameover.mp3` | Dramatic loss sound |

#### Background Music

- **Loop:** `bg-music.mp3` (ambient space synth)
- **Volume:** Adjustable slider (0-100%)
- **Mute toggle:** Persistent across sessions

**Audio Implementation:**

- Gesture-based unlock (browser autoplay policy)
- Silent audio trick for mobile unlock
- Volume persistence via localStorage

See [soundManager.ts](../src/systems/soundManager.ts) for implementation.

---

## Platform Support

### Desktop

- **Controls:** Mouse + keyboard
- **Performance:** 60 FPS target
- **Features:**
  - Full starfield background
  - Complex asteroid shapes (11 points)
  - Button-based UI

### Mobile

- **Controls:** Touch
- **Performance:** 30-60 FPS (adaptive)
- **Optimizations:**
  - Longer spawn intervals (2400ms vs 1500ms)
  - Simpler asteroid shapes (5 points)
  - No starfield (performance)
  - Larger touch targets

**Platform Detection:**

```typescript
export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
```

---

## Configuration & Tuning

All gameplay values are centralized in [src/core/gameConstants.ts](../src/core/gameConstants.ts).

### Key Tuning Parameters

#### Asteroid Spawning

```typescript
LEVEL_CONFIG: {
  BASE_SPAWN_INTERVAL_DESKTOP: 1500,  // ms between spawns
  BASE_SPAWN_INTERVAL_MOBILE: 2400,   // Slower for mobile
  SPAWN_INTERVAL_DECREASE_PER_LEVEL: 70, // Ramp speed
  MIN_SPAWN_INTERVAL: 300,            // Cap at 300ms
}
```

#### Asteroid Behavior

```typescript
ASTEROID_CONFIG: {
  BASE_SPEED: 1.0,               // Base speed multiplier
  SPEED_INCREASE_PER_LEVEL: 0.5, // Speed ramp
  MAX_SPEED: 3.0,                // Speed cap
  FRAGMENT_SPEED_MULTIPLIER: 1.3, // Fragments faster
  SCORE_VALUES: [50, 25, 10]     // [Small, Medium, Large]
}
```

#### Player Settings

```typescript
PLAYER_CONFIG: {
  SIZE: 15,              // Player radius (collision bound)
  SPEED: 5,              // Movement speed
  SHIELD_VISUAL_RADIUS: 30, // Shield glow size
}
```

#### Bullet Settings

```typescript
BULLET_CONFIG: {
  SPEED: 8,              // Bullet velocity
  FIRE_COOLDOWN: 200,    // ms between shots (5/sec)
  SIZE: 3                // Bullet radius
}
```

**Design Rationale:**

- Centralized configuration enables quick tuning
- Separate desktop/mobile values for platform optimization
- Caps prevent impossible difficulty spikes

---

## Future Enhancement Ideas

### Short-Term (Low Effort, High Impact)

**1. Particle Effects**

- Asteroid explosion particles
- Bullet trails
- Player thrust effect

**2. Combo System**

- Rapid kills increase score multiplier
- Visual combo counter
- Combo break timer (3 seconds)

**3. High Score Persistence**

- LocalStorage top 10 scores
- Date/time stamps
- High score display on game over

**4. Screen Shake**

- On player hit (camera shake)
- On large asteroid destruction
- Intensity scales with event impact

---

### Medium-Term (Moderate Effort)

**5. Boss Encounters**

- Every 5 levels, spawn large boss asteroid
- Multiple hits to destroy
- Unique attack patterns
- Bonus score on defeat

**6. Weapon Upgrades**

- Spread shot (3 bullets in cone)
- Rapid fire (reduced cooldown)
- Piercing bullets (pass through asteroids)
- Persistent across death (limited duration)

**7. Enemy Types**

- **Chasers:** Track player position
- **Shooters:** Fire back at player
- **Tanks:** High health, slow speed
- **Splitters:** Divide on hit (like asteroids)

**8. Leaderboard Integration**

- Backend API for global scores
- Daily/weekly/all-time rankings
- Player name entry

---

### Long-Term (High Effort, Major Features)

**9. Procedural Levels**

- Unique level layouts (not just empty space)
- Obstacles (walls, barriers)
- Safe zones and danger zones
- Environmental hazards (black holes, asteroid belts)

**10. Campaign Mode**

- Story-driven missions
- Objective variety (survive X seconds, destroy Y asteroids)
- Unlockable ships and weapons
- Progression system

**11. Multiplayer**

- Co-op (2-4 players)
- Versus mode (competitive scoring)
- WebSocket-based real-time sync

**12. Mobile App Version**

- Native iOS/Android app (Capacitor/React Native)
- Offline play
- App Store/Play Store distribution
- Push notifications for events

---

## Design Philosophy

### Core Principles

**1. Easy to Learn, Hard to Master**

- Simple controls (move, shoot)
- Intuitive mechanics (avoid asteroids, shoot them)
- Depth through fragmentation system and powerups

**2. Quick Sessions, High Replayability**

- 2-5 minute average game length
- "One more try" loop (restart is instant)
- Incremental skill progression

**3. Performance First**

- 60 FPS on desktop, 30 FPS on mobile
- Object pooling prevents GC pauses
- Spatial grid collision O(n) complexity
- Smooth gameplay > visual complexity

**4. Accessibility**

- Support mouse, keyboard, and touch
- Adjustable audio volume
- Clear visual feedback (hit indicators, HUD)
- Colorblind-friendly palette (future)

---

## Playtesting Feedback Integration

### Current Iteration (v1.1.0)

**Positive Feedback:**

- Controls feel responsive
- Difficulty ramp is fair
- Fragmentation system adds strategy

**Improvement Areas:**

- Level-up gating feels slow (waiting for asteroids to clear)
  - _Mitigation:_ Reduce gating timer (future tweak)
- Powerups rare/hard to collect
  - _Mitigation:_ Increase spawn rate or add magnet pickup radius
- No visual feedback on player hit
  - _Mitigation:_ Add screen flash effect (implemented)

---

## Technical Constraints

### Performance Targets

- **Desktop:** 60 FPS sustained with 100+ entities
- **Mobile:** 30 FPS sustained with 50+ entities
- **Load Time:** <2 seconds initial load
- **Bundle Size:** <500KB minified (currently ~200KB)

### Browser Compatibility

- **Minimum:** Chrome 90+, Safari 14+, Firefox 88+
- **Canvas API:** Full HTML5 Canvas support
- **Audio:** Web Audio API with autoplay unlock
- **Storage:** LocalStorage for settings persistence

---

## References

### Inspirations

- **Asteroids (1979)** - Vector graphics, fragmentation, endless gameplay
- **Geometry Wars** - Mouse/stick control, arcade scoring
- **Super Stardust** - Powerups, visual effects

### Related Documentation

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Technical implementation
- [Architecture Decision Records](./architecture/decisions/) - Design rationale
- [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute

---

**Document Version:** 1.0
**Last Updated:** 2024-12-03
**Author:** Development Team
