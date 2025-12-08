/**
 * Medieval Fantasy Theme Renderers
 *
 * Exports all custom renderers for the medieval theme.
 * Phase 1: Stubs only - implementations coming in later phases.
 */

// Phase 2: Dragon Renderer (player)
export { drawDragon } from './dragonRenderer';

// Phase 3: Medieval Obstacles (wyvern, bat, crystal)
export { drawMedievalObstacle } from './obstacleRenderer';

// Phase 4: Fireball Renderer (bullets)
export { drawFireball } from './fireballRenderer';

// Phase 5: Powerup Renderers (rune shield, spell tome)
export { drawRuneShield, drawSpellTome } from './powerupRenderers';

// Phase 6: Medieval Background (castle ruins, embers)
export { setupMedievalBackground } from './medievalBackground';
