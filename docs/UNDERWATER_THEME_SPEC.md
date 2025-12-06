# 🌊 Underwater Theme - Technical Design Specification

**Status**: Design Phase
**Target**: Phase 2 - Asset-Based Theme System
**Approach**: Zero Code Duplication via Render Strategy Pattern

---

## 🎯 Design Goals

1. **Zero code duplication** - Same game logic, different visuals
2. **Clean abstraction** - Theme-agnostic core systems
3. **Minimal refactoring** - Additive changes only
4. **Full vector graphics** - No sprite sheets, pure canvas drawing
5. **Performance parity** - Match or exceed current render speeds

---

## 🏗️ Architecture: Render Strategy Pattern

### Current Problem
Entity rendering is **tightly coupled** to entity files:
```typescript
// src/entities/asteroid.ts
export function drawObstacles(ctx: CanvasRenderingContext2D): void {
  // Hardcoded asteroid rendering
  ctx.strokeStyle = theme.colors.asteroid;
  // ... asteroid-specific drawing ...
}
```

### Solution: Decouple Rendering via Theme System

**Key Insight**: The entity **data structure** is theme-agnostic. Only the **visual representation** changes.

```typescript
// Asteroid data is generic (position, velocity, size, shape)
type Asteroid = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
  // ... NO visual data here
}

// Rendering is theme-specific
type ObstacleRenderer = (ctx: CanvasRenderingContext2D, obstacle: Asteroid) => void;
```

---

## 📦 Proposed Type System Extensions

### 1. Theme Type Extension

**File**: `src/types/index.ts`

```typescript
/**
 * Rendering strategy for an entity type.
 * Receives entity data and renders it to canvas.
 */
export type EntityRenderer<T> = (ctx: CanvasRenderingContext2D, entity: T) => void;

/**
 * Background rendering strategy.
 * Handles full-screen background effects (starfield, ocean gradients, etc.)
 */
export type BackgroundRenderer = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;

/**
 * Particle system renderer for theme-specific effects.
 */
export type ParticleRenderer = {
  setup: (canvas: HTMLCanvasElement) => void;
  animate: () => void;
}

/**
 * Complete rendering strategy for a theme.
 * All fields are optional - falls back to default rendering.
 */
export type ThemeRenderers = {
  /** Custom player rendering (spaceship → submarine) */
  player?: EntityRenderer<Player>;

  /** Custom obstacle rendering (asteroids → jellyfish) */
  obstacle?: EntityRenderer<Asteroid>;

  /** Custom bullet rendering (laser → torpedo) */
  bullet?: EntityRenderer<Bullet>;

  /** Custom powerup rendering by type */
  powerups?: {
    shield?: EntityRenderer<ActivePowerup>;
    doubleBlaster?: EntityRenderer<ActivePowerup>;
  };

  /** Custom background rendering (starfield → ocean) */
  background?: BackgroundRenderer;

  /** Custom particle system (stars → plankton) */
  particles?: ParticleRenderer;
};

/**
 * Extended Theme type with rendering strategies.
 */
export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  colors: ColorPalette;
  uiColors: UIColorPalette;
  fonts: FontSettings;

  /** Custom rendering strategies (optional) */
  renderers?: ThemeRenderers;
};
```

### 2. No Entity Renaming Required

**Critical Design Decision**: We do NOT rename `Asteroid` → `Obstacle` or `Player` → `Vehicle`.

**Rationale**:
- Entity types are **implementation details** (internal to the codebase)
- Visual representation is **presentation logic** (theme-specific)
- Renaming creates massive git diffs and breaks existing code
- Theme system provides semantic mapping via renderers

**Mental Model**:
```
Space Theme:    Asteroid → Renders as rocky space debris
Underwater:     Asteroid → Renders as jellyfish
Future Cyberpunk: Asteroid → Renders as data fragments
```

The **data structure** stays the same (position, size, velocity). Only the **pixels drawn** change.

---

## 🎨 Rendering Pipeline Refactor

### Current Architecture

