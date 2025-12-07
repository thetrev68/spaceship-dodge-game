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
