# Phase 6: Medieval Background

**Goal**: Implement castle ruins silhouettes and floating embers

**Estimated Time**: 1 hour

**Complexity**: Medium

## Tasks

1. Implement `setupMedievalBackground()`:
   - Sky gradient (purple to dark blue)
   - Moon with glow effect
   - Layered castle silhouettes (parallax)
   - Floating ember particles
2. Implement `drawCastleSilhouette()` helper
3. Test ember flickering and rising animation
4. Mobile optimization (reduce ember count, skip moon/castles)

## Files Modified

- `src/core/themes/renderers/medieval/medievalBackground.ts`
- `src/core/themes/renderers/medieval/index.ts`
- `src/core/main.ts` or `src/effects/backgroundManager.ts` (theme-aware background init)

## Success Criteria

- ✅ Sky gradient renders smoothly
- ✅ Moon appears with glow (desktop)
- ✅ Castle silhouettes create depth
- ✅ Embers flicker and rise naturally
- ✅ Performance: 60 FPS maintained
- ✅ Mobile: Simplified background performs well

## Visual Elements

### Sky Gradient

- Top: Deep purple (#4c1d95)
- Middle: Dark indigo (#1e1b4b)
- Bottom: Near-black (#0f172a)

### Moon (Desktop Only)

- Position: Upper right corner (85%, 15%)
- Radius: 40px
- Color: Light goldenrod (#fafad2)
- Glow effect with radial gradient

### Castle Silhouettes (Desktop Only)

- 3 parallax layers (far, mid, near)
- Varying opacity (0.15, 0.25, 0.4)
- Simplified tower and wall geometry

### Floating Embers

- Count: 100 desktop, 40 mobile
- Size: 0.5-2.5px
- Color: Gold (#fbbf24)
- Flickering animation
- Gentle upward drift

## Technical Reference

See [MEDIEVAL_FANTASY_THEME_SPEC.md](../MEDIEVAL_FANTASY_THEME_SPEC.md#5-background-castle-ruins--floating-embers-) for complete implementation specifications.

## Next Phase

Proceed to [Phase 7: Integration & Testing](./PHASE_7_TESTING.md)

From Medieval fantasy theme implementation guide:

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
