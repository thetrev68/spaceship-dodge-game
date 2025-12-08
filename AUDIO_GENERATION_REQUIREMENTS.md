# Audio Generation Requirements for Spaceship Dodge Game

## 1. Introduction

This document outlines the requirements for all background music (BGM) and sound effects (SFX) for the Spaceship Dodge Game. The audio assets need to be programmatically generated based on the descriptions provided below.

## 2. General Guidelines for Generation

- **Clarity and Punchiness**: All sound effects should be clear, distinct, and easily recognizable even in a mix of other sounds. They should be "punchy" to provide immediate player feedback.
- **Theme Consistency**: Each sound must fit its specified theme (Space, Medieval, Underwater).
- **No Ambience**: Sound effects should be clean and isolated, without background noise, reverb, or echo, unless specifically requested in the description.
- **Format**: All generated audio files must be in MP3 format.
- **File Naming Convention**: Please name files according to the pattern: `{theme}-{sound_name}.mp3` (e.g., `space-fire.mp3`, `medieval-bgm.mp3`). For variants, append a suffix: `-small`, `-medium`, `-large`, or a specific type (e.g., `-wyvern`).

### 2.1 Practical Generation Notes

- **Sample Rate / Channels**: 44.1 kHz, mono.
- **Loudness Target**: Normalize SFX to roughly -12 to -10 LUFS integrated; avoid clipping. BGM to around -14 LUFS integrated with a little headroom.
- **Duration Targets**:
  - UI clicks: 80–200 ms
  - Powerup collect: 150–450 ms
  - Fire: 200–500 ms
  - Break/hit: 250–700 ms (size variants can scale up slightly)
  - Level up: 350–900 ms
  - Game over: 1–2.5 s
  - BGM: seamless loop, 10–30 s rendered; loop cleanly (zero-pop loop points).
- **Tails**: Apply short fades to avoid clicks; ensure exported tails fully contain the sound.
- **Dynamics**: Prefer crisp transient response; minimal long reverb unless stated.
- **Consistency**: Keep relative loudness consistent across themes; Space is the default/fallback reference.

## 3. Background Music (BGM)

### Sound Name: `bgm`

#### Theme: Space (Default)

- **File Name**: `space-bgm.mp3`
- **Description**: An upbeat, synth-driven electronic track with a sense of adventure and urgency. It should have a driving beat, a prominent bassline, and arpeggiated synthesizers. The mood is heroic and energetic, suitable for navigating a dangerous asteroid field. Avoid overly complex melodies that could be distracting. Think 80s sci-fi movie action scene.

#### Theme: Medieval

- **File Name**: `medieval-bgm.mp3`
- **Description**: An orchestral and epic fantasy track. The music should evoke a sense of a grand battle against mythical creatures. Use driving percussion like war drums, string sections (cellos, violas) for tension, and brass instruments (horns, trumpets) for heroic fanfares. The mood is high-stakes and adventurous.

#### Theme: Underwater

- **File Name**: `underwater-bgm.mp3`
- **Description**: A mysterious and slightly ambient electronic track. The music should feel like exploring a deep, unknown ocean trench. Use slow, flowing synthesizer pads, gentle pulsating rhythms, and occasional sonar-like pings. The mood is calm but with an undercurrent of suspense and wonder. Avoid harsh sounds.

## 4. Sound Effects (SFX)

### Sound Name: `fire`

_Game Event: Player shoots a projectile._

#### Theme: Space (Default)

- **File Name**: `space-fire.mp3`
- **Description**: A classic sci-fi laser blast. A short, sharp "pew" sound. It should be high-frequency and energetic.

#### Theme: Medieval

- **File Name**: `medieval-fire.mp3`
- **Description**: The sound of a magic fireball being cast. A "whoosh" of fire followed by a crackle of magical energy. It should sound powerful and elemental.

#### Theme: Underwater

- **File Name**: `underwater-fire.mp3`
- **Description**: The sound of a torpedo or compressed air bubble being launched. A low-frequency "thump" followed by a muffled, bubbling "whoosh" as the projectile travels through water.

---

### Sound Name: `break`

_Game Event: An asteroid or obstacle is destroyed._

#### Theme: Space (Default)

- **File Names**: `space-break-small.mp3`, `space-break-medium.mp3`, `space-break-large.mp3`
- **Description**: Rock and metal breaking in vacuum. A low, muffled thud with a sharp crackle of shattering rock and a hint of metallic debris. Small is quick and higher-pitched; medium is balanced; large is deeper with a heavier low-end thump.

#### Theme: Medieval

