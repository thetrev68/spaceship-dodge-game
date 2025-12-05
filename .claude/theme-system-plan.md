# Theme System Implementation Plan

## Executive Summary

Implement a comprehensive theme system for Spaceship Dodge that supports color-only themes (Phase 1) while establishing the architecture for future asset-based themes (Phase 2+). The initial implementation will provide two themes: **Default** (current space theme) and **Monochrome** (off-white minimalist aesthetic).

## Goals

1. **Maintain world-class architecture** - Follow existing patterns and standards
2. **Zero breaking changes** - Backward compatible with current game
3. **Performance neutral** - No FPS impact from theme switching
4. **Extensible design** - Future-proof for asset-based themes (clown, underwater, etc.)
5. **Full test coverage** - Meet 85/85/80/85 coverage thresholds
6. **Complete documentation** - JSDoc, ADR, user guide

## Phase 1: Color-Only Themes (Current Scope)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Theme System                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Theme Manager   │────────>│  Theme Registry  │         │
│  │  (singleton)     │         │  (theme catalog) │         │
│  └────────┬─────────┘         └──────────────────┘         │
│           │                                                  │
│           │ applies                                          │
│           v                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │         Current Theme (reactive)              │          │
│  │  - colors: ColorPalette                       │          │
│  │  - fonts: FontConfig                          │          │
│  │  - type: 'default' | 'monochrome'             │          │
│  └──────────────────────────────────────────────┘          │
│           │                                                  │
│           │ consumed by                                      │
│           v                                                  │
│  ┌───────────────────────────────────────────────┐         │
│  │          Rendering Modules                     │         │
│  │  - player.ts, asteroid.ts, bullet.ts           │         │
│  │  - scoreDisplay.ts, scorePopups.ts             │         │
│  │  - powerup.ts, starfield.ts                    │         │
│  └───────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Design Decisions

#### 1. Theme Data Structure

**Location**: `src/core/themes/themeConstants.ts`

```typescript
export type ColorPalette = {
  // Entity colors
  player: string; // Player ship body
  playerEngine: string; // Engine glow
  playerShield: string; // Shield effect
  bullet: string; // Bullet projectiles
  asteroid: string; // Asteroid outlines

  // UI colors
  hudText: string; // Score, lives, level text
  hudAccent: string; // Active powerup indicators
  scorePopup: string; // Default score popup
  bonusPopup: string; // Bonus score popup
  powerupPopup: string; // Powerup collection popup

  // Effects
  starfield: string; // Background stars

  // Powerup specific
  powerupShield: string; // Shield powerup icon
  powerupBlaster: string; // Double blaster powerup icon
};

export type FontConfig = {
  family: string; // Font family
  hudSize: string; // HUD font size (e.g., '24px')
};

export type Theme = {
  id: string; // Unique theme identifier
  name: string; // Display name
  description: string; // User-facing description
  colors: ColorPalette;
  fonts: FontConfig;
};
```

**Default Theme** (current colors extracted):

```typescript
export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Space Explorer',
  description: 'Classic space arcade aesthetic',
  colors: {
    player: '#00ffff',
    playerEngine: 'rgba(0, 255, 255, 0.7)',
    playerShield: '#00ffff',
    bullet: '#ffff88',
    asteroid: '#ff4500',
    hudText: '#ffffff',
    hudAccent: '#00ffff',
    scorePopup: '#ffffff',
    bonusPopup: '#00ff00',
    powerupPopup: '#00ffff',
    starfield: '#ffffff',
    powerupShield: '#0ff',
    powerupBlaster: '#f9d71c',
  },
  fonts: {
    family: '"Inter", sans-serif',
    hudSize: '24px',
  },
};
```

**Monochrome Theme**:

```typescript
export const MONOCHROME_THEME: Theme = {
  id: 'monochrome',
  name: 'Monochrome',
  description: 'Minimalist off-white aesthetic',
  colors: {
    player: '#f5f5f0',
    playerEngine: 'rgba(245, 245, 240, 0.7)',
    playerShield: '#f5f5f0',
    bullet: '#f5f5f0',
    asteroid: '#f5f5f0',
    hudText: '#f5f5f0',
    hudAccent: '#f5f5f0',
    scorePopup: '#f5f5f0',
    bonusPopup: '#f5f5f0',
    powerupPopup: '#f5f5f0',
    starfield: '#f5f5f0',
    powerupShield: '#f5f5f0',
    powerupBlaster: '#f5f5f0',
  },
  fonts: {
    family: '"Inter", sans-serif',
    hudSize: '24px',
  },
};
```

