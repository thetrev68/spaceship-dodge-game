# Phase 5: Powerup Renderers

**Goal**: Implement rune shield and spell tome powerups

**Estimated Time**: 1 hour

**Complexity**: Medium

## Tasks

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

## Files Modified

- `src/core/themes/renderers/medieval/powerupRenderers.ts`
- `src/core/themes/renderers/medieval/index.ts`

## Success Criteria

- ✅ Rune shield rotates smoothly
- ✅ Pentagram renders correctly
- ✅ Spell tome pages show symbols
- ✅ Sparkles rise from tome
- ✅ Both animations look magical
- ✅ Performance: Smooth on mobile

## Powerup Types

### Shield Powerup: Magic Rune Circle ⭐

- Circular runic shield (rotating)
- Glowing purple runes around edge
- Pentagram in center
- Pulsing magical energy
- 3 orbiting particle motes

### Blaster Powerup: Spell Tome 📖

- Floating open book
- Glowing green pages with magical symbols
- Particles rising from pages (sparkles)
- Book gently bobbing up/down

## Technical Reference

See [MEDIEVAL_FANTASY_THEME_SPEC.md](../MEDIEVAL_FANTASY_THEME_SPEC.md#4-powerups-magic-items-) for complete implementation specifications.

## Next Phase

Proceed to [Phase 6: Medieval Background](./PHASE_6_BACKGROUND.md)