```typescript
// renderManager.ts - Hardcoded rendering
export function renderAll(ctx: CanvasRenderingContext2D): void {
  drawPlayer(ctx);          // Calls player.ts:drawPlayer()
  drawObstacles(ctx);       // Calls asteroid.ts:drawObstacles()
  drawBullets(ctx);         // Calls bullet.ts:drawBullets()
  drawPowerups(ctx);        // Calls powerup.ts:drawPowerups()
}
```

### New Architecture (Render Strategy)

```typescript
// renderManager.ts - Theme-aware rendering
import { getCurrentTheme } from '@core/themes';
import { drawPlayer as drawDefaultPlayer } from '@entities/player';
import { drawObstacles as drawDefaultObstacles } from '@entities/asteroid';
// ... other defaults

export function renderAll(ctx: CanvasRenderingContext2D): void {
  const theme = getCurrentTheme();
  const renderers = theme.renderers || {};

  // Use custom renderer if available, otherwise fall back to default
  const playerRenderer = renderers.player || drawDefaultPlayer;
  const obstacleRenderer = renderers.obstacle || drawDefaultObstacles;
  const bulletRenderer = renderers.bullet || drawDefaultBullets;
  const powerupRenderer = renderers.powerups || {
    shield: drawDefaultShield,
    doubleBlaster: drawDefaultDoubleBlaster
  };

  // Get entity data from state
  const player = playerState.player;
  const obstacles = entityState.getObstacles();
  const bullets = entityState.getBullets();
  const powerups = activePowerups;

  // Render using strategy pattern
  playerRenderer(ctx, player);

  obstacles.forEach(obstacle => obstacleRenderer(ctx, obstacle));
  bullets.forEach(bullet => bulletRenderer(ctx, bullet));
  powerups.forEach(powerup => {
    const renderer = powerup.type === 'shield'
      ? powerupRenderer.shield
      : powerupRenderer.doubleBlaster;
    renderer?.(ctx, powerup);
  });

  // HUD stays the same (theme-agnostic)
  drawScore(ctx);
  drawScorePopups(ctx);
  drawPowerupTimers(ctx);
}
```

**Key Benefits**:
- ✅ **Zero duplication** - Game logic untouched
- ✅ **Backward compatible** - Default renderers work for existing themes
- ✅ **Type safe** - TypeScript enforces correct renderer signatures
- ✅ **Testable** - Can unit test renderers independently

---

## 🐙 Underwater Theme Implementation

### Entity Mapping & Renderers

#### 1. Player: Spaceship → Submarine

**Renderer**: `src/core/themes/renderers/underwater/submarineRenderer.ts`

```typescript
/**
 * Renders player as a submarine with vector graphics.
 * Reuses player.x, player.y, player.width, player.height for positioning.
 */
export function drawSubmarine(ctx: CanvasRenderingContext2D, player: Player): void {
  const theme = getCurrentTheme();
  const x = player.x;
  const y = player.y;
  const w = player.width;
  const h = player.height;
  const cx = x + w / 2;

  ctx.strokeStyle = theme.colors.player;
  ctx.fillStyle = theme.colors.player;
  ctx.lineWidth = 2;

  // Main hull (elongated capsule)
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.5, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Conning tower (small vertical protrusion)
  ctx.strokeRect(cx - w * 0.1, y + h * 0.15, w * 0.2, h * 0.3);

  // Periscope
  ctx.beginPath();
  ctx.moveTo(cx, y + h * 0.15);
  ctx.lineTo(cx, y);
  ctx.stroke();

  // Porthole windows (3 circular windows)
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const windowX = cx - w * 0.2 + i * w * 0.2;
    ctx.beginPath();
    ctx.arc(windowX, y + h * 0.5, w * 0.06, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Propeller at rear (animated)
  const time = performance.now() / 200;
  const propellerAngle = (time % (Math.PI * 2));
  const propX = cx;
  const propY = y + h * 0.9;

  ctx.save();
  ctx.translate(propX, propY);
  ctx.rotate(propellerAngle);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, 0);
  ctx.lineTo(w * 0.1, 0);
  ctx.moveTo(0, -w * 0.1);
  ctx.lineTo(0, w * 0.1);
  ctx.stroke();
  ctx.restore();

  // Bubble trail (thrust replacement)
  if (!isMobile()) {
    const bubbleCount = 5;
    const bubbleTime = performance.now() / 100;

    for (let i = 0; i < bubbleCount; i++) {
      const offset = (bubbleTime + i * 20) % 100;
      const bubbleY = propY + offset;
      const bubbleSize = 2 + Math.sin(bubbleTime + i) * 1;

      ctx.globalAlpha = 1 - (offset / 100);
      ctx.beginPath();
      ctx.arc(propX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Shield effect (if active) - same as space theme
  if (powerUps.shield.active) {
    const radius = Math.max(w, h) * PLAYER_CONSTANTS.SHIELD_RADIUS_FACTOR;
    ctx.strokeStyle = theme.colors.playerShield;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, y + h / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
```