#### 2. Theme Manager

**Location**: `src/core/themes/themeManager.ts`

**Responsibilities**:

- Maintain current theme as reactive value
- Load/save theme preference to localStorage
- Apply theme changes (triggers re-render)
- Validate theme data
- Export theme access API

**Key Functions**:

```typescript
export function getCurrentTheme(): Theme;
export function setTheme(themeId: string): void;
export function getAvailableThemes(): Theme[];
export function initializeThemeSystem(): void;
```

**Reactive State**:

```typescript
import { reactive } from '@core/state';

const currentTheme = reactive<Theme>(DEFAULT_THEME);
```

**localStorage Integration**:

- Key: `spaceshipDodgeTheme` (matches naming pattern in settingsManager)
- Store only theme ID (not full theme object)
- Fallback to default if invalid/missing
- Security: Validate theme ID against whitelist

#### 3. Settings Integration

**Location**: `src/ui/settings/settingsUI.ts`

**Changes**:

1. Add "Theme" section to settings modal
2. Radio buttons or dropdown for theme selection
3. Live preview (applies immediately on selection)
4. Persist to localStorage via settingsManager

**UI Structure**:

```
Game Settings
├─ Audio Settings (existing)
├─ Gameplay Settings (existing)
└─ Theme Settings (NEW)
   ├─ Theme: ( ) Space Explorer  (•) Monochrome
   └─ [More themes coming soon...]
```

**No changes to settingsManager.ts** - Theme preference is separate concern, managed by themeManager

### Implementation Checklist

#### Core Theme System

- [ ] **Create `src/core/themes/` directory**
  - [ ] `themeConstants.ts` - Theme definitions and type exports
  - [ ] `themeManager.ts` - Theme state management and persistence
  - [ ] `index.ts` - Public API exports

- [ ] **Define types in `src/types/index.ts`**
  - [ ] `ColorPalette` type
  - [ ] `FontConfig` type
  - [ ] `Theme` type
  - [ ] `ThemeId` union type ('default' | 'monochrome')

- [ ] **Create themes**
  - [ ] Extract default theme colors from existing code
  - [ ] Define monochrome theme
  - [ ] Theme registry with metadata

- [ ] **Implement themeManager**
  - [ ] Reactive `currentTheme` value
  - [ ] `getCurrentTheme()` accessor
  - [ ] `setTheme(id)` mutator
  - [ ] `getAvailableThemes()` catalog
  - [ ] localStorage persistence
  - [ ] Validation and error handling
  - [ ] `initializeThemeSystem()` init function

#### Refactor Rendering Code

**Strategy**: Replace hardcoded color strings with theme accessor calls

- [ ] **Update entity rendering**
  - [ ] `src/entities/player.ts` - Use `getCurrentTheme().colors.player`, etc.
  - [ ] `src/entities/asteroid.ts` - Use `getCurrentTheme().colors.asteroid`
  - [ ] `src/entities/bullet.ts` - Use `getCurrentTheme().colors.bullet`
  - [ ] `src/entities/powerup.ts` - Use theme colors for powerup icons

- [ ] **Update HUD rendering**
  - [ ] `src/ui/hud/scoreDisplay.ts` - Use `getCurrentTheme().colors.hudText`
  - [ ] `src/ui/hud/scorePopups.ts` - Use theme colors for popups
  - [ ] `src/ui/hud/powerupHUD.ts` - Use `getCurrentTheme().colors.hudAccent`
  - [ ] `src/ui/hud/perfHUD.ts` - Keep performance colors (semantic, not themed)

- [ ] **Update effects**
  - [ ] `src/effects/starfield.ts` - Use `getCurrentTheme().colors.starfield`

- [ ] **Update constants**
  - [ ] Remove hardcoded colors from `src/core/gameConstants.ts` (HUD_CONSTANTS)
  - [ ] Keep structural constants (positions, sizes, etc.)