- **File Names**: `medieval-break-wyvern.mp3`, `medieval-break-bat.mp3`, `medieval-break-crystal.mp3`
- **Descriptions**:
  - **Wyvern**: A leathery impact with a wet, heavy thump and a short growly exhale as the creature is struck. Brief flap rustle allowed, but keep it tight.
  - **Bat**: A light, high-pitched squeak with a papery wing slap. Very short and airy, minimal low end.
  - **Crystal**: A sharp, glassy shatter with bright, ringing shards. Clear and chime-like, but still punchy.

#### Theme: Underwater

- **File Names**: `underwater-break-small.mp3`, `underwater-break-medium.mp3`, `underwater-break-large.mp3`
- **Description**: Jellyfish hit sounds in water. A soft, muted “blup” plus a watery splat; size scales depth and tail:
  - **Small**: Quick, higher-pitched blip with tiny bubble pops.
  - **Medium**: Rounder thump with a couple of medium bubbles and a short squish tail.
  - **Large**: Deeper, slower thud with a lower bubble plume and a slightly longer, soft water tail.

---

### Sound Name: `levelup`

_Game Event: The player advances to the next level._

#### Theme: Space (Default)

- **File Name**: `space-levelup.mp3`
- **Description**: A positive, ascending electronic chime. A sequence of 3-4 synth notes that quickly rise in pitch, conveying progress and achievement.

#### Theme: Medieval

- **File Name**: `medieval-levelup.mp3`
- **Description**: A short, triumphant trumpet fanfare. A classic sound of victory or royal announcement, conveying a sense of accomplishment.

#### Theme: Underwater

- **File Name**: `underwater-levelup.mp3`
- **Description**: The sound of a series of sonar pings that quickly ascend in pitch, combined with a gentle, harmonious bubble sound. It should feel positive and encouraging.

---

### Sound Name: `gameover`

_Game Event: The player has lost all lives._

#### Theme: Space (Default)

- **File Name**: `space-gameover.mp3`
- **Description**: A descending, melancholic electronic arpeggio. A slow, sad synth sound that conveys failure and the end of the game.

#### Theme: Medieval

- **File Name**: `medieval-gameover.mp3`
- **Description**: A slow, mournful horn solo. A single brass instrument plays a short, sad tune, signifying defeat in battle.

#### Theme: Underwater

- **File Name**: `underwater-gameover.mp3`
- **Description**: A low, droning "klaxon" sound, like a submarine's dive alarm, that fades out slowly. It should create a sense of finality and loss.

---

### Sound Name: `player_hit` (New)

_Game Event: The player's ship/character is hit by an obstacle._

#### Theme: Space (Default)

- **File Name**: `space-player_hit.mp3`
- **Description**: A jarring, electronic "zapping" sound, like a short circuit, combined with a metallic clank. It should be alarming and indicate damage.

#### Theme: Medieval

- **File Name**: `medieval-player_hit.mp3`
- **Description**: The sound of a dragon's claw striking metal armor. A sharp, high-frequency "clang" with a slight scraping sound.

#### Theme: Underwater

- **File Name**: `underwater-player_hit.mp3`
- **Description**: A dull, heavy "thud" as if something hits the hull of a submarine, followed by a brief, high-pressure water leak "hiss".

---

### Sound Name: `powerup_collect` (New)

_Game Event: The player collects a power-up (e.g., shield, double blaster)._

#### Theme: Space (Default)

- **File Name**: `space-powerup_collect.mp3`
- **Description**: A shimmering, magical "sparkle" sound that ascends in pitch. It should be positive, quick, and satisfying.

#### Theme: Medieval

- **File Name**: `medieval-powerup_collect.mp3`
- **Description**: The sound of a magical potion being collected. A gentle "glug" or a mystical, ethereal chime. It should sound beneficial and enchanting.

#### Theme: Underwater

- **File Name**: `underwater-powerup_collect.mp3`
- **Description**: A sequence of a few high-pitched, melodic bubbles popping rapidly. It should sound bright, cheerful, and rewarding.

---

### Sound Name: `ui_click` (New)

_Game Event: The user clicks on a button in the menu or UI._

#### Theme: Space (Default)

- **File Name**: `space-ui_click.mp3`
- **Description**: A clean, futuristic UI sound. A short, crisp "blip" or "click" with a slight electronic tone. Similar to a button press on a spaceship's console.

#### Theme: Medieval

- **File Name**: `medieval-ui_click.mp3`
- **Description**: A mechanical, tactile click. The sound of a heavy wooden lever or a rustic mechanical switch being flipped.

#### Theme: Underwater

- **File Name**: `underwater-ui_click.mp3`
- **Description**: A soft, watery "pop" sound. Like a single, distinct bubble popping. It should be subtle and not intrusive.