#### 2. Obstacles: Asteroids → Jellyfish

**Renderer**: `src/core/themes/renderers/underwater/jellyfishRenderer.ts`

```typescript
/**
 * Renders obstacles as jellyfish with pulsating bells and flowing tentacles.
 * Uses obstacle.radius for size scaling, obstacle.rotation for animation phase.
 */
export function drawJellyfish(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  const theme = getCurrentTheme();
  const cx = obstacle.x + obstacle.radius;
  const cy = obstacle.y + obstacle.radius;
  const radius = obstacle.radius;

  // Pulsating animation (reuses rotation as phase)
  const pulse = Math.sin(obstacle.rotation) * 0.1 + 1;
  const bellRadius = radius * pulse;

  ctx.strokeStyle = theme.colors.asteroid;
  ctx.fillStyle = `${theme.colors.asteroid}20`; // Translucent fill
  ctx.lineWidth = 2;

  // Bell shape (semi-circle dome)
  ctx.beginPath();
  ctx.arc(cx, cy, bellRadius, Math.PI, Math.PI * 2); // Top half
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner bell details (radial lines)
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  const innerLines = 6;
  for (let i = 0; i < innerLines; i++) {
    const angle = Math.PI + (i / innerLines) * Math.PI;
    const startX = cx + Math.cos(angle) * bellRadius * 0.3;
    const startY = cy + Math.sin(angle) * bellRadius * 0.3;
    const endX = cx + Math.cos(angle) * bellRadius;
    const endY = cy + Math.sin(angle) * bellRadius;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Tentacles (trailing behind movement direction)
  const tentacleCount = Math.max(4, Math.floor(radius / 10)); // More tentacles = bigger jellyfish
  const tentacleLength = radius * 1.5;

  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  for (let i = 0; i < tentacleCount; i++) {
    const tentacleAngle = (i / tentacleCount) * Math.PI - Math.PI / 2;
    const baseX = cx + Math.cos(Math.PI + tentacleAngle) * bellRadius * 0.8;
    const baseY = cy;

    // Wavy tentacle using quadratic curves
    const segments = 4;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);

    for (let seg = 1; seg <= segments; seg++) {
      const t = seg / segments;
      const waveOffset = Math.sin(obstacle.rotation + i + seg) * radius * 0.2;
      const segX = baseX + waveOffset;
      const segY = baseY + tentacleLength * t;

      if (seg === 1) {
        ctx.lineTo(segX, segY);
      } else {
        const prevT = (seg - 1) / segments;
        const prevWaveOffset = Math.sin(obstacle.rotation + i + seg - 1) * radius * 0.2;
        const cpX = baseX + (waveOffset + prevWaveOffset) / 2;
        const cpY = baseY + tentacleLength * (t + prevT) / 2;

        ctx.quadraticCurveTo(cpX, cpY, segX, segY);
      }
    }

    ctx.stroke();
  }

  // Bioluminescent glow on bell edge
  if (!isMobile()) {
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, bellRadius, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
```

#### 3. Bullets: Lasers → Torpedoes

**Renderer**: `src/core/themes/renderers/underwater/torpedoRenderer.ts`

