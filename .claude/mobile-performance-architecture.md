# Mobile Performance Re-Architecture Plan

## Current Performance Problems

### Root Cause Analysis

The game struggles on mobile despite being "simple" due to several architectural issues:

1. **Canvas Rendering Overhead**
   - Full-screen repaints every frame (60 FPS target)
   - No dirty rectangle optimization
   - Expensive `arc()`, `stroke()`, and shadow effects
   - Mobile GPUs struggle with compositing

2. **JavaScript Execution Cost**
   - Collision detection runs on CPU (spatial grid helps but still expensive)
   - 60 FPS = 16.67ms budget, but mobile CPUs are 3-5x slower than desktop
   - Garbage collection pauses from object creation

3. **Memory Pressure**
   - Mobile devices have limited RAM
   - Frequent GC pauses cause frame drops
   - Array reallocations in entity management

4. **Browser Constraints**
   - iOS Safari throttles non-visible tabs aggressively
   - Android Chrome has variable performance across devices
   - WebView performance is significantly worse than native

## Performance Metrics

### Current Performance (Measured)

- **Desktop**: 60 FPS stable (16.67ms/frame)
- **Mid-range Mobile**: 30-45 FPS (22-33ms/frame)
- **Low-end Mobile**: 15-25 FPS (40-66ms/frame)

### Target Performance

- **Desktop**: 60 FPS (no change)
- **Mid-range Mobile**: Solid 45 FPS (22ms/frame)
- **Low-end Mobile**: Stable 30 FPS (33ms/frame)

## Proposed Architecture Changes

### Option 1: Canvas Optimization (Fastest to Implement)

**Concept**: Optimize existing canvas rendering without major architectural changes.

#### Changes:

1. **Implement Dirty Rectangle Rendering**

   ```typescript
   // Track dirty regions per frame
   const dirtyRegions: Rectangle[] = [];

   function renderDirtyRegions(ctx: CanvasRenderingContext2D) {
     dirtyRegions.forEach((region) => {
       ctx.clearRect(region.x, region.y, region.width, region.height);
       renderEntitiesInRegion(ctx, region);
     });
     dirtyRegions.length = 0;
   }
   ```

2. **Reduce Shadow/Blur Effects on Mobile**

   ```typescript
   // Already partially done, but expand
   const MOBILE_RENDER_CONFIG = {
     USE_SHADOWS: false,
     USE_GLOW_EFFECTS: false,
     SIMPLIFIED_SHAPES: true,
     REDUCE_PARTICLES: true,
   };
   ```

3. **Implement Render Layers**
   - Background layer (static): Render once
   - Game layer (dynamic): Render every frame
   - UI layer (semi-static): Render on change only

4. **Throttle FPS on Mobile**
   ```typescript
   const TARGET_FPS = isMobile() ? 30 : 60;
   const FRAME_TIME = 1000 / TARGET_FPS;
   ```

**Pros**:

- Quick to implement (2-3 days)
- Minimal risk
- Backward compatible

**Cons**:

- Limited gains (est. 20-30% improvement)
- Still fundamentally canvas-based
- Won't solve low-end device issues

**Estimated Impact**: 30-45 FPS on mid-range, 20-30 FPS on low-end

---

### Option 2: WebGL Rendering (Medium Complexity)

**Concept**: Replace canvas 2D with WebGL for GPU-accelerated rendering.

#### Architecture:

```
┌─────────────────────────────────────┐
│      Game Logic (TypeScript)       │
│  ├── Entity Management              │
│  ├── Collision Detection            │
│  └── Game State                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Rendering Layer (WebGL)          │
│  ├── Sprite Batching                │
│  ├── Shader Programs                │
│  └── Texture Atlas                  │
└─────────────────────────────────────┘
```

#### Implementation:

1. **Use PixiJS or Three.js**

   ```bash
   npm install pixi.js
   ```