#### Settings UI Integration

- [ ] **Update `src/ui/settings/settingsUI.ts`**
  - [ ] Add theme section to settings modal
  - [ ] Create radio button group for theme selection
  - [ ] Wire up theme change handler
  - [ ] Update ARIA labels for accessibility
  - [ ] Add keyboard navigation support

- [ ] **Update constants**
  - [ ] Add theme UI constants to `src/core/uiConstants.ts` if needed

#### Initialization

- [ ] **Update `src/core/main.ts`**
  - [ ] Import `initializeThemeSystem`
  - [ ] Call before rendering starts (after canvas setup, before game loop)
  - [ ] Ensure theme loaded from localStorage before first render

#### Testing

**Target**: 85/85/80/85 coverage thresholds

- [ ] **Unit tests**
  - [ ] `tests/core/themes/themeManager.test.ts`
    - [ ] Theme initialization
    - [ ] Theme switching
    - [ ] localStorage persistence
    - [ ] Invalid theme handling
    - [ ] Reactive updates
    - [ ] Validation logic
  - [ ] `tests/core/themes/themeConstants.test.ts`
    - [ ] Theme registry integrity
    - [ ] Color palette completeness
    - [ ] Type safety

- [ ] **Integration tests**
  - [ ] `tests/integration/themeRendering.test.ts`
    - [ ] Theme applied to all entities
    - [ ] Theme persists across sessions
    - [ ] Settings UI theme switcher
    - [ ] No visual regressions

- [ ] **Rendering tests** (update existing)
  - [ ] `tests/entities/player.render.test.ts` - Verify theme colors used
  - [ ] `tests/entities/powerup.render.test.ts` - Verify theme colors used
  - [ ] `tests/systems/renderManager.test.ts` - Theme integration

#### Documentation

- [ ] **JSDoc**
  - [ ] Comprehensive JSDoc for all public APIs
  - [ ] Usage examples in `themeManager.ts`
  - [ ] Type documentation in theme constants

- [ ] **Architecture Decision Record**
  - [ ] `docs/architecture/decisions/ADR-006-theme-system.md`
    - [ ] Context: Why add themes?
    - [ ] Decision: Centralized theme manager vs per-module theming
    - [ ] Rationale: Performance, extensibility, maintainability
    - [ ] Consequences: Migration effort, future asset support
    - [ ] Alternatives: CSS variables, inline styles, component-level themes

- [ ] **User documentation**
  - [ ] Update `CLAUDE.md` - Theme system overview
  - [ ] Update `README.md` - Theme switching instructions
  - [ ] Add theme screenshot/GIF (optional but nice)

- [ ] **Developer guide**
  - [ ] Update `docs/DEVELOPER_GUIDE.md` - "Adding New Themes" section
  - [ ] Code examples for custom themes
  - [ ] Migration guide for contributors

#### Security & Quality

- [ ] **Security audit**
  - [ ] Validate theme IDs against whitelist
  - [ ] Sanitize localStorage reads
  - [ ] No XSS vectors in theme application
  - [ ] No arbitrary code execution

- [ ] **Performance audit**
  - [ ] Profile theme switching (should be < 16ms)
  - [ ] Ensure no FPS drops during gameplay
  - [ ] Verify no memory leaks from theme changes
  - [ ] Check bundle size impact (< 2KB expected)

- [ ] **Accessibility**
  - [ ] Screen reader announcements for theme changes
  - [ ] Keyboard navigation in theme settings
  - [ ] Contrast ratios meet WCAG AA (default theme only)
  - [ ] Update `src/ui/accessibility/announcer.ts` for theme events

#### Code Quality

- [ ] **Lint & typecheck**
  - [ ] `npm run lint` passes
  - [ ] `npm run typecheck` passes
  - [ ] No TypeScript errors
  - [ ] No ESLint warnings

- [ ] **Pre-commit checks**
  - [ ] Husky hooks pass
  - [ ] Prettier formatting applied
  - [ ] Tests pass

- [ ] **Validation suite**
  - [ ] `npm run validate` passes (typecheck + lint + test:ci)

### File Changes Summary

#### New Files (8)