```typescript
/**
 * Renders bullets as torpedoes with propeller and trail.
 */
export function drawTorpedo(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
  const theme = getCurrentTheme();
  const x = bullet.x;
  const y = bullet.y;
  const radius = bullet.radius;

  ctx.fillStyle = theme.colors.bullet;
  ctx.strokeStyle = theme.colors.bullet;
  ctx.lineWidth = 2;

  // Torpedo body (elongated capsule)
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 2.5, Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();

  // Nose cone (darker tip)
  ctx.fillStyle = `${theme.colors.bullet}CC`;
  ctx.beginPath();
  ctx.ellipse(x, y - radius * 2, radius * 0.6, radius * 0.8, Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();

  // Tail fins (4 small fins)
  ctx.strokeStyle = theme.colors.bullet;
  const finPositions = [-radius * 0.5, radius * 0.5];
  finPositions.forEach(offset => {
    ctx.beginPath();
    ctx.moveTo(x + offset, y + radius * 2);
    ctx.lineTo(x + offset * 1.5, y + radius * 2.8);
    ctx.stroke();
  });

  // Propeller (spinning at rear)
  const propTime = performance.now() / 50;
  const propAngle = (propTime % (Math.PI * 2));

  ctx.save();
  ctx.translate(x, y + radius * 2.5);
  ctx.rotate(propAngle);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.4, 0);
  ctx.lineTo(radius * 0.4, 0);
  ctx.stroke();
  ctx.restore();

  // Bubble trail (small bubbles behind torpedo)
  for (let i = 1; i <= 3; i++) {
    const bubbleY = y + radius * 2.5 + i * 5;
    const bubbleSize = radius * 0.2;
    ctx.globalAlpha = 1 - (i * 0.25);
    ctx.beginPath();
    ctx.arc(x, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
```

#### 4. Powerups: Icons → Ocean Creatures

**Renderer**: `src/core/themes/renderers/underwater/powerupRenderers.ts`

```typescript
/**
 * Renders shield powerup as an octopus.
 */
export function drawOctopusPowerup(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const size = powerup.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.strokeStyle = theme.colors.powerupShield;
  ctx.fillStyle = `${theme.colors.powerupShield}40`;
  ctx.lineWidth = 2;

  // Octopus head (bulbous mantle)
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes (two large circles)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - size * 0.15, cy - size * 0.05, size * 0.08, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.15, cy - size * 0.05, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx - size * 0.15, cy - size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.15, cy - size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // 8 Tentacles (wavy arms radiating outward)
  ctx.strokeStyle = theme.colors.powerupShield;
  ctx.lineWidth = 1.5;

  const time = performance.now() / 500;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const armLength = size * 0.4;

    ctx.beginPath();
    ctx.moveTo(cx, cy);

    // Wavy arm using quadratic curve
    const wave = Math.sin(time + i * 0.5) * size * 0.1;
    const endX = cx + Math.cos(angle) * armLength + Math.cos(angle + Math.PI / 2) * wave;
    const endY = cy + Math.sin(angle) * armLength + Math.sin(angle + Math.PI / 2) * wave;
    const cpX = cx + Math.cos(angle) * armLength * 0.5;
    const cpY = cy + Math.sin(angle) * armLength * 0.5;

    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();

    // Suction cups (small circles along arm)
    for (let j = 1; j <= 3; j++) {
      const t = j / 4;
      const suctionX = cx + Math.cos(angle) * armLength * t;
      const suctionY = cy + Math.sin(angle) * armLength * t;
      ctx.beginPath();
      ctx.arc(suctionX, suctionY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Renders double blaster powerup as a starfish.
 */
export function drawStarfishPowerup(ctx: CanvasRenderingContext2D, powerup: ActivePowerup): void {
  const theme = getCurrentTheme();
  const x = powerup.x;
  const y = powerup.y;
  const size = powerup.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.strokeStyle = theme.colors.powerupBlaster;
  ctx.fillStyle = `${theme.colors.powerupBlaster}40`;
  ctx.lineWidth = 2;

  // Starfish with 5 arms (pentagonal symmetry)
  const arms = 5;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.18;

  // Pulsing animation
  const pulse = Math.sin(performance.now() / 300) * 0.1 + 1;
  const animatedOuter = outerRadius * pulse;

  ctx.beginPath();

  for (let i = 0; i <= arms * 2; i++) {
    const angle = (i / arms / 2) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? animatedOuter : innerRadius;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Central body (circular core)
  ctx.fillStyle = theme.colors.powerupBlaster;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Texture bumps on each arm
  ctx.fillStyle = `${theme.colors.powerupBlaster}80`;
  for (let i = 0; i < arms; i++) {
    const angle = (i / arms) * Math.PI * 2 - Math.PI / 2;
    const bumpDist = size * 0.25;
    const bumpX = cx + Math.cos(angle) * bumpDist;
    const bumpY = cy + Math.sin(angle) * bumpDist;

    ctx.beginPath();
    ctx.arc(bumpX, bumpY, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

#### 5. Background: Starfield → Ocean Gradient + Plankton

**Renderer**: `src/core/themes/renderers/underwater/oceanBackground.ts`

```typescript
/**
 * Ocean background with gradient and plankton particles.
 * Replaces starfield for underwater theme.
 */
