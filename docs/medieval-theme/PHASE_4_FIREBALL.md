# Phase 4: Fireball Renderer

**Goal**: Implement fireball with particle trail and smoke

**Estimated Time**: 45 minutes

**Complexity**: Low

## Tasks

1. Implement `drawFireball()` function
2. Implement particle trail (5 particles, decreasing size/opacity)
3. Implement smoke wisps (last 2 particles)
4. Add pulsing animation to core
5. Add radial gradient for core glow

## Files Modified

- `src/core/themes/renderers/medieval/fireballRenderer.ts`
- `src/core/themes/renderers/medieval/index.ts`

## Success Criteria

- ✅ Fireball has glowing gradient core
- ✅ Particle trail renders smoothly
- ✅ Smoke effect appears at tail
- ✅ Pulsing animation looks natural
- ✅ Performance: No impact on bullet-heavy scenes

## Visual Design

```
      O  (core, gradient)
     o   (flame particle)
    o    (flame particle)
   o     (flame particle)
  .      (smoke wisp)
 .       (smoke wisp)
```

## Particle Trail Specifications

- **Count**: 5 particles
- **Size**: Decreasing (radius _ (1 - i _ 0.15))
- **Opacity**: Decreasing (1 - i \* 0.18)
- **Colors**: Orange (#fb923c) → Yellow (#fbbf24)
- **Smoke**: Last 2 particles in gray (#9ca3af)

## Technical Reference

See [MEDIEVAL_FANTASY_THEME_SPEC.md](../MEDIEVAL_FANTASY_THEME_SPEC.md#3-bullets-fireballs-) for complete implementation specifications.

## Next Phase

Proceed to [Phase 5: Powerup Renderers](./PHASE_5_POWERUPS.md)
