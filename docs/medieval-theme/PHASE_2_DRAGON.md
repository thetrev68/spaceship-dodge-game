# Phase 2: Dragon Renderer

**Goal**: Implement fully animated dragon with wings, tail, fire breath

**Estimated Time**: 1.5 hours

**Complexity**: High

## Overview

Create a top-down view of a dragon rider with:

- Dragon body seen from above with outstretched wings
- Animated wing flapping (extend/retract cycle)
- Swaying tail behind dragon
- Fire breath particles streaming downward
- Rider silhouette on dragon's back
- Shield effect (magical rune circle)

## Visual Description (Bird's-Eye View)

```
        /‾\  (head, triangular)
       | o | (rider on back)
  <---[===]---> (body with extended wings)
        | |     (tail, curved)
         ~      (tail tip)
```

## Animation States

- **Wing Beat Cycle**: Wings extend outward and retract inward (sine wave)
- **Tail Sway**: Tail curves left/right behind dragon
- **Fire Breath**: Particle stream trailing behind dragon when moving upward

## Color Palette

From theme configuration:

```typescript
colors: {
  player: '#d97706',           // Amber/orange dragon
  playerEngine: 'rgba(239, 68, 68, 0.6)', // Red fire breath
  playerShield: '#a855f7',     // Purple magical shield
}
```

Additional component colors:

- Rider armor: `#8b4513` (brown leather)
- Rider helmet: `#6b7280` (gray metal)
- Rider cape: `#dc2626` (red)
- Eyes: `#fbbf24` (golden glow)

## Implementation

### Main Function

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

### Component Functions

#### 1. Dragon Tail

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
```

#### 2. Dragon Wings

```typescript
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
```

#### 3. Dragon Body

```typescript
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
```

#### 4. Dragon Head

```typescript
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
```

#### 5. Rider

```typescript
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
```

#### 6. Fire Breath

```typescript
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
```

#### 7. Magic Shield

```typescript
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

## Animation Timing

All animations use `performance.now()` for consistent timing:

```typescript
const time = performance.now() / 1000; // Convert to seconds
const wingBeat = Math.sin(time * 3); // 3 Hz frequency
const tailSway = Math.sin(time * 2); // 2 Hz frequency
```

## Mobile Optimizations

For mobile devices:

- Skip fire breath effect (check with `isMobile()`)
- Reduce particle counts if needed
- Simplify wing bone details

## Tasks Checklist

- [ ] Implement `drawDragon()` main function in `dragonRenderer.ts`
- [ ] Implement `drawDragonTail()` with 3-segment curved tail
- [ ] Implement `drawDragonWings()` with animated flapping
- [ ] Implement `drawDragonBody()` with scale texture
- [ ] Implement `drawDragonHead()` with horns and eyes
- [ ] Implement `drawRider()` with armor, helmet, and cape
- [ ] Implement `drawFireBreath()` particle trail
- [ ] Implement `drawMagicShield()` rotating pentagram
- [ ] Export `drawDragon` from `index.ts`
- [ ] Test wing flapping animation (smooth cycle)
- [ ] Test tail sway animation (natural movement)
- [ ] Test fire breath appears when moving
- [ ] Test shield effect when powerup active
- [ ] Verify 60 FPS performance maintained

## Files Modified

- `src/core/themes/renderers/medieval/dragonRenderer.ts`
- `src/core/themes/renderers/medieval/index.ts`

## Success Criteria

- ✅ Dragon renders with all components
- ✅ Wing animation cycles smoothly
- ✅ Tail sways naturally
- ✅ Fire breath appears when moving
- ✅ Shield effect shows magic rune
- ✅ Performance: 60 FPS maintained

## Next Phase

Proceed to [Phase 3: Medieval Obstacles](./PHASE_3_OBSTACLES.md)