export function setupOceanBackground(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = getCurrentTheme();
  const planktonCount = isMobile() ? 50 : 120;

  type Plankton = {
    x: number;
    y: number;
    size: number;
    speed: number;
    drift: number; // Horizontal drift for current effect
    opacity: number;
  };

  const plankton: Plankton[] = [];

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Initialize plankton particles
  for (let i = 0; i < planktonCount; i++) {
    plankton.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.3 + 0.1,
      drift: (Math.random() - 0.5) * 0.2, // Horizontal drift
      opacity: Math.random() * 0.5 + 0.3,
    });
  }

  function animate(): void {
    if (!ctx) return;

    // Deep ocean gradient (darker blue at bottom, lighter at top with sun)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a4d6d'); // Lighter blue-green at top (sunlight zone)
    gradient.addColorStop(0.3, '#0d2b3d'); // Transition zone
    gradient.addColorStop(1, '#051320'); // Deep dark blue at bottom

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sunbeam effect from top-left
    if (!isMobile()) {
      const sunGradient = ctx.createRadialGradient(
        canvas.width * 0.2, // Sun position (top-left)
        0,
        0,
        canvas.width * 0.2,
        0,
        canvas.width * 0.8
      );
      sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.15)');
      sunGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.05)');
      sunGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw plankton (glowing particles)
    ctx.fillStyle = theme.colors.starfield; // Reuse starfield color

    plankton.forEach(particle => {
      // Update position
      particle.y += particle.speed;
      particle.x += particle.drift;

      // Wrap around
      if (particle.y > canvas.height) {
        particle.y = 0;
        particle.x = Math.random() * canvas.width;
      }
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;

      // Draw plankton with glow
      ctx.globalAlpha = particle.opacity;

      // Outer glow
      if (!isMobile()) {
        ctx.fillStyle = `${theme.colors.starfield}40`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core
      ctx.fillStyle = theme.colors.starfield;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
  }

  animate();
}
```

---

## 🔧 Implementation Steps

### Phase 1: Refactor Existing Code (No Breaking Changes)

#### Step 1.1: Extract Default Renderers
**Goal**: Make current rendering functions reusable as default strategies.

**Changes**:
```typescript
// src/entities/asteroid.ts
// BEFORE: Direct rendering in drawObstacles()
export function drawObstacles(ctx: CanvasRenderingContext2D): void {
  obstacles.forEach(o => {
    // ... asteroid drawing code ...
  });
}

// AFTER: Extracted default renderer
export function drawAsteroid(ctx: CanvasRenderingContext2D, obstacle: Asteroid): void {
  // ... asteroid drawing code for SINGLE obstacle ...
}

export function drawObstacles(ctx: CanvasRenderingContext2D): void {
  obstacles.forEach(o => drawAsteroid(ctx, o));
}
```

**Files to refactor**:
- `src/entities/player.ts` - Extract `drawPlayerDefault(ctx, player)`
- `src/entities/asteroid.ts` - Extract `drawAsteroid(ctx, obstacle)`
- `src/entities/bullet.ts` - Extract `drawBullet(ctx, bullet)` (already sprite-based)
- `src/entities/powerup.ts` - Extract `drawPowerup(ctx, powerup)` per type

#### Step 1.2: Update Type Definitions
**File**: `src/types/index.ts`

Add new types for renderers (see "Proposed Type System Extensions" above).

#### Step 1.3: Update RenderManager to Use Strategy Pattern
**File**: `src/systems/renderManager.ts`

```typescript
import { getCurrentTheme } from '@core/themes';
import { drawPlayerDefault } from '@entities/player';
import { drawAsteroid as drawAsteroidDefault } from '@entities/asteroid';
import { drawBullet as drawBulletDefault } from '@entities/bullet';
import { drawShieldPowerup, drawDoubleBlasterPowerup } from '@entities/powerup';
import { playerState, entityState } from '@core/state';
import { activePowerups } from '@entities/powerup';

export function renderAll(ctx: CanvasRenderingContext2D): void {
  if (gameState.value !== 'PLAYING') return;

  const theme = getCurrentTheme();
  const renderers = theme.renderers || {};

  // Player rendering
  const playerRenderer = renderers.player || drawPlayerDefault;
  playerRenderer(ctx, playerState.player);

  // Obstacle rendering
  const obstacleRenderer = renderers.obstacle || drawAsteroidDefault;
  entityState.getObstacles().forEach(o => obstacleRenderer(ctx, o));

  // Bullet rendering
  const bulletRenderer = renderers.bullet || drawBulletDefault;
  entityState.getBullets().forEach(b => bulletRenderer(ctx, b));

  // Powerup rendering
  const powerupRenderers = renderers.powerups || {
    shield: drawShieldPowerup,
    doubleBlaster: drawDoubleBlasterPowerup,
  };

  activePowerups.forEach(p => {
    const renderer = p.type === 'shield'
      ? powerupRenderers.shield
      : powerupRenderers.doubleBlaster;
    if (renderer) renderer(ctx, p);
  });

  // HUD (theme-agnostic)
  drawScore(ctx);
  drawScorePopups(ctx);
  drawPowerupTimers(ctx);
}
```

### Phase 2: Create Underwater Theme Renderers

#### Step 2.1: Create Renderer Directory Structure
```
src/core/themes/renderers/
├── underwater/
│   ├── index.ts                  // Exports all underwater renderers
│   ├── submarineRenderer.ts      // Player → Submarine
│   ├── jellyfishRenderer.ts      // Obstacle → Jellyfish
│   ├── torpedoRenderer.ts        // Bullet → Torpedo
│   ├── powerupRenderers.ts       // Octopus + Starfish
│   └── oceanBackground.ts        // Ocean gradient + plankton
└── index.ts                      // Re-exports all renderer modules
```

#### Step 2.2: Implement Each Renderer
Copy the full implementations from the "Underwater Theme Implementation" section above.

#### Step 2.3: Create Underwater Theme Definition
**File**: `src/core/themes/themeConstants.ts`

```typescript
import {
  drawSubmarine,
  drawJellyfish,
  drawTorpedo,
  drawOctopusPowerup,
  drawStarfishPowerup,
} from './renderers/underwater';

export const UNDERWATER_THEME: Theme = {
  id: 'underwater',
  name: 'Deep Ocean',
  description: 'Submarine exploration in bioluminescent depths',

  colors: {
    // Entity colors (bioluminescent palette)
    player: '#00d9ff',           // Cyan submarine
    playerEngine: 'rgba(0, 217, 255, 0.5)', // Cyan bubbles
    playerShield: '#00ffaa',     // Aqua shield
    bullet: '#ffaa00',           // Orange torpedo
    asteroid: '#9f7aea',         // Purple jellyfish

    // UI colors
    hudText: '#ffffff',
    hudAccent: '#00d9ff',
    scorePopup: '#ffffff',
    bonusPopup: '#00ffaa',
    powerupPopup: '#00d9ff',

    // Effects
    starfield: '#7dd3fc',        // Light blue plankton

    // Powerup colors
    powerupShield: '#ff6b9d',    // Pink octopus
    powerupBlaster: '#fbbf24',   // Yellow starfish
  },

  uiColors: {
    // Keep UI consistent across themes (or customize)
    overlayBackground: 'rgba(13, 43, 61, 0.85)', // Dark ocean blue
    overlayText: '#ffffff',
    overlayTitle: '#00d9ff',
    buttonBackground: 'rgba(0, 217, 255, 0.2)',
    buttonText: '#ffffff',
    buttonHover: 'rgba(0, 217, 255, 0.4)',
    buttonFocus: '#00ffaa',
    settingsButtonBackground: 'rgba(0, 217, 255, 0.2)',
    settingsButtonText: '#ffffff',
  },

  fonts: {
    family: '"Inter", sans-serif',
    hudSize: '24px',
  },

  // CUSTOM RENDERERS
  renderers: {
    player: drawSubmarine,
    obstacle: drawJellyfish,
    bullet: drawTorpedo,
    powerups: {
      shield: drawOctopusPowerup,
      doubleBlaster: drawStarfishPowerup,
    },
  },
};

// Update registry
export const THEME_REGISTRY: Record<ThemeId, Theme> = {
  default: DEFAULT_THEME,
  monochrome: MONOCHROME_THEME,
  underwater: UNDERWATER_THEME, // NEW
};

export const VALID_THEME_IDS: readonly ThemeId[] = [
  'default',
  'monochrome',
  'underwater', // NEW
] as const;
```

#### Step 2.4: Update Background System
**File**: `src/core/main.ts` or new `src/effects/backgroundManager.ts`

```typescript
import { getCurrentTheme } from '@core/themes';
import { setupStarfield } from '@effects/starfield';
import { setupOceanBackground } from '@core/themes/renderers/underwater/oceanBackground';

export function initializeBackground(canvas: HTMLCanvasElement): void {
  const theme = getCurrentTheme();

  if (theme.renderers?.background) {
    // Custom background renderer
    theme.renderers.background(canvas);
  } else if (theme.renderers?.particles) {
    // Custom particle system
    theme.renderers.particles.setup(canvas);
  } else {
    // Default starfield
    setupStarfield(canvas);
  }
}

// Watch for theme changes and reinitialize background
watchTheme(() => {
  const bgCanvas = document.getElementById('starfield-canvas') as HTMLCanvasElement;
  if (bgCanvas) {
    initializeBackground(bgCanvas);
  }
});
```

### Phase 3: Testing & Polish

#### Step 3.1: Unit Tests
**File**: `tests/core/themes/underwater/jellyfishRenderer.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { drawJellyfish } from '@core/themes/renderers/underwater';
import type { Asteroid } from '@types';

describe('Jellyfish Renderer', () => {
  it('renders jellyfish with bell and tentacles', () => {
    const ctx = getMockCanvas2D();
    const jellyfish: Asteroid = {
      x: 100,
      y: 100,
      radius: 30,
      rotation: 0,
      // ... other props
    };

    drawJellyfish(ctx, jellyfish);

    expect(ctx.arc).toHaveBeenCalled(); // Bell
    expect(ctx.quadraticCurveTo).toHaveBeenCalled(); // Tentacles
  });

  it('scales tentacle count based on size', () => {
    const ctx = getMockCanvas2D();
    const smallJelly: Asteroid = { radius: 10, /* ... */ };
    const largeJelly: Asteroid = { radius: 50, /* ... */ };

    drawJellyfish(ctx, smallJelly);
    const smallCallCount = ctx.quadraticCurveTo.mock.calls.length;

    ctx.quadraticCurveTo.mockClear();

    drawJellyfish(ctx, largeJelly);
    const largeCallCount = ctx.quadraticCurveTo.mock.calls.length;

    expect(largeCallCount).toBeGreaterThan(smallCallCount);
  });
});
```

#### Step 3.2: Visual Regression Tests
Create screenshot comparison tests to ensure visual consistency.

#### Step 3.3: Performance Testing
Benchmark rendering performance to ensure underwater theme matches or exceeds space theme FPS.

---

## 📊 Code Metrics

### Estimated Changes

| Category | Files Added | Files Modified | Lines Added | Lines Removed |
|----------|-------------|----------------|-------------|---------------|
| Type Definitions | 0 | 1 (`types/index.ts`) | ~50 | 0 |
| Renderer Refactor | 0 | 4 (entity files) | ~100 | ~50 |
| RenderManager | 0 | 1 (`renderManager.ts`) | ~40 | ~10 |
| Underwater Renderers | 6 | 0 | ~600 | 0 |
| Theme Constants | 0 | 1 (`themeConstants.ts`) | ~80 | 0 |
| Background System | 1 | 1 (`main.ts`) | ~50 | 0 |
| Tests | 5 | 0 | ~300 | 0 |
| **TOTAL** | **12** | **8** | **~1220** | **~60** |

### Code Duplication: **ZERO**

- ✅ Game logic: **100% reused** (no changes to collision, physics, spawning)
- ✅ Entity data structures: **100% reused** (Asteroid, Bullet, Player stay the same)
- ✅ UI/HUD: **100% reused** (scores, timers, overlays)
- ✅ State management: **100% reused** (reactive state, event bus)
- ✅ Audio: **100% reused** (same sound effects work thematically)

**New code is purely visual rendering** - no duplicate business logic.

---

## 🎨 Theme Switching Experience

### User Flow
1. Player opens settings (⚙️ button)
2. Sees "Theme" section with radio buttons:
   - ⚪ Space Explorer (Classic space arcade aesthetic)
   - ⚪ Monochrome (Minimalist off-white aesthetic)
   - 🔘 Deep Ocean (Submarine exploration in bioluminescent depths)
3. Selects "Deep Ocean"
4. **Instant visual transformation**:
   - Spaceship morphs into submarine
   - Asteroids become jellyfish
   - Stars fade into plankton
   - Background gradients to ocean blue
   - Sunbeam appears from top-left
5. Game continues seamlessly (no restart required)

### Performance Considerations
- **First render after switch**: ~16ms (1 frame delay to regenerate sprites if needed)
- **Steady-state FPS**: Same as current (60 FPS desktop, 30-45 FPS mobile)
- **Memory footprint**: +~50KB for renderer functions (negligible)

---

## 🚀 Future Extensibility

This architecture enables **infinite themes** with minimal effort:

### Example: Cyberpunk Theme
```typescript
export const CYBERPUNK_THEME: Theme = {
  id: 'cyberpunk',
  name: 'Neon City',
  colors: { /* neon pinks/purples */ },
  renderers: {
    player: drawHovercar,        // Flying car
    obstacle: drawDataFragment,  // Corrupt data chunks
    bullet: drawEnergyPulse,     // Energy weapon
    // ... etc
  }
};
```

### Example: Medieval Fantasy Theme
```typescript
export const FANTASY_THEME: Theme = {
  id: 'fantasy',
  name: 'Dragon Rider',
  colors: { /* earthy tones */ },
  renderers: {
    player: drawDragon,          // Flying dragon
    obstacle: drawBoulder,       // Floating rocks
    bullet: drawFireball,        // Dragon breath
    powerups: {
      shield: drawMagicShield,   // Magical barrier
      doubleBlaster: drawTwinFlames, // Dual flame breath
    }
  }
};
```

---

## ✅ Success Criteria

This design achieves **zero code duplication** through:

1. ✅ **Separation of Concerns**: Data (Asteroid) vs Presentation (drawJellyfish)
2. ✅ **Strategy Pattern**: Renderers are swappable without touching game logic
3. ✅ **Open/Closed Principle**: Open for extension (new themes), closed for modification (core game logic)
4. ✅ **Type Safety**: TypeScript enforces correct renderer signatures
5. ✅ **Performance**: No overhead - direct function calls, no extra layers
6. ✅ **Testability**: Can unit test renderers independently from game logic

**The codebase does NOT double in size** - it gains ~1200 lines for underwater theme, but can support infinite themes with the same architecture.

---

## 📝 Next Steps

1. **Review this spec** - Ensure design meets your requirements
2. **Create ADR-007** - Document this architectural decision
3. **Implement Phase 1** - Refactor existing renderers (~2 hours)
4. **Implement Phase 2** - Build underwater theme (~4-6 hours)
5. **Testing** - Unit + visual regression tests (~2 hours)
6. **Polish** - Tweak colors, animations based on playtesting (~1 hour)

**Total Estimated Effort**: 9-11 hours for full underwater theme with zero code duplication.

---

**Ready to proceed?** Let me know if you want me to:
- Create the ADR-007 document
- Start implementing Phase 1 (refactoring existing code)
- Make any adjustments to this design
