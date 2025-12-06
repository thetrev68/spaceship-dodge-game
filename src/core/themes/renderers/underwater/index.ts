/**
 * @module themes/renderers/underwater
 * Complete underwater theme rendering system.
 *
 * ## Phase 2: Asset-Based Theme System
 * This module implements custom renderers for the underwater theme, transforming
 * the space arcade game into an ocean adventure with **zero code duplication**.
 *
 * ## Architecture: Strategy Pattern
 * All renderers follow the EntityRenderer<T> pattern:
 * - Receive entity data (position, size, state)
 * - Render custom visuals using theme colors
 * - **Reuse existing game logic** (physics, collision, spawning)
 *
 * ## Entity Transformations
 * - **Player** (Spaceship → Submarine): {@link drawSubmarine}
 * - **Obstacles** (Asteroids → Jellyfish): {@link drawJellyfish}
 * - **Bullets** (Lasers → Torpedoes): {@link drawTorpedo}
 * - **Powerups**:
 *   - Shield → Octopus: {@link drawOctopusPowerup}
 *   - Double Blaster → Starfish: {@link drawStarfishPowerup}
 * - **Background** (Starfield → Ocean): {@link setupOceanBackground}
 *
 * ## Performance
 * - Desktop: Full detail with animations
 * - Mobile: Reduced particle counts, simplified effects
 * - Frame rate: Matches or exceeds default theme (60 FPS target)
 *
 * @see {@link ../../themeConstants.ts} for theme definition
 * @see {@link ../../../../systems/renderManager.ts} for strategy pattern usage
 */

export { drawSubmarine } from './submarineRenderer';
export { drawJellyfish } from './jellyfishRenderer';
export { drawTorpedo } from './torpedoRenderer';
export { drawOctopusPowerup, drawStarfishPowerup } from './powerupRenderers';
export { setupOceanBackground } from './oceanBackground';