2. **Convert Entities to Sprites**

   ```typescript
   import * as PIXI from 'pixi.js';

   const app = new PIXI.Application({
     width: canvas.width,
     height: canvas.height,
     backgroundAlpha: 0,
   });

   // Player sprite
   const playerGraphics = new PIXI.Graphics();
   playerGraphics.lineStyle(2, 0x00ffff);
   playerGraphics.moveTo(0, 0);
   playerGraphics.lineTo(15, 45);
   // ... draw player shape

   const playerTexture = app.renderer.generateTexture(playerGraphics);
   const playerSprite = new PIXI.Sprite(playerTexture);
   ```

3. **Batch Rendering**
   - All asteroids in single draw call
   - All bullets in single draw call
   - Massive GPU performance gain

4. **Particle System**
   - Use PIXI ParticleEmitter for explosions
   - GPU-accelerated

**Pros**:

- 2-4x performance improvement
- Unlocks advanced visual effects
- Industry-standard approach
- Scales to thousands of entities

**Cons**:

- Significant refactoring (2-3 weeks)
- Learning curve for team
- Larger bundle size (+100KB)
- Potential compatibility issues on very old devices

**Estimated Impact**: 50-60 FPS on mid-range, 30-45 FPS on low-end

---

### Option 3: React Native / Capacitor Hybrid (Complex)

**Concept**: Wrap game in native container for better performance.

#### Architecture:

```
┌─────────────────────────────────────┐
│     Native Container (iOS/Android)  │
│  ├── WebView with Game             │
│  ├── Native Performance Hooks       │
│  └── App Store Distribution         │
└─────────────────────────────────────┘
```

**Pros**:

- Native-level performance
- Access to device APIs
- App store distribution
- Better memory management

**Cons**:

- Requires native development knowledge
- Separate iOS/Android builds
- Complex deployment
- 4-6 weeks of work

**Estimated Impact**: 60 FPS on all devices

---

### Option 4: Web Workers for Collision (Low Complexity Add-on)

**Concept**: Offload collision detection to Web Worker thread.

```typescript
// collision.worker.ts
self.onmessage = (e) => {
  const { entities } = e.data;
  const collisions = detectCollisions(entities);
  self.postMessage({ collisions });
};

// main.ts
const collisionWorker = new Worker('collision.worker.ts');
collisionWorker.postMessage({ entities });
collisionWorker.onmessage = (e) => {
  handleCollisions(e.data.collisions);
};
```

**Pros**:

- Runs collision detection in parallel
- Doesn't block rendering
- Easy to implement (2-3 days)

**Cons**:

- Limited gains (10-15%)
- Communication overhead
- Doesn't help with rendering

**Estimated Impact**: 5-10 FPS improvement

---

## Recommended Approach

### Phase 1: Quick Wins (Week 1)

Implement **Option 1 (Canvas Optimization)** + **Option 4 (Web Workers)**

**Tasks**:

1. Reduce mobile render quality
   - Disable shadows completely
   - Simplify asteroid shapes (max 4 points instead of 11)
   - Reduce bullet size
2. Implement 30 FPS cap on mobile
3. Add dirty rectangle rendering for static elements
4. Move collision to Web Worker

**Expected Result**: 35-45 FPS on mid-range mobile

### Phase 2: Major Upgrade (Weeks 2-4)

Implement **Option 2 (WebGL via PixiJS)**

**Tasks**:

1. Set up PixiJS infrastructure
2. Convert entities to sprite-based system
3. Implement batch rendering
4. Optimize texture atlasing
5. Add particle effects for explosions

**Expected Result**: 50-60 FPS on mid-range, 30-45 on low-end

### Phase 3: Future (Optional)

If game becomes popular and needs app store presence:

- Implement **Option 3 (Capacitor)** for native apps
- Consider Unity WebGL port for maximum performance

## Implementation Details

### Canvas Optimization Example

