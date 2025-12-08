# Phase 7: Integration & Testing

**Goal**: Wire up all renderers to theme system, comprehensive testing

**Estimated Time**: 1 hour

**Complexity**: Medium

## Tasks

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

## Files Modified

- `src/core/themes/themeConstants.ts`

## Testing Checklist

### Functional Testing

- ✅ Theme switches instantly
- ✅ All entities render correctly
- ✅ Animations smooth and natural
- ✅ No visual glitches or flickering

### Gameplay Testing

- ✅ Player movement and firing
- ✅ Obstacle spawning and destruction
- ✅ Powerup collection and effects
- ✅ Level progression
- ✅ Game over and restart

### Performance Testing

- ✅ Performance meets targets (60 FPS desktop, 30+ FPS mobile)
- ✅ No FPS drops during heavy scenes
- ✅ Memory usage stable (no leaks)
- ✅ Frame times within budget (16.67ms desktop, 33.33ms mobile)

### Platform Testing

- ✅ Desktop: Mouse/keyboard controls work
- ✅ Mobile: Touch controls work with new visuals
- ✅ Mobile: Simplified rendering performs well

### Integration Testing

- ✅ Audio plays correctly with medieval theme
- ✅ Settings persist across sessions
- ✅ No console errors or warnings
- ✅ Theme switching doesn't break game state

## Performance Targets

- **Desktop**: 60 FPS (16.67ms per frame)
- **Mobile**: 30+ FPS (33.33ms per frame)
- **Particle systems**: < 2ms per frame
- **Renderer overhead**: < 0.5ms per entity

## Test Commands

```bash
npm run validate           # Full quality check
npm run test              # Run test suite
npm run typecheck         # TypeScript validation
npm run lint              # Code style check
npm run build             # Production build test
```

## Next Phase

Proceed to [Phase 8: Documentation & Polish](./PHASE_8_DOCS.md)
