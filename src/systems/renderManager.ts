/**
 * @module systems/renderManager
 * Centralized rendering manager with theme-aware strategy pattern.
 *
 * ## Rendering Architecture
 * The render manager uses a **strategy pattern** to support theme-specific rendering:
 * - Themes can provide custom renderers for entities (player, obstacles, bullets, powerups)
 * - If no custom renderer provided, falls back to default implementations
 * - **Zero code duplication**: Same game logic, different visuals
 *
 * ## Strategy Pattern Benefits
 * - **Extensibility**: Add new themes without modifying core code
 * - **Separation of Concerns**: Rendering logic separated from game logic
 * - **Type Safety**: TypeScript enforces correct renderer signatures
 * - **Performance**: Direct function calls, no overhead
 *
 * @example
 * ```typescript
 * // Default theme uses built-in renderers
 * const defaultTheme: Theme = {
 *   id: 'default',
 *   colors: { ... },
 *   // No custom renderers - uses defaults
 * };
 *
 * // Custom theme provides alternative renderers
 * const underwaterTheme: Theme = {
 *   id: 'underwater',
 *   colors: { ... },
 *   renderers: {
 *     player: drawSubmarine,      // Custom submarine renderer
 *     obstacle: drawJellyfish,    // Custom jellyfish renderer
 *     // bullet and powerups will use defaults
 *   }
 * };
 * ```
 */

import { drawPlayer } from '@entities/player.js';
import { drawObstacles } from '@entities/asteroid.js';
import { drawBullets } from '@entities/bullet.js';
import { drawPowerups, drawShieldPowerup, drawDoubleBlasterPowerup } from '@entities/powerup.js';
import { drawScorePopups } from '@ui/hud/scorePopups.js';
import { drawScore } from '@ui/hud/scoreDisplay.js';
import { gameState, playerState, entityState } from '@core/state.js';
import { drawPowerupTimers } from '@ui/hud/powerupHUD.js';
import { getCurrentTheme } from '@core/themes';
import { activePowerups } from '@entities/powerup.js';

/**
 * Renders all game entities and UI elements to the canvas.
 *
 * ## Rendering Strategy
 * 1. Checks current theme for custom renderers
 * 2. Falls back to default renderers if not provided
 * 3. Renders entities using appropriate strategy
 * 4. Renders UI (HUD, popups) with theme-agnostic code
 *
 * ## Render Order
 * 1. Player (bottom layer)
 * 2. Obstacles (asteroids/jellyfish)
 * 3. Bullets (projectiles)
 * 4. Powerups (collectibles)
 * 5. HUD (score, lives, level)
 * 6. Score popups (floating text)
 * 7. Powerup timers (active effects)
 *
 * ## Theme Integration
 * - Custom renderers receive entity data as parameters
 * - Renderers use `getCurrentTheme()` for colors/fonts
 * - **No game logic changes** - pure visual customization
 *
 * @param ctx - Canvas 2D rendering context
 *
 * @example
 * ```typescript
 * // In game loop
 * function gameLoop() {
 *   if (gameState.value === 'PLAYING') {
 *     ctx.clearRect(0, 0, canvas.width, canvas.height);
 *     renderAll(ctx); // Render with theme-aware strategy
 *   }
 *   requestAnimationFrame(gameLoop);
 * }
 * ```
 */
export function renderAll(ctx: CanvasRenderingContext2D): void {
  if (gameState.value !== 'PLAYING') return;

  ctx.save();

  // Set common default styles
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = 'white';
  ctx.font = '16px Inter'; // shared by scorePopups, score, etc.

  const theme = getCurrentTheme();
  const renderers = theme.renderers || {};

  // Player rendering - use custom or default
  if (renderers.player) {
    // Custom renderer (e.g., submarine for underwater theme)
    const player = playerState.player;
    renderers.player(ctx, player);
  } else {
    // Default renderer (space ship)
    drawPlayer(ctx);
  }

  // Obstacle rendering - use custom or default
  const obstacles = entityState.getMutableObstacles();
  if (renderers.obstacle) {
    // Custom renderer (e.g., jellyfish for underwater theme)
    obstacles.forEach((o) => renderers.obstacle!(ctx, o));
  } else {
    // Default renderer (asteroids)
    drawObstacles(ctx);
  }

  // Bullet rendering - use custom or default
  const bullets = entityState.getMutableBullets();
  if (renderers.bullet) {
    // Custom renderer (e.g., torpedoes for underwater theme)
    bullets.forEach((b) => renderers.bullet!(ctx, b));
  } else {
    // Default renderer (laser bolts)
    drawBullets(ctx);
  }

  // Powerup rendering - use custom or default
  if (renderers.powerups) {
    // Custom renderers (e.g., octopus/starfish for underwater theme)
    activePowerups.forEach((p) => {
      if (p.type === 'shield') {
        const shieldRenderer = renderers.powerups!.shield || drawShieldPowerup;
        shieldRenderer(ctx, p);
      } else if (p.type === 'doubleBlaster') {
        const blasterRenderer = renderers.powerups!.doubleBlaster || drawDoubleBlasterPowerup;
        blasterRenderer(ctx, p);
      }
    });
  } else {
    // Default renderers (glowing circle/star)
    drawPowerups(ctx);
  }

  // HUD (theme-agnostic - uses theme colors but same logic)
  drawScore(ctx);
  drawScorePopups(ctx);
  drawPowerupTimers(ctx);

  ctx.restore();
}