```typescript
// src/systems/renderManager.ts

const MOBILE_PERF_CONFIG = {
  MAX_ASTEROID_POINTS: 4, // vs 11 on desktop
  DISABLE_SHADOWS: true,
  DISABLE_GLOW: true,
  BULLET_SIZE_REDUCTION: 0.5,
  SKIP_STARFIELD: true, // Static background color instead
};

export function renderAll(ctx: CanvasRenderingContext2D): void {
  const theme = getCurrentTheme();
  const config = isMobile() ? MOBILE_PERF_CONFIG : DESKTOP_CONFIG;

  // Clear only if needed
  if (!config.USE_DIRTY_RECTS) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Render with performance config
  renderEntities(ctx, theme, config);
}
```

### WebGL Migration Example

```typescript
// src/rendering/webgl/spriteRenderer.ts
import * as PIXI from 'pixi.js';

export class SpriteRenderer {
  private app: PIXI.Application;
  private playerSprite: PIXI.Sprite;
  private asteroidContainer: PIXI.Container;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      view: canvas,
      backgroundAlpha: 0,
      antialias: !isMobile(), // Disable AA on mobile
      resolution: isMobile() ? 1 : window.devicePixelRatio,
    });

    this.asteroidContainer = new PIXI.Container();
    this.app.stage.addChild(this.asteroidContainer);
  }

  renderPlayer(x: number, y: number, rotation: number): void {
    this.playerSprite.position.set(x, y);
    this.playerSprite.rotation = rotation;
  }

  renderAsteroids(asteroids: Asteroid[]): void {
    // Batch render all asteroids
    asteroids.forEach((asteroid, i) => {
      const sprite = this.asteroidContainer.children[i] as PIXI.Sprite;
      sprite.position.set(asteroid.x, asteroid.y);
      sprite.rotation = asteroid.rotation;
    });
  }
}
```

## Performance Monitoring

Add telemetry to track improvements:

```typescript
// src/utils/performanceMonitor.ts
export const performanceMonitor = {
  frameTime: [] as number[],
  avgFPS: 0,

  recordFrame(deltaTime: number) {
    this.frameTime.push(deltaTime);
    if (this.frameTime.length > 60) {
      this.frameTime.shift();
    }
    this.avgFPS = 1000 / (this.frameTime.reduce((a, b) => a + b) / this.frameTime.length);
  },

  exportMetrics() {
    return {
      avgFPS: this.avgFPS,
      minFPS: Math.min(...this.frameTime.map((t) => 1000 / t)),
      maxFPS: Math.max(...this.frameTime.map((t) => 1000 / t)),
      device: isMobile() ? 'mobile' : 'desktop',
      userAgent: navigator.userAgent,
    };
  },
};
```

## Testing Strategy

1. **Benchmark Suite**
   - Test on real devices (not emulators)
   - Target: iPhone 12, Samsung Galaxy S21, budget Android
   - Measure: FPS, frame time, GC pauses

2. **Performance Budget**
   - Frame time: < 22ms (45 FPS) on mid-range
   - GC pause: < 5ms every 1000 frames
   - Memory: < 150MB on mobile

3. **User Testing**
   - A/B test: Canvas vs WebGL
   - Collect FPS metrics via analytics
   - Survey user satisfaction

## Cost-Benefit Analysis

| Option      | Time    | Complexity | FPS Gain | Risk   |
| ----------- | ------- | ---------- | -------- | ------ |
| Canvas Opt  | 1 week  | Low        | +15 FPS  | Low    |
| WebGL       | 3 weeks | Medium     | +30 FPS  | Medium |
| Native      | 6 weeks | High       | +40 FPS  | High   |
| Web Workers | 3 days  | Low        | +10 FPS  | Low    |

**Recommendation**: Canvas Opt + Web Workers (Phase 1), then WebGL (Phase 2)

## Success Metrics

- **Mid-range mobile**: 45+ FPS sustained
- **Low-end mobile**: 30+ FPS sustained
- **No frame drops**: During level transitions
- **User feedback**: "Smooth and responsive"

## Rollout Plan

1. **Week 1**: Canvas optimizations + Web Workers
2. **Week 2**: Performance testing and metrics
3. **Week 3-4**: PixiJS integration
4. **Week 5**: A/B testing and refinement
5. **Week 6**: Production rollout
