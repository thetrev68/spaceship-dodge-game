# Audio Integration Plan

This plan documents how to wire the newly generated audio assets into the game. It’s organized so work can be resumed after context resets.

## Naming & Paths

- Canonical filenames: `{theme}-{sound}.mp3` with variants like `-small/-medium/-large` or `-wyvern/-bat/-crystal`.
- Themes: `space` (fallback/default), `medieval`, `underwater`.
- Assets live in `public/sounds/`.
- Keep a mapping layer in code so existing calls (e.g., `fire`, `break`, `gameover`) resolve to theme-specific files with space fallbacks.

## Type & Config Changes

- Update `SoundKey`/`SoundMap` to include:
  - `fire`, `break`, `gameover`, `levelup`, `bgm`, `player_hit`, `powerup_collect`, `ui_click`.
- Extend `ThemeAudioConfig` to allow theme overrides for:
  - `bgMusic`, `fireSound`, `breakSound` (with variants), `gameoverSound`, `levelupSound`, `playerHitSound`, `powerupCollectSound`, `uiClickSound`.
- Add optional variant metadata for break sounds (size/type selection).

## soundManager Updates

- Load base (space) defaults using new filenames (`space-*.mp3`).
- Load theme overrides for all keys above.
- Add variant selection plumbing for `break` based on obstacle type/size:
  - Space: map size → `space-break-{small|medium|large}`.
  - Medieval: map obstacle type → `medieval-break-{wyvern|bat|crystal}`.
  - Underwater: map size → `underwater-break-{small|medium|large}`.
- Ensure `playSound` prefers theme override, clones nodes, applies current volumes/mute.
- Ensure BGM uses theme-specific `*-bgm.mp3` and restarts on theme change.

## Theme Definitions

- In `themeConstants`, set `audio` entries to the new filenames per theme:
  - Space: defaults (can be omitted; base files are `space-*`).
  - Medieval: `medieval-bgm`, `medieval-fire`, `medieval-break-*`, `medieval-gameover`, `medieval-levelup`, `medieval-player_hit`, `medieval-powerup_collect`, `medieval-ui_click`.
  - Underwater: analogous `underwater-*` files with size variants for break.
- Optionally add explicit break variant mapping in theme config if helpful.

## Event Wiring

- `player_hit`: trigger where player damage is applied.
- `powerup_collect`: trigger on powerup pickup (optionally differentiate shield vs blaster later).
- `ui_click`: trigger on menu/settings buttons.
- `levelup`: trigger at level advancement.
- `gameover`: trigger when lives exhausted.
- `break` variants: hook into obstacle destruction with size/type metadata.

## Dev/Test Harness

- Update `test-theme-audio.html` (or add a new page) to audition all new cues:
  - Fire, break variants, player_hit, powerup_collect, ui_click, levelup, gameover, bgm per theme.
- Keep a simple dropdown/radios to pick break variant for manual auditioning.

## Validation

- Run `python scripts/generate_theme_audio.py` to ensure outputs are present.
- Verify no 404s in dev server, and volumes are reasonable.
- Run lint/tests; manual click-through to confirm playback.

## Nice-to-Haves (later)

- Per-key volume trim table for fine balance.
- Fade/ducking for overlapping SFX (if needed).
- Optional alternate powerup sounds per powerup type.

## Completion Log

- Types/manager/theme audio updated to new filenames/variants; base defaults use space assets.
- Theme configs now map medieval/underwater audio (bgm/fire/break variants/gameover/levelup/player_hit/powerup_collect/ui_click).
- Sound manager handles variant-aware break selection and new events.
- Event wiring:
  - player hit → `player_hit`
  - powerup pickup → `powerup_collect`
  - UI buttons in overlays/settings → `ui_click`
  - level up → existing `levelup` hook
  - gameover → on death
  - break variants → size/type mapping for space/underwater/medieval obstacles
- Test harness updated to audition break variants per theme.