```
src/core/themes/
├── themeConstants.ts     (Theme definitions, ~100 lines)
├── themeManager.ts       (State management, ~150 lines)
└── index.ts              (Public exports, ~10 lines)

tests/core/themes/
├── themeManager.test.ts  (Manager tests, ~200 lines)
└── themeConstants.test.ts (Constants tests, ~50 lines)

tests/integration/
└── themeRendering.test.ts (E2E tests, ~100 lines)

docs/architecture/decisions/
└── ADR-006-theme-system.md (Architecture doc, ~300 lines)
```

#### Modified Files (~15)

**Rendering (color replacement)**:

- `src/entities/player.ts`
- `src/entities/asteroid.ts`
- `src/entities/bullet.ts`
- `src/entities/powerup.ts`
- `src/ui/hud/scoreDisplay.ts`
- `src/ui/hud/scorePopups.ts`
- `src/ui/hud/powerupHUD.ts`
- `src/effects/starfield.ts`

**Core**:

- `src/core/main.ts` (add theme init)
- `src/core/constants.ts` (remove color constants)
- `src/core/gameConstants.ts` (remove HUD color constants)
- `src/types/index.ts` (add theme types)

**UI**:

- `src/ui/settings/settingsUI.ts` (add theme section)
- `src/ui/accessibility/announcer.ts` (theme change announcements)

**Docs**:

- `CLAUDE.md`
- `README.md`
- `docs/DEVELOPER_GUIDE.md`

### Migration Strategy

#### Step 1: Create Theme Infrastructure (No Breaking Changes)

1. Create theme system files
2. Define types
3. Extract default theme from existing code
4. **Do not modify rendering code yet**

#### Step 2: Integrate with Initialization

1. Add theme initialization to `main.ts`
2. Load theme from localStorage (defaults to 'default')
3. Theme system operational but not consumed

#### Step 3: Refactor Rendering (Atomic Changes)

For each rendering module:

1. Import `getCurrentTheme` from theme manager
2. Replace hardcoded color with theme accessor
3. **Test immediately** - verify no visual regression
4. Commit

Example transformation:

```typescript
// BEFORE
ctx.fillStyle = '#ffffff';

// AFTER
import { getCurrentTheme } from '@core/themes';
ctx.fillStyle = getCurrentTheme().colors.hudText;
```

#### Step 4: Settings UI Integration

1. Add theme section to settings
2. Wire up theme switcher
3. Test theme persistence

#### Step 5: Testing & Documentation

1. Write comprehensive tests
2. Document architecture
3. Update user guides

### Performance Considerations

**Concerns**:

- Will theme accessor calls (`getCurrentTheme()`) in hot path (render loop) cause slowdown?

**Mitigations**:

1. **Cache theme at frame start**:

   ```typescript
   // In renderManager.ts, at start of renderAll()
   const theme = getCurrentTheme(); // One call per frame
   // Pass theme to entity draw functions
   ```

2. **Measure impact**:
   - Use `profiler.ts` to measure frame time before/after
   - Target: < 0.1ms overhead per frame
   - If needed: Add memoization with `memoize.ts`

3. **Reactive optimization**:
   - Theme changes are rare (user action only)
   - Reactive system only triggers on actual change
   - No polling or constant checking

**Expected overhead**: Negligible (< 0.05ms/frame)

### Security Considerations

**Threats**:

1. **XSS via localStorage**: Malicious theme ID injected
2. **Prototype pollution**: Unsafe object access
3. **DoS**: Infinite theme switching

**Defenses**:

1. **Whitelist validation**:

   ```typescript
   const VALID_THEME_IDS = ['default', 'monochrome'] as const;
   function validateThemeId(id: unknown): id is ThemeId {
     return typeof id === 'string' && VALID_THEME_IDS.includes(id as ThemeId);
   }
   ```

2. **No dynamic theme loading**: Only built-in themes allowed

3. **Sanitized localStorage reads**:

   ```typescript
   const stored = localStorage.getItem('spaceshipDodgeTheme');
   const themeId = validateThemeId(stored) ? stored : 'default';
   ```

4. **Rate limiting**: No auto theme switching (user-initiated only)

### Accessibility Enhancements

**Screen Reader Support**:

```typescript
// In themeManager.ts setTheme()
import { announcer } from '@ui/accessibility/announcer';

export function setTheme(themeId: string): void {
  // ... validation and setting ...
  announcer.announce(`Theme changed to ${currentTheme.value.name}`);
}
```

**Keyboard Navigation**:

- Settings theme section fully keyboard accessible
- Tab through radio buttons
- Enter/Space to select
- Escape to close settings

**ARIA Attributes**:

```html
<div role="radiogroup" aria-label="Theme selection">
  <input type="radio" aria-label="Space Explorer theme" />
  <input type="radio" aria-label="Monochrome theme" />
</div>
```

### Testing Strategy

**Unit Tests** (80% coverage target):

- Theme manager state transitions
- localStorage persistence
- Validation logic
- Error handling

**Integration Tests** (20% coverage):

- Theme applied across all entities
- Settings UI theme switcher
- Persistence across page reloads

**Visual Regression** (manual):

- Screenshot default theme
- Screenshot monochrome theme
- Compare side-by-side

**Performance Tests**:

- Measure FPS before/after theme switch
- Profile frame time with profiler.ts
- Memory leak detection (no retained references)

### Future Extensibility (Phase 2+)

**Asset-Based Themes** (out of scope for Phase 1):

When ready for clown/underwater/medieval themes:

1. **Add `assets` field to Theme type**:

   ```typescript
   type ThemeAssets = {
     player: HTMLImageElement | null;
     asteroid: HTMLImageElement | null;
     // ... etc
   };

   type Theme = {
     // ... existing fields
     assets?: ThemeAssets; // Optional for color-only themes
   };
   ```

2. **Asset loading system**:
   - Preload images on theme selection
   - Loading state UI
   - Fallback to vector rendering if image fails

3. **Render mode toggle**:
   ```typescript
   function drawPlayer(ctx, theme) {
     if (theme.assets?.player) {
       ctx.drawImage(theme.assets.player, x, y);
     } else {
       // Fallback to vector rendering with theme colors
       drawVectorPlayer(ctx, theme.colors.player);
     }
   }
   ```

**Why defer to Phase 2?**:

- Asset loading adds complexity (loading states, error handling)
- Image optimization required (size, format)
- More testing surface area
- Want to validate color-only architecture first

### Open Questions for User Clarification

None currently - proceeding with assumptions:

1. Monochrome is off-white (#f5f5f0) - not pure black/white
2. Settings UI is preferred over overlay-based theme picker
3. Two themes sufficient for Phase 1 (can add more later)

### Success Criteria

**Phase 1 Complete When**:

1. ✅ Two themes available: Default + Monochrome
2. ✅ Settings UI allows theme switching
3. ✅ Theme persists across sessions
4. ✅ Zero visual regressions on default theme
5. ✅ All tests pass (coverage thresholds met)
6. ✅ Documentation complete (JSDoc + ADR + user guide)
7. ✅ CI/CD passes (lint, typecheck, build, tests)
8. ✅ Performance neutral (no FPS drop)
9. ✅ Security audit clean
10. ✅ Accessibility compliant

### Timeline Estimate

**Implementation**: ~6-8 hours of focused work

1. **Infrastructure** (2 hours): Theme system files, types, manager
2. **Refactoring** (2 hours): Update rendering code to use themes
3. **Settings UI** (1 hour): Add theme section
4. **Testing** (2 hours): Unit + integration tests
5. **Documentation** (1 hour): JSDoc, ADR, guides
6. **Review & Polish** (1-2 hours): Security audit, performance check

**Note**: This is developer time, not wall-clock time. User approval at each stage may extend timeline.

### Risk Assessment

**Low Risk**:

- Non-breaking changes (backward compatible)
- Small surface area (color replacement only)
- Well-established patterns (matches settings system)

**Medium Risk**:

- Refactoring many files (potential for typos/mistakes)
- Need comprehensive testing to catch regressions

**Mitigation**:

- Atomic commits per rendering module
- Visual testing after each change
- Automated test coverage

**High Confidence** in successful implementation given existing architecture quality.

---

## Next Steps

1. **User approval** of this plan
2. **Exit plan mode** and begin implementation
3. **Checkpoint reviews** after each major section
4. **Final review** before merging to main
