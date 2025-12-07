# 🐉 Medieval Fantasy Theme - Technical Design Specification

**Status**: Design Phase
**Target**: Phase 2 - Asset-Based Theme System
**Approach**: Zero Code Duplication via Render Strategy Pattern

---

## 🎯 Design Goals

1. **Zero code duplication** - Same game logic, different visuals
2. **Clean abstraction** - Theme-agnostic core systems (proven with underwater theme)
3. **Minimal refactoring** - Additive changes only (renderer functions)
4. **Full vector graphics** - No sprite sheets, pure canvas drawing
5. **Performance parity** - Match or exceed current render speeds
6. **Rich medieval atmosphere** - Stone textures, fire effects, magical elements

---

## 🏰 Theme Concept: "Dragon Rider"

### Visual Metaphor Mapping

| Game Entity            | Space Theme      | Underwater Theme          | Medieval Fantasy Theme         |
| ---------------------- | ---------------- | ------------------------- | ------------------------------ |
| **Player**             | Spaceship        | Submarine                 | Dragon Rider (top-down)        |
| **Obstacles (Large)**  | Large Asteroids  | Large Jellyfish           | Wyverns (hostile dragons)      |
| **Obstacles (Medium)** | Medium Asteroids | Medium Jellyfish          | Giant Bats                     |
| **Obstacles (Small)**  | Small Asteroids  | Small Jellyfish           | Magical Crystals               |
| **Bullets**            | Lasers           | Torpedoes                 | Fireballs                      |
| **Shield Powerup**     | Energy Shield    | Octopus                   | Magic Rune Shield              |
| **Blaster Powerup**    | Double Lasers    | Starfish                  | Spell Tome (Twin Flames)       |
| **Background**         | Starfield        | Ocean Gradient + Plankton | Castle Ruins + Floating Embers |

**Note**: Game uses **top-down perspective** - all entities rendered from bird's-eye view.

### Color Palette (Earthy Medieval Tones)

```typescript
colors: {
  // Entity colors
  player: '#d97706',           // Amber/orange dragon
  playerEngine: 'rgba(239, 68, 68, 0.6)', // Red fire breath
  playerShield: '#a855f7',     // Purple magical shield
  bullet: '#ef4444',           // Red fireball
  asteroid: '#78716c',         // Gray stone debris

  // UI colors
  hudText: '#fef3c7',          // Warm cream text
  hudAccent: '#d97706',        // Amber accents
  scorePopup: '#fbbf24',       // Gold score text
  bonusPopup: '#a855f7',       // Purple bonus
  powerupPopup: '#10b981',     // Green powerup text

  // Effects
  starfield: '#fbbf24',        // Golden embers

  // Powerup colors
  powerupShield: '#8b5cf6',    // Purple magic rune
  powerupBlaster: '#10b981',   // Green spell tome
}
```

---

## 🎨 Entity Rendering Specifications

### 1. Player: Dragon Rider (Top-Down View) 🐉

