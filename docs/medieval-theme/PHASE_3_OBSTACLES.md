# Phase 3: Medieval Obstacles Renderer

**Goal**: Implement variety-based obstacle rendering (wyverns, bats, crystals)

**Estimated Time**: 1.5 hours

**Complexity**: Medium

---

## Overview

Create three distinct obstacle types based on size, representing aerial threats appropriate for dragon combat:

- **Wyverns** (large): Hostile dragons with dark wings and smoke
- **Giant Bats** (medium): Cave creatures with leathery wings
- **Magical Crystals** (small): Arcane hazards with pulsing energy

All obstacles use **top-down perspective** to match the dragon rider view.

---

## Obstacle Type Mapping

| Size Range   | Type    | Description                                 |
| ------------ | ------- | ------------------------------------------- |
| radius ≥ 30  | Wyvern  | Hostile dragon with dark wings and smoke    |
| radius 15-29 | Bat     | Giant bat with leathery wings and fangs     |
| radius < 15  | Crystal | Magical hexagonal crystal with pulsing glow |

---

## Fragmentation Chain (Magical Transformation)

When destroyed, obstacles transform magically (see ADR-009 for rationale):

```
Wyvern (cursed creature) → 2-3 Giant Bats (released from curse)
  ↓
Giant Bat (magical construct) → 2-3 Crystals (shattered arcane form)
  ↓
Crystal (pure magic) → Sparkles (no fragments, disperses)
```

---

## Implementation

### Main Renderer Function

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

type MedievalObstacleType = 'wyvern' | 'bat' | 'crystal';

function getObstacleTypeBySize(radius: number): MedievalObstacleType {
  if (radius >= 30) return 'wyvern'; // Large obstacles
  if (radius >= 15) return 'bat'; // Medium obstacles
  return 'crystal'; // Small obstacles
}
```

---

## 1. Wyvern Renderer (Large Obstacles)

### Visual Description

**Top-Down Anatomy:**

```
    /\  (head, horns)
<--[==]--> (body with dark wings)
    ||     (tail)
     ~     (tail tip)
```

**Features:**

- Smaller hostile dragon (enemy of player's dragon)
- Spread dark wings (bat-wing style, larger wingspan than player)
- Long serpentine body with tail
- Breathing dark smoke (shows they're corrupted)
- Menacing red eyes

### Implementation

```typescript
/**
 * Draws wyvern (hostile dragon) from top-down view
 *
 * Features:
 * - Spread dark wings (larger wingspan than player)
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

## 2. Giant Bat Renderer (Medium Obstacles)

### Visual Description

**Top-Down Anatomy:**

```
  /\ /\  (ears)
   \o/   (head with eyes)
<--[]--> (body with bat wings)
```

**Features:**

- Large bat with leathery wings
- Elongated body with visible ears
- Fangs visible (menacing)
- Wing membrane semi-transparent
- Flapping animation

### Implementation

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

## 3. Magical Crystal Renderer (Small Obstacles)

### Visual Description

**Top-Down Anatomy:**

```
    /\
   /  \
  |<>  | (hexagonal crystal with glowing core)
   \  /
    \/
```

**Features:**

- Floating geometric crystal (hexagonal)
- Pulsing magical glow
- Rotating slowly
- Glowing core (bright center)
- Faceted edges (sharp geometric)
- Orbiting arcane particles

### Implementation

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

## Animation Timing

All obstacle animations use the obstacle's `rotation` property for consistent timing:

```typescript
// Wing flapping
const wingExtension = Math.sin(rotation * 3) * 0.3 + 1; // 0.7 to 1.3

// Crystal pulsing
const pulse = Math.sin(rotation * 4) * 0.15 + 1; // 0.85 to 1.15

// Tail/smoke sway
const sway = Math.sin(rotation) * radius * 0.3;
```

---

## Mobile Optimizations

For mobile devices:

- Skip smoke trails on wyverns
- Skip outer glow on crystals
- Skip orbiting particles on crystals
- Reduce wing bone details on bats
- Simplify geometric complexity where possible

---

## Color Palette

From theme configuration:

```typescript
colors: {
  asteroid: '#78716c', // Gray stone (base color for obstacles)
}
```

Obstacle-specific colors (hardcoded for thematic variety):

- **Wyvern**: `#4b5563` (dark gray), eyes `#ef4444` (red)
- **Bat**: `#6b7280` (medium gray), eyes `#dc2626` (red)
- **Crystal**: `#8b5cf6` (purple magic)

---

## Tasks Checklist

- [ ] Create `obstacleRenderer.ts` in medieval renderers folder
- [ ] Implement `drawMedievalObstacle()` main function with type switching
- [ ] Implement `getObstacleTypeBySize()` helper
- [ ] Implement `drawWyvern()` with wings, tail, smoke
- [ ] Implement `drawBat()` with leathery wings, ears, fangs
- [ ] Implement `drawCrystal()` with hexagonal geometry, glow, particles
- [ ] Export `drawMedievalObstacle` from medieval renderers `index.ts`
- [ ] Test all size variants (ensure correct type assignment)
- [ ] Test rotation and animations (wing flapping, crystal rotation)
- [ ] Verify mobile optimizations work (no smoke/glow/particles)
- [ ] Verify performance: No FPS drop with 20+ obstacles on screen

---

## Files Modified

- `src/core/themes/renderers/medieval/obstacleRenderer.ts` (create new)
- `src/core/themes/renderers/medieval/index.ts` (add export)

---

## Success Criteria

- ✅ All obstacle types render correctly (wyvern, bat, crystal)
- ✅ Size-based type assignment works (≥30 = wyvern, 15-29 = bat, <15 = crystal)
- ✅ Animations smooth (wing flapping, crystal pulse, tail sway)
- ✅ Visual variety creates rich obstacle diversity
- ✅ Mobile optimizations reduce complexity without breaking appearance
- ✅ Performance: 60 FPS maintained with 20+ obstacles
- ✅ Fragmentation chain works (wyvern → bats → crystals)

---

## Next Phase

Proceed to [Phase 4: Fireball Renderer](./PHASE_4_FIREBALL.md)