**Visual Description (Bird's-Eye View):**

- Dragon body seen from above with outstretched wings
- Elongated body with visible neck and tail
- Rider visible on dragon's back (small humanoid shape)
- Animated wing flapping (left/right wings extend/retract)
- Fire breath streams downward from head (thrust effect)
- Long tail trailing behind, swaying gently

**Animation States:**

- **Wing Beat Cycle**: Wings extend outward and retract inward (sine wave)
- **Tail Sway**: Tail curves left/right behind dragon
- **Fire Breath**: Particle stream trailing behind dragon when moving upward

**Top-Down Anatomy:**

```
        /‾\  (head, triangular)
       | o | (rider on back)
  <---[===]---> (body with extended wings)
        | |     (tail, curved)
         ~      (tail tip)
```

**Technical Approach:**

```typescript
/**
 * Renders player as a flying dragon with rider (TOP-DOWN VIEW)
 *
 * Features:
 * - Bird's-eye view of dragon with outstretched wings
 * - Animated wing flapping (extend/retract cycle)
 * - Swaying tail behind dragon
 * - Fire breath particles streaming downward
 * - Rider silhouette on dragon's back
 * - Shield effect (magical rune circle)
 */
export function drawDragon(ctx: CanvasRenderingContext2D, player: Player): void {
  const theme = getCurrentTheme();
  const x = player.x;
  const y = player.y;
  const w = player.width;
  const h = player.height;
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Animation timing
  const time = performance.now() / 1000; // seconds
  const wingExtension = Math.sin(time * 3) * 0.3 + 1; // 0.7 to 1.3 (retract to extend)
  const tailSway = Math.sin(time * 2) * w * 0.2; // Horizontal tail curve

  ctx.strokeStyle = theme.colors.player;
  ctx.fillStyle = theme.colors.player;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // DRAWING ORDER (back to front for proper layering):

  // 1. TAIL (behind body, curves left/right)
  drawDragonTail(ctx, cx, cy, h, tailSway, theme.colors.player);

  // 2. WINGS (left and right, extend outward from body)
  drawDragonWings(ctx, cx, cy, w, h, wingExtension, theme.colors.player);

  // 3. BODY (elongated oval, central mass)
  drawDragonBody(ctx, cx, cy, w, h, theme.colors.player);

  // 4. HEAD (front of body, triangular)
  drawDragonHead(ctx, cx, cy - h * 0.35, w * 0.4, theme.colors.player);

  // 5. RIDER (small humanoid on dragon's back/neck area)
  drawRider(ctx, cx, cy - h * 0.15, w * 0.25, theme.colors.player);

  // 6. FIRE BREATH (streams downward behind dragon, when moving)
  if (!isMobile() && Math.abs(player.vy || 0) > 0.5) {
    drawFireBreath(ctx, cx, cy + h * 0.35, theme.colors.playerEngine);
  }

  // 7. SHIELD EFFECT (magical rune circle around entire dragon)
  if (powerUps.shield.active) {
    drawMagicShield(ctx, cx, cy, Math.max(w, h) * 1.4, theme.colors.playerShield);
  }
}
```

**Component Functions:**

```typescript
/**
 * Draws dragon tail from top-down perspective
 * Tail curves behind dragon body, swaying left/right
 */
function drawDragonTail(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyHeight: number,
  swayOffset: number,
  color: string
): void {
  // Tail starts at bottom of body, extends downward
  const tailStartY = cy + bodyHeight * 0.3;
  const tailLength = bodyHeight * 0.8;

  // 3-segment curved tail using quadratic curves
  // Each segment gets narrower
  // swayOffset creates left/right curve

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, tailStartY);

  // Segment 1 (thick)
  const seg1Y = tailStartY + tailLength * 0.33;
  ctx.quadraticCurveTo(
    cx + swayOffset * 0.5,
    tailStartY + tailLength * 0.16,
    cx + swayOffset,
    seg1Y
  );

  // Segment 2 (medium)
  ctx.lineWidth = 2;
  const seg2Y = tailStartY + tailLength * 0.66;
  ctx.quadraticCurveTo(
    cx + swayOffset * 1.5,
    seg1Y + (seg2Y - seg1Y) * 0.5,
    cx + swayOffset * 0.5,
    seg2Y
  );

  // Segment 3 (thin, tip)
  ctx.lineWidth = 1.5;
  const seg3Y = tailStartY + tailLength;
  ctx.quadraticCurveTo(cx + swayOffset * 0.25, seg2Y + (seg3Y - seg2Y) * 0.5, cx, seg3Y);

  ctx.stroke();
}

/**
 * Draws dragon wings from top-down perspective
 * Wings extend left/right from body, animated flapping
 */
function drawDragonWings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyWidth: number,
  bodyHeight: number,
  extension: number, // 0.7 to 1.3 (retract to extend)
  color: string
): void {
  // Wings are bat-wing style, extending horizontally from body sides
  const wingSpan = bodyWidth * 1.5 * extension;
  const wingHeight = bodyHeight * 0.6;

  ctx.fillStyle = `${color}60`; // Semi-transparent membrane
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // LEFT WING
  ctx.beginPath();
  ctx.moveTo(cx, cy); // Wing attach point (center of body)
  ctx.quadraticCurveTo(
    cx - wingSpan * 0.4,
    cy - wingHeight * 0.3, // Upper curve
    cx - wingSpan,
    cy
  );
  ctx.quadraticCurveTo(
    cx - wingSpan * 0.5,
    cy + wingHeight * 0.4, // Lower curve
    cx,
    cy + bodyHeight * 0.2
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing bones (3 struts)
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const boneX = cx - wingSpan * (i / 4);
    const boneY = cy + (i === 2 ? -wingHeight * 0.2 : wingHeight * 0.1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(boneX, boneY);
    ctx.stroke();
  }

  // RIGHT WING (mirror)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cx + wingSpan * 0.4, cy - wingHeight * 0.3, cx + wingSpan, cy);
  ctx.quadraticCurveTo(cx + wingSpan * 0.5, cy + wingHeight * 0.4, cx, cy + bodyHeight * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing bones (right side)
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const boneX = cx + wingSpan * (i / 4);
    const boneY = cy + (i === 2 ? -wingHeight * 0.2 : wingHeight * 0.1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(boneX, boneY);
    ctx.stroke();
  }
}

/**
 * Draws dragon body from top-down perspective
 * Elongated oval with scale texture
 */
function drawDragonBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: string
): void {
  // Main body (elongated vertical ellipse)
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Scale segments (3-4 horizontal lines across body)
  ctx.strokeStyle = `${color}80`;
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    const segY = cy + i * h * 0.15;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.25, segY);
    ctx.lineTo(cx + w * 0.25, segY);
    ctx.stroke();
  }

  // Chest highlight (lighter center)
  ctx.fillStyle = `${color}40`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.2, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws dragon head from top-down perspective
 * Triangular snout with horns and eyes
 */
function drawDragonHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Triangular snout (pointing upward)
  const snoutLength = width * 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - snoutLength); // Tip of snout
  ctx.lineTo(cx - width / 2, cy); // Left base
  ctx.lineTo(cx + width / 2, cy); // Right base
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Horns (two small triangles pointing outward from head)
  const hornLength = width * 0.4;

  // Left horn
  ctx.beginPath();
  ctx.moveTo(cx - width * 0.4, cy - snoutLength * 0.3);
  ctx.lineTo(cx - width * 0.7, cy - snoutLength * 0.5);
  ctx.lineTo(cx - width * 0.3, cy - snoutLength * 0.5);
  ctx.closePath();
  ctx.fill();

  // Right horn
  ctx.beginPath();
  ctx.moveTo(cx + width * 0.4, cy - snoutLength * 0.3);
  ctx.lineTo(cx + width * 0.7, cy - snoutLength * 0.5);
  ctx.lineTo(cx + width * 0.3, cy - snoutLength * 0.5);
  ctx.closePath();
  ctx.fill();

  // Eyes (two glowing dots)
  ctx.fillStyle = '#fbbf24'; // Golden glow
  ctx.beginPath();
  ctx.arc(cx - width * 0.2, cy - snoutLength * 0.4, 2, 0, Math.PI * 2);
  ctx.arc(cx + width * 0.2, cy - snoutLength * 0.4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils (tiny dots at snout tip)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx - width * 0.1, cy - snoutLength * 0.9, 1, 0, Math.PI * 2);
  ctx.arc(cx + width * 0.1, cy - snoutLength * 0.9, 1, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws rider on dragon's back
 * Small humanoid silhouette with helmet
 */
function drawRider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void {
  ctx.fillStyle = '#8b4513'; // Brown leather armor
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Body (small circle)
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Helmet (smaller circle on top)
  ctx.fillStyle = '#6b7280'; // Gray metal
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.3, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Cape (small triangle behind)
  ctx.fillStyle = '#dc2626'; // Red cape
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.3, cy);
  ctx.lineTo(cx + size * 0.3, cy);
  ctx.lineTo(cx, cy + size * 0.6);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws fire breath streaming downward behind dragon
 * Particle trail effect
 */
function drawFireBreath(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  // 5-7 fire particles streaming downward behind dragon
  const particleCount = 7;

  for (let i = 1; i <= particleCount; i++) {
    const particleY = y + i * 6; // Trail downward
    const particleRadius = 3 - i * 0.3; // Decreasing size
    const opacity = 1 - i * 0.12; // Fade out

    // Flame gradient (yellow to orange to red)
    const hue = i < 3 ? '#fbbf24' : i < 5 ? '#fb923c' : '#dc2626';
    ctx.fillStyle = hue;
    ctx.globalAlpha = opacity;

    ctx.beginPath();
    ctx.arc(x, particleY, particleRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

/**
 * Draws magical shield rune circle around dragon
 * Rotating pentagram with pulsing glow
 */
function drawMagicShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
): void {
  const time = performance.now() / 1000;
  const rotation = time * 0.5; // Slow rotation
  const pulse = Math.sin(time * 2) * 0.1 + 1; // 0.9 to 1.1

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // Outer circle
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7 * pulse;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Pentagram (5-pointed star)
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 5; i++) {
    const angle = ((i * 4) / 5) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius * 0.7;
    const y = Math.sin(angle) * radius * 0.7;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha = 1;
}
```

---

### 2. Obstacles: Medieval Aerial Threats (Wyverns, Bats, Crystals) 🐲🦇💎

**Thematic Design:**
Instead of castle debris (which doesn't make sense floating in the sky), obstacles are **aerial threats** appropriate for dragon combat:

- **Large obstacles**: **Wyverns** (hostile dragons)
- **Medium obstacles**: **Giant Bats** (cave creatures)
- **Small obstacles**: **Magical Crystals** (arcane hazards)

**Fragmentation Chain (Magical Transformation):**

When destroyed, obstacles transform magically (see ADR-009 for rationale):

```
Wyvern (cursed creature) → 2-3 Giant Bats (released from curse)
  ↓
Giant Bat (magical construct) → 2-3 Crystals (shattered arcane form)
  ↓
Crystal (pure magic) → Sparkles (no fragments, disperses)
```

**Variety System:**

Obstacle type determined by size (implicit typing):

```typescript
type MedievalObstacleType = 'wyvern' | 'bat' | 'crystal';

function getObstacleTypeBySize(radius: number): MedievalObstacleType {
  if (radius >= 30) return 'wyvern'; // Large obstacles
  if (radius >= 15) return 'bat'; // Medium obstacles
  return 'crystal'; // Small obstacles
}
```

**Main Renderer:**

```typescript
/**
 * Renders medieval obstacles with type-based variety (TOP-DOWN VIEW)
 *
 * Obstacle type determined by size:
 * - Large (radius ≥ 30): Wyvern (hostile dragon)
 * - Medium (radius 15-29): Giant Bat
 * - Small (radius < 15): Magical Crystal
 *
 * Fragmentation narrative: Cursed wyverns release trapped bats,
 * bats shatter into pure magical crystals, crystals explode into sparkles.
 */
export function drawMedievalObstacle(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const type = getObstacleTypeBySize(obstacle.radius);

  switch (type) {
    case 'wyvern':
      drawWyvern(ctx, obstacle);
      break;
    case 'bat':
      drawBat(ctx, obstacle);
      break;
    case 'crystal':
      drawCrystal(ctx, obstacle);
      break;
  }
}
```

---

#### 2a. Wyvern (Large Obstacles, Top-Down)

**Visual Description:**

- Smaller hostile dragon (enemy of player's dragon)
- Spread wings (bat-wing style, dark/shadowy)
- Long serpentine body with tail
- Breathing dark smoke (not fire - shows they're corrupted)
- Menacing appearance (darker colors, red eyes)

**Top-Down Anatomy:**

```
    /\  (head, horns)
<--[==]--> (body with dark wings)
    ||     (tail)
     ~     (tail tip)
```

**Renderer:**

```typescript
/**
 * Draws wyvern (hostile dragon) from top-down view
 *
 * Features:
 * - Spread dark wings (larger wingspan than player dragon)
 * - Serpentine body with visible tail
 * - Red glowing eyes
 * - Dark smoke trails (corrupted nature)
 * - Animated wing flapping (slower than player)
 */
function drawWyvern(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const theme = getCurrentTheme();
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;
  const rotation = obstacle.rotation; // Use for animation phase

  // Wing animation (reuse rotation as phase)
  const wingExtension = Math.sin(rotation * 2) * 0.2 + 0.9; // 0.7 to 1.1

  ctx.save();
  ctx.translate(cx, cy);

  // Darker color scheme (hostile)
  const wyvernColor = '#4b5563'; // Dark gray
  const eyeColor = '#ef4444'; // Red eyes

  // TAIL (behind body)
  ctx.strokeStyle = wyvernColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, radius * 0.3);
  ctx.quadraticCurveTo(Math.sin(rotation) * radius * 0.3, radius * 0.6, 0, radius * 0.9);
  ctx.stroke();

  // WINGS (dark, larger wingspan)
  const wingSpan = radius * 1.8 * wingExtension;
  ctx.fillStyle = `${wyvernColor}80`;
  ctx.strokeStyle = wyvernColor;
  ctx.lineWidth = 2;

  // Left wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-wingSpan * 0.5, -radius * 0.4, -wingSpan, 0);
  ctx.quadraticCurveTo(-wingSpan * 0.6, radius * 0.3, 0, radius * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(wingSpan * 0.5, -radius * 0.4, wingSpan, 0);
  ctx.quadraticCurveTo(wingSpan * 0.6, radius * 0.3, 0, radius * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // BODY (dark oval)
  ctx.fillStyle = wyvernColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.4, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // HEAD (small triangle)
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.6);
  ctx.lineTo(-radius * 0.2, -radius * 0.3);
  ctx.lineTo(radius * 0.2, -radius * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // EYES (glowing red)
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(-radius * 0.1, -radius * 0.4, 2, 0, Math.PI * 2);
  ctx.arc(radius * 0.1, -radius * 0.4, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // SMOKE TRAILS (dark corruption)
  if (!isMobile()) {
    for (let i = 0; i < 3; i++) {
      const smokeX = cx + (Math.random() - 0.5) * radius * 0.5;
      const smokeY = cy + radius * 0.5 + i * 5;
      ctx.fillStyle = '#1f2937';
      ctx.globalAlpha = 0.4 - i * 0.1;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, 3 - i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
```

---

#### 2b. Giant Bat (Medium Obstacles, Top-Down)

**Visual Description:**

- Large bat with leathery wings
- Elongated body with visible ears
- Fangs visible (menacing)
- Wing membrane semi-transparent
- Flapping animation

**Top-Down Anatomy:**

```
  /\ /\  (ears)
   \o/   (head with eyes)
<--[]--> (body with bat wings)
```

**Renderer:**

```typescript
/**
 * Draws giant bat from top-down view
 *
 * Features:
 * - Leathery bat wings with visible bones
 * - Large ears pointing upward
 * - Red eyes and visible fangs
 * - Wing flapping animation
 * - Semi-transparent wing membrane
 */
function drawBat(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const theme = getCurrentTheme();
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;
  const rotation = obstacle.rotation;

  // Wing animation
  const wingExtension = Math.sin(rotation * 3) * 0.3 + 1; // 0.7 to 1.3

  ctx.save();
  ctx.translate(cx, cy);

  const batColor = '#6b7280'; // Medium gray
  const eyeColor = '#dc2626'; // Red eyes

  // WINGS (leathery, bat-wing style)
  const wingSpan = radius * 1.6 * wingExtension;
  ctx.fillStyle = `${batColor}60`;
  ctx.strokeStyle = batColor;
  ctx.lineWidth = 1.5;

  // Left wing
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-wingSpan * 0.4, -radius * 0.5, -wingSpan, -radius * 0.2);
  ctx.quadraticCurveTo(-wingSpan * 0.5, radius * 0.2, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing bones (left)
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-wingSpan * (i / 3), -radius * (i === 1 ? 0.4 : 0.3));
    ctx.stroke();
  }

  // Right wing
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(wingSpan * 0.4, -radius * 0.5, wingSpan, -radius * 0.2);
  ctx.quadraticCurveTo(wingSpan * 0.5, radius * 0.2, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing bones (right)
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(wingSpan * (i / 3), -radius * (i === 1 ? 0.4 : 0.3));
    ctx.stroke();
  }

  // BODY (small furry oval)
  ctx.fillStyle = batColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.3, radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // HEAD (top of body)
  ctx.beginPath();
  ctx.arc(0, -radius * 0.3, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // EARS (pointed triangles)
  ctx.beginPath();
  ctx.moveTo(-radius * 0.2, -radius * 0.5);
  ctx.lineTo(-radius * 0.3, -radius * 0.7);
  ctx.lineTo(-radius * 0.15, -radius * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(radius * 0.2, -radius * 0.5);
  ctx.lineTo(radius * 0.3, -radius * 0.7);
  ctx.lineTo(radius * 0.15, -radius * 0.55);
  ctx.closePath();
  ctx.fill();

  // EYES (red glowing)
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(-radius * 0.1, -radius * 0.3, 1.5, 0, Math.PI * 2);
  ctx.arc(radius * 0.1, -radius * 0.3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // FANGS (tiny white dots)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-radius * 0.05, -radius * 0.2, 1, 0, Math.PI * 2);
  ctx.arc(radius * 0.05, -radius * 0.2, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
```

---

#### 2c. Magical Crystal (Small Obstacles, Top-Down)

**Visual Description:**

- Floating geometric crystal (hexagonal or octagonal)
- Pulsing magical glow
- Rotating slowly
- Glowing core (bright center)
- Faceted edges (sharp geometric)

**Top-Down Anatomy:**

```
    /\
   /  \
  |<>  | (hexagonal crystal with glowing core)
   \  /
    \/
```

**Renderer:**

```typescript
/**
 * Draws magical crystal from top-down view
 *
 * Features:
 * - Geometric hexagonal shape
 * - Pulsing glow effect
 * - Rotating animation
 * - Bright glowing core
 * - Arcane energy particles orbiting
 */
function drawCrystal(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const theme = getCurrentTheme();
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;
  const rotation = obstacle.rotation;

  // Pulsing glow
  const pulse = Math.sin(rotation * 4) * 0.15 + 1; // 0.85 to 1.15

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation * 0.5); // Slow rotation

  const crystalColor = '#8b5cf6'; // Purple magic

  // Outer glow
  if (!isMobile()) {
    ctx.strokeStyle = crystalColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3 * pulse;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * radius * 1.2;
      const y = Math.sin(angle) * radius * 1.2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Hexagonal crystal body
  ctx.fillStyle = `${crystalColor}60`;
  ctx.strokeStyle = crystalColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner facets (lines from center to corners)
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Glowing core
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.4);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.5, crystalColor);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.4 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Orbiting arcane particles (3 small dots)
  if (!isMobile()) {
    for (let i = 0; i < 3; i++) {
      const orbitAngle = rotation * 3 + (i / 3) * Math.PI * 2;
      const orbitRadius = radius * 1.3;
      const particleX = cx + Math.cos(orbitAngle) * orbitRadius;
      const particleY = cy + Math.sin(orbitAngle) * orbitRadius;

      ctx.fillStyle = crystalColor;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
```

---

### 3. Bullets: Fireballs 🔥

**Visual Description:**

- Spherical core (bright orange-red)
- Trailing flame particles (3-5 particles)
- Pulsing/flickering animation
- Smoke wisps at tail end

**Rendering Function:**

```typescript
/**
 * Renders bullets as fireballs with particle trails
 *
 * Features:
 * - Pulsing orange-red core
 * - 3-5 trailing flame particles
 * - Decreasing size and opacity
 * - Slight smoke effect (gray particles at end)
 */
export function drawFireball(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
  const theme = getCurrentTheme();
  const x = bullet.x;
  const y = bullet.y;
  const radius = bullet.radius;

  // Pulsing animation
  const pulse = Math.sin(performance.now() / 100) * 0.2 + 1; // 0.8 to 1.2
  const coreRadius = radius * pulse;

  // Trail particles (behind bullet)
  const particleCount = 5;
  for (let i = 1; i <= particleCount; i++) {
    const particleY = y + radius * 2 + i * 5; // Trail downward
    const particleRadius = radius * (1 - i * 0.15);
    const opacity = 1 - i * 0.18;

    // Flame particles (orange to yellow)
    const flameColor = i < 4 ? '#fb923c' : '#fbbf24';
    ctx.fillStyle = flameColor;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, particleY, particleRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Smoke wisps (last 2 particles, gray)
  for (let i = 4; i <= 5; i++) {
    const smokeY = y + radius * 2 + i * 5;
    const smokeRadius = radius * 0.5;
    ctx.fillStyle = '#9ca3af';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x + (Math.random() - 0.5) * 3, smokeY, smokeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Core fireball (bright center)
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, coreRadius);
  gradient.addColorStop(0, '#fef3c7'); // Bright yellow-white center
  gradient.addColorStop(0.4, '#f97316'); // Orange middle
  gradient.addColorStop(1, '#dc2626'); // Red edge

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // Outer glow (subtle)
  if (!isMobile()) {
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
```

---

### 4. Powerups: Magic Items 🔮

#### Shield Powerup: Magic Rune Circle ⭐

**Visual Description:**

- Circular runic shield (rotating)
- Glowing purple runes around edge
- Pentagram or hexagram in center
- Pulsing magical energy

```typescript
/**
 * Renders shield powerup as a magical rune circle
 *
 * Features:
 * - Rotating outer rune ring
 * - Central geometric symbol (pentagram/hexagram)
 * - Pulsing glow effect
 * - Glowing particle motes orbiting
 */
export function drawRuneShield(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const size = powerup.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  const time = performance.now() / 1000;
  const rotation = time * 0.5; // Slow rotation
  const pulse = Math.sin(time * 2) * 0.1 + 1; // 0.9 to 1.1

  ctx.save();
  ctx.translate(cx, cy);

  // Outer glow
  if (!isMobile()) {
    ctx.strokeStyle = theme.colors.powerupShield;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.3 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Rotating rune ring
  ctx.rotate(rotation);
  ctx.strokeStyle = theme.colors.powerupShield;
  ctx.fillStyle = `${theme.colors.powerupShield}40`;
  ctx.lineWidth = 2;

  // Outer circle
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Rune symbols around edge (8 small arcane marks)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const runeX = Math.cos(angle) * size * 0.35;
    const runeY = Math.sin(angle) * size * 0.35;

    // Simple rune (vertical line with diagonal cross)
    ctx.save();
    ctx.translate(runeX, runeY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.05);
    ctx.lineTo(0, size * 0.05);
    ctx.moveTo(-size * 0.03, 0);
    ctx.lineTo(size * 0.03, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Central pentagram
  ctx.rotate(-rotation); // Counter-rotate back to draw pentagram upright
  drawPentagram(ctx, 0, 0, size * 0.25, theme.colors.powerupShield);

  ctx.restore();

  // Orbiting particle motes (3 small glowing dots)
  for (let i = 0; i < 3; i++) {
    const orbitAngle = rotation * 2 + (i / 3) * Math.PI * 2;
    const orbitRadius = size * 0.45;
    const moteX = cx + Math.cos(orbitAngle) * orbitRadius;
    const moteY = cy + Math.sin(orbitAngle) * orbitRadius;

    ctx.fillStyle = theme.colors.powerupShield;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(moteX, moteY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawPentagram(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
): void {
  // 5-pointed star (pentagram)
  ctx.strokeStyle = color;
  ctx.fillStyle = `${color}20`;
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i <= 5; i++) {
    const angle = ((i * 4) / 5) * Math.PI * 2 - Math.PI / 2; // Star point order
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
```

#### Blaster Powerup: Spell Tome 📖

**Visual Description:**

- Floating open book
- Glowing green pages with magical symbols
- Particles rising from pages (sparkles)
- Book gently bobbing up/down

```typescript
/**
 * Renders blaster powerup as a magical spell tome
 *
 * Features:
 * - Open book with pages
 * - Glowing magical symbols on pages
 * - Rising sparkle particles
 * - Gentle floating animation
 */
export function drawSpellTome(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const size = powerup.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  const time = performance.now() / 1000;
  const bobOffset = Math.sin(time * 2) * size * 0.05; // Gentle bob

  ctx.strokeStyle = theme.colors.powerupBlaster;
  ctx.fillStyle = `${theme.colors.powerupBlaster}60`;
  ctx.lineWidth = 2;

  // Book cover (two rectangles forming open book)
  const bookWidth = size * 0.7;
  const bookHeight = size * 0.5;

  // Left page
  ctx.fillStyle = `${theme.colors.powerupBlaster}40`;
  ctx.fillRect(cx - bookWidth / 2, cy - bookHeight / 2 + bobOffset, bookWidth / 2 - 2, bookHeight);
  ctx.strokeRect(
    cx - bookWidth / 2,
    cy - bookHeight / 2 + bobOffset,
    bookWidth / 2 - 2,
    bookHeight
  );

  // Right page
  ctx.fillRect(cx + 2, cy - bookHeight / 2 + bobOffset, bookWidth / 2 - 2, bookHeight);
  ctx.strokeRect(cx + 2, cy - bookHeight / 2 + bobOffset, bookWidth / 2 - 2, bookHeight);

  // Spine (center line)
  ctx.beginPath();
  ctx.moveTo(cx, cy - bookHeight / 2 + bobOffset);
  ctx.lineTo(cx, cy + bookHeight / 2 + bobOffset);
  ctx.stroke();

  // Magical symbols on pages (arcane squiggles)
  ctx.strokeStyle = theme.colors.powerupBlaster;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.7;

  // Left page symbols (3 lines)
  for (let i = 0; i < 3; i++) {
    const lineY = cy - bookHeight * 0.3 + i * bookHeight * 0.2 + bobOffset;
    ctx.beginPath();
    ctx.moveTo(cx - bookWidth * 0.4, lineY);
    ctx.lineTo(cx - bookWidth * 0.1, lineY);
    ctx.stroke();
  }

  // Right page symbols (3 lines)
  for (let i = 0; i < 3; i++) {
    const lineY = cy - bookHeight * 0.3 + i * bookHeight * 0.2 + bobOffset;
    ctx.beginPath();
    ctx.moveTo(cx + bookWidth * 0.1, lineY);
    ctx.lineTo(cx + bookWidth * 0.4, lineY);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // Rising sparkle particles (5 small dots)
  for (let i = 0; i < 5; i++) {
    const sparkleOffset = (time * 30 + i * 15) % 50; // Rise and reset
    const sparkleX = cx + (Math.random() - 0.5) * bookWidth;
    const sparkleY = cy + bookHeight / 2 + bobOffset - sparkleOffset;
    const sparkleSize = 1 + Math.random();

    ctx.fillStyle = theme.colors.powerupBlaster;
    ctx.globalAlpha = 1 - sparkleOffset / 50;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Glow effect
  if (!isMobile()) {
    ctx.strokeStyle = theme.colors.powerupBlaster;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(cx - bookWidth / 2, cy - bookHeight / 2 + bobOffset, bookWidth, bookHeight);
    ctx.globalAlpha = 1;
  }
}
```

---

### 5. Background: Castle Ruins + Floating Embers 🔥

**Visual Description:**

- Dark medieval sky (dusk/night gradient)
- Silhouetted castle ruins in far background (parallax layers)
- Floating ember particles (replacing stars)
- Optional: Moon or distant torchlight glow

**Rendering Function:**

```typescript
/**
 * Medieval fantasy background with castle ruins and floating embers
 *
 * Features:
 * - Gradient sky (purple dusk to dark blue night)
 * - Layered castle silhouettes (parallax effect)
 * - Floating ember particles (glowing orange)
 * - Optional moon in upper corner
 */
export function setupMedievalBackground(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = getCurrentTheme();
  const emberCount = isMobile() ? 40 : 100;

  type Ember = {
    x: number;
    y: number;
    size: number;
    speed: number;
    drift: number;
    opacity: number;
    flicker: number; // Flicker phase offset
  };

  const embers: Ember[] = [];

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Initialize ember particles
  for (let i = 0; i < emberCount; i++) {
    embers.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.15 + 0.05, // Slow rise
      drift: (Math.random() - 0.5) * 0.1, // Gentle horizontal drift
      opacity: Math.random() * 0.6 + 0.3,
      flicker: Math.random() * Math.PI * 2,
    });
  }

  function animate(): void {
    if (!ctx) return;

    // SKY GRADIENT (dusk/night)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#4c1d95'); // Deep purple at top
    skyGradient.addColorStop(0.4, '#1e1b4b'); // Dark indigo middle
    skyGradient.addColorStop(1, '#0f172a'); // Near-black at bottom

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // MOON (upper right corner)
    if (!isMobile()) {
      const moonX = canvas.width * 0.85;
      const moonY = canvas.height * 0.15;
      const moonRadius = 40;

      // Moon glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 3);
      moonGlow.addColorStop(0, 'rgba(250, 250, 210, 0.1)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGlow;
      ctx.fillRect(moonX - moonRadius * 3, moonY - moonRadius * 3, moonRadius * 6, moonRadius * 6);

      // Moon body
      ctx.fillStyle = '#fafad2';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters (darker circles)
      ctx.fillStyle = 'rgba(100, 100, 80, 0.3)';
      ctx.beginPath();
      ctx.arc(moonX - 10, moonY - 5, 8, 0, Math.PI * 2);
      ctx.arc(moonX + 5, moonY + 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // CASTLE RUINS SILHOUETTES (layered parallax)
    if (!isMobile()) {
      drawCastleSilhouette(ctx, canvas.width, canvas.height, 0.9, 0.15); // Far layer
      drawCastleSilhouette(ctx, canvas.width, canvas.height, 0.8, 0.25); // Mid layer
      drawCastleSilhouette(ctx, canvas.width, canvas.height, 0.7, 0.4); // Near layer
    }

    // FLOATING EMBERS
    const time = performance.now() / 1000;

    embers.forEach((ember) => {
      // Update position
      ember.y -= ember.speed; // Rise upward
      ember.x += ember.drift; // Gentle horizontal drift

      // Wrap around
      if (ember.y < -10) {
        ember.y = canvas.height + 10;
        ember.x = Math.random() * canvas.width;
      }
      if (ember.x < 0) ember.x = canvas.width;
      if (ember.x > canvas.width) ember.x = 0;

      // Flickering opacity
      const flicker = Math.sin(time * 2 + ember.flicker) * 0.2 + 0.8; // 0.6 to 1.0
      const currentOpacity = ember.opacity * flicker;

      // Draw ember with glow
      if (!isMobile()) {
        // Outer glow
        ctx.fillStyle = `rgba(251, 146, 60, ${currentOpacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core ember
      ctx.fillStyle = theme.colors.starfield; // Gold/orange
      ctx.globalAlpha = currentOpacity;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Draws a layered castle silhouette
 *
 * @param ctx - Canvas context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param yPosition - Vertical position (0-1, where 1 is bottom)
 * @param opacity - Silhouette opacity
 */
function drawCastleSilhouette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  yPosition: number,
  opacity: number
): void {
  const baseY = height * yPosition;
  const baseHeight = height * 0.3;

  ctx.fillStyle = `rgba(30, 27, 75, ${opacity})`; // Dark purple-blue
  ctx.beginPath();

  // Castle outline (simplified towers and walls)
  ctx.moveTo(0, baseY);

  // Left tower
  ctx.lineTo(width * 0.1, baseY);
  ctx.lineTo(width * 0.1, baseY - baseHeight * 0.6);
  ctx.lineTo(width * 0.12, baseY - baseHeight * 0.6);
  ctx.lineTo(width * 0.12, baseY - baseHeight * 0.7);
  ctx.lineTo(width * 0.11, baseY - baseHeight * 0.7);
  ctx.lineTo(width * 0.11, baseY - baseHeight * 0.8);
  ctx.lineTo(width * 0.13, baseY - baseHeight * 0.8);
  ctx.lineTo(width * 0.13, baseY - baseHeight * 0.7);
  ctx.lineTo(width * 0.12, baseY - baseHeight * 0.7);
  ctx.lineTo(width * 0.15, baseY - baseHeight * 0.6);
  ctx.lineTo(width * 0.15, baseY);

  // Wall section
  ctx.lineTo(width * 0.3, baseY);
  ctx.lineTo(width * 0.3, baseY - baseHeight * 0.4);

  // Central keep
  ctx.lineTo(width * 0.35, baseY - baseHeight * 0.4);
  ctx.lineTo(width * 0.35, baseY - baseHeight);
  ctx.lineTo(width * 0.45, baseY - baseHeight);
  ctx.lineTo(width * 0.45, baseY - baseHeight * 0.4);

  // Right wall
  ctx.lineTo(width * 0.7, baseY - baseHeight * 0.4);
  ctx.lineTo(width * 0.7, baseY);

  // Right tower
  ctx.lineTo(width * 0.85, baseY);
  ctx.lineTo(width * 0.85, baseY - baseHeight * 0.5);
  ctx.lineTo(width * 0.9, baseY - baseHeight * 0.5);
  ctx.lineTo(width * 0.9, baseY);

  // Bottom edge
  ctx.lineTo(width, baseY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();

  ctx.fill();
}
```

---

## 📦 Implementation Phases

### Phase 1: Setup & Theme Definition (30 minutes)

**Goal**: Create theme infrastructure without renderers (fallback to defaults)

**Tasks**:

1. Create renderer directory structure
2. Define theme constants in `themeConstants.ts`
3. Add theme to registry
4. Verify theme appears in settings UI
5. Test theme switching (should show default renderers with medieval colors)

**Files Created**:

```
src/core/themes/renderers/medieval/
├── index.ts                    // Exports all renderers
├── dragonRenderer.ts          // Player renderer (stub)
├── debrisRenderer.ts          // Obstacle renderer (stub)
├── fireballRenderer.ts        // Bullet renderer (stub)
├── powerupRenderers.ts        // Rune shield + spell tome (stub)
└── medievalBackground.ts      // Background renderer (stub)
```

**Files Modified**:

- `src/core/themes/themeConstants.ts` - Add `MEDIEVAL_THEME` definition

**Success Criteria**:

- ✅ Theme appears in settings dropdown
- ✅ Theme switches successfully
- ✅ Colors apply correctly
- ✅ No console errors

---

### Phase 2: Dragon Renderer (1.5 hours)

**Goal**: Implement fully animated dragon with wings, tail, fire breath

**Tasks**:

1. Implement `drawDragon()` main function
2. Implement component functions:
   - `drawDragonBody()`
   - `drawDragonHead()`
   - `drawDragonWings()` with animation
   - `drawDragonTail()` with sway
   - `drawRider()`
   - `drawFireBreath()` particles
   - `drawMagicShield()` rune effect
3. Test animations (wing flapping, tail sway, fire particles)
4. Mobile optimization (reduce particle counts)

**Files Modified**:

- `src/core/themes/renderers/medieval/dragonRenderer.ts`
- `src/core/themes/renderers/medieval/index.ts`

**Success Criteria**:

- ✅ Dragon renders with all components
- ✅ Wing animation cycles smoothly
- ✅ Tail sways naturally
- ✅ Fire breath appears when moving
- ✅ Shield effect shows magic rune
- ✅ Performance: 60 FPS maintained

---

### Phase 3: Castle Debris Renderer (1.5 hours)

**Goal**: Implement variety-based obstacle rendering (towers, walls, barrels, stones, bricks)

**Tasks**:

1. Implement `drawCastleDebris()` main function with type switching
2. Implement debris type functions:
   - `drawTowerDebris()` - Battlements, windows, bricks
   - `drawWallDebris()` - Broken wall fragments
   - `drawBarrelDebris()` - Wooden barrel with bands
   - `drawStoneDebris()` - Irregular polygon
   - `drawBrickDebris()` - Small rectangular brick
3. Test all size variants (ensure correct type assignment)
4. Test rotation (debris should rotate naturally)

**Files Modified**:

- `src/core/themes/renderers/medieval/debrisRenderer.ts`
- `src/core/themes/renderers/medieval/index.ts`

**Success Criteria**:

- ✅ All debris types render correctly
- ✅ Size-based type assignment works
- ✅ Rotation reveals different faces
- ✅ Visual variety across obstacle sizes
- ✅ Performance: No FPS drop with many obstacles

---

### Phase 4: Fireball Renderer (45 minutes)

**Goal**: Implement fireball with particle trail and smoke

**Tasks**:

1. Implement `drawFireball()` function
2. Implement particle trail (5 particles, decreasing size/opacity)
3. Implement smoke wisps (last 2 particles)
4. Add pulsing animation to core
5. Add radial gradient for core glow

**Files Modified**:

- `src/core/themes/renderers/medieval/fireballRenderer.ts`
- `src/core/themes/renderers/medieval/index.ts`

**Success Criteria**:

- ✅ Fireball has glowing gradient core
- ✅ Particle trail renders smoothly
- ✅ Smoke effect appears at tail
- ✅ Pulsing animation looks natural
- ✅ Performance: No impact on bullet-heavy scenes

---

### Phase 5: Powerup Renderers (1 hour)

**Goal**: Implement rune shield and spell tome powerups

**Tasks**:

1. Implement `drawRuneShield()`:
   - Rotating rune ring
   - Central pentagram
   - Pulsing glow
   - Orbiting particles
2. Implement `drawSpellTome()`:
   - Open book pages
   - Magical symbols
   - Rising sparkles
   - Bobbing animation
3. Test both powerup pickups and active states

**Files Modified**:

- `src/core/themes/renderers/medieval/powerupRenderers.ts`
- `src/core/themes/renderers/medieval/index.ts`

**Success Criteria**:

- ✅ Rune shield rotates smoothly
- ✅ Pentagram renders correctly
- ✅ Spell tome pages show symbols
- ✅ Sparkles rise from tome
- ✅ Both animations look magical
- ✅ Performance: Smooth on mobile

---

### Phase 6: Medieval Background (1 hour)

**Goal**: Implement castle ruins silhouettes and floating embers

**Tasks**:

1. Implement `setupMedievalBackground()`:
   - Sky gradient (purple to dark blue)
   - Moon with glow effect
   - Layered castle silhouettes (parallax)
   - Floating ember particles
2. Implement `drawCastleSilhouette()` helper
3. Test ember flickering and rising animation
4. Mobile optimization (reduce ember count, skip moon/castles)

**Files Modified**:

- `src/core/themes/renderers/medieval/medievalBackground.ts`
- `src/core/themes/renderers/medieval/index.ts`
- `src/core/main.ts` or `src/effects/backgroundManager.ts` (theme-aware background init)

**Success Criteria**:

- ✅ Sky gradient renders smoothly
- ✅ Moon appears with glow (desktop)
- ✅ Castle silhouettes create depth
- ✅ Embers flicker and rise naturally
- ✅ Performance: 60 FPS maintained
- ✅ Mobile: Simplified background performs well

---

### Phase 7: Integration & Testing (1 hour)

**Goal**: Wire up all renderers to theme system, comprehensive testing

**Tasks**:

1. Update `MEDIEVAL_THEME` in `themeConstants.ts` with all renderers
2. Test theme switching (default → medieval → underwater → back)
3. Test all gameplay scenarios:
   - Player movement and firing
   - Obstacle spawning and destruction
   - Powerup collection and effects
   - Level progression
   - Game over and restart
4. Test on mobile device
5. Performance testing (FPS, frame times)
6. Visual QA (all animations, all entity types)

**Files Modified**:

- `src/core/themes/themeConstants.ts`

**Testing Checklist**:

- ✅ Theme switches instantly
- ✅ All entities render correctly
- ✅ Animations smooth and natural
- ✅ No visual glitches or flickering
- ✅ Performance meets targets (60 FPS desktop, 30+ FPS mobile)
- ✅ Mobile controls work with new visuals
- ✅ Audio plays correctly with medieval theme
- ✅ Settings persist across sessions
- ✅ No console errors or warnings

---

### Phase 8: Documentation & Polish (30 minutes)

**Goal**: Create ADR, update documentation, final polish

**Tasks**:

1. Create ADR-008: Medieval Fantasy Theme Implementation
2. Update README with medieval theme description
3. Update DEVELOPER_GUIDE with medieval theme examples
4. Screenshot/GIF creation for documentation
5. Final color tweaks based on playtesting
6. Animation timing adjustments if needed

**Files Created**:

- `docs/architecture/decisions/ADR-008-medieval-fantasy-theme.md`

**Files Modified**:

- `README.md`
- `docs/DEVELOPER_GUIDE.md`

**Success Criteria**:

- ✅ ADR documents design decisions
- ✅ README shows medieval theme
- ✅ Developer guide explains medieval renderer usage
- ✅ Visual assets captured for docs

---

## 📊 Estimated Effort

| Phase                   | Tasks                        | Estimated Time  | Complexity      |
| ----------------------- | ---------------------------- | --------------- | --------------- |
| **Phase 1: Setup**      | Theme infrastructure         | 30 min          | Low             |
| **Phase 2: Dragon**     | Player renderer + animations | 1.5 hours       | High            |
| **Phase 3: Debris**     | Obstacle variety system      | 1.5 hours       | Medium          |
| **Phase 4: Fireball**   | Bullet renderer + particles  | 45 min          | Low             |
| **Phase 5: Powerups**   | Rune shield + spell tome     | 1 hour          | Medium          |
| **Phase 6: Background** | Castle silhouettes + embers  | 1 hour          | Medium          |
| **Phase 7: Testing**    | Integration + QA             | 1 hour          | Medium          |
| **Phase 8: Docs**       | ADR + documentation          | 30 min          | Low             |
| **TOTAL**               | **8 phases**                 | **~7.75 hours** | **Medium-High** |

---

## 🎨 Visual Reference Sketches

### Dragon Anatomy (Side View)

```
    /\___/\  (horns)
   |  o o |  (head + eyes)
    \ -- /   (snout)
     \  /
  ----====----  (body with rider on back)
 /            \
 |  []  []  [] | (scales/segments)
 \____________/
      ||  ||    (legs, optional)
       \/\/     (tail, wavy)
```

### Castle Tower Debris

```
 /‾‾‾\_/‾‾‾\  (battlements)
|           |
|  []   []  | (windows)
|==|===|==| | (brick pattern)
|__|___|__| |
|           |
 \   _____  / (broken base)
```

### Fireball Particle Trail

```
      O  (core, gradient)
     o   (flame particle)
    o    (flame particle)
   o     (flame particle)
  .      (smoke wisp)
 .       (smoke wisp)
```

---

## 🧪 Testing Strategy

### Unit Tests

**Test Files**:

- `tests/core/themes/medieval/dragonRenderer.test.ts`
- `tests/core/themes/medieval/debrisRenderer.test.ts`
- `tests/core/themes/medieval/fireballRenderer.test.ts`
- `tests/core/themes/medieval/powerupRenderers.test.ts`

**Test Cases**:

1. **Dragon Renderer**:
   - Renders all components (body, head, wings, tail, rider)
   - Wing animation cycles through full range
   - Tail sway responds to time parameter
   - Fire breath appears when velocity > threshold
   - Shield effect renders when powerup active

2. **Debris Renderer**:
   - Correct type assignment based on radius
   - All debris types render without errors
   - Rotation applied correctly
   - Mobile optimization reduces detail

3. **Fireball Renderer**:
   - Particle trail has correct count
   - Opacity decreases along trail
   - Smoke particles render at tail
   - Core pulsing animation works

4. **Powerup Renderers**:
   - Rune shield rotates smoothly
   - Pentagram geometry correct
   - Spell tome pages render
   - Sparkles animate upward

### Visual Regression Tests

- Screenshot comparison for each renderer
- Animation frame capture (wing positions, particle trails)
- Theme switching transitions

### Performance Tests

- FPS benchmarking with medieval theme active
- Frame time budgets (16.67ms target)
- Mobile performance validation
- Memory usage monitoring (no leaks from particles)

---

## 🔧 Technical Notes

### Animation Timing

All animations use `performance.now()` for consistent timing:

```typescript
const time = performance.now() / 1000; // Convert to seconds
const wingBeat = Math.sin(time * 3); // 3 Hz frequency
const tailSway = Math.sin(time * 2); // 2 Hz frequency
```

### Mobile Optimizations

Mobile-specific adjustments:

- Reduce particle counts (embers: 100 → 40, fire trail: 5 → 3)
- Skip complex effects (moon, castle silhouettes, glows)
- Simplify debris types (fewer vertices)
- Lower animation frame rates if needed

### Color Consistency

All colors sourced from theme object:

```typescript
const theme = getCurrentTheme();
ctx.fillStyle = theme.colors.player; // Always use theme colors
```

### Performance Budget

Target performance:

- **Desktop**: 60 FPS (16.67ms per frame)
- **Mobile**: 30+ FPS (33.33ms per frame)
- **Particle systems**: < 2ms per frame
- **Renderer overhead**: < 0.5ms per entity

---

## ✅ Success Criteria

This design achieves **zero code duplication** through:

1. ✅ **Separation of Concerns**: Data (Asteroid) vs Presentation (drawCastleDebris)
2. ✅ **Strategy Pattern**: Renderers are swappable without touching game logic
3. ✅ **Open/Closed Principle**: Open for extension (new themes), closed for modification (core game logic)
4. ✅ **Type Safety**: TypeScript enforces correct renderer signatures
5. ✅ **Performance**: No overhead - direct function calls, no extra layers
6. ✅ **Testability**: Can unit test renderers independently from game logic
7. ✅ **Rich Visuals**: Medieval atmosphere with animated dragon, varied debris, magical effects

**The codebase does NOT grow significantly** - we add ~1400 lines for medieval theme, but can support infinite themes with the same architecture (proven with underwater theme).

---

## 🚀 Future Enhancements

Once medieval theme is stable, potential additions:

1. **Dragon Variants**: Different dragon colors per difficulty level (green → red → black)
2. **Weather Effects**: Rain, fog, or lightning during gameplay
3. **Interactive Ruins**: Castle ruins react to explosions (dust particles)
4. **Sound Theme**: Medieval audio pack (dragon roars, sword clangs, magical chimes)
5. **Seasonal Variants**: Snow-covered ruins, autumn leaves, spring flowers

---

## 📝 Next Steps

Ready to implement? Here's the recommended order:

1. ✅ **Review this spec** - Ensure design meets your requirements
2. 🔜 **Phase 1: Setup** - Create theme infrastructure (30 min)
3. 🔜 **Phase 2: Dragon** - Most complex renderer, sets visual tone (1.5 hours)
4. 🔜 **Phase 3: Debris** - Variety system adds depth (1.5 hours)
5. 🔜 **Phase 4-6**: Remaining renderers (2.75 hours)
6. 🔜 **Phase 7: Testing** - Integration and QA (1 hour)
7. 🔜 **Phase 8: Documentation** - ADR and docs (30 min)

**Total Estimated Effort**: ~7.75 hours for complete medieval fantasy theme with zero code duplication.

---

**Ready to proceed?** Let me know if you want me to:

- Start implementing Phase 1 (theme setup)
- Make any adjustments to this design
- Create the ADR-008 document now
- Proceed with a different phase first

🐉 Let's build this dragon! 🔥
