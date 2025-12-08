import { describe, it, expect } from 'vitest';
import * as medievalRenderers from '@core/themes/renderers/medieval';
import * as underwaterRenderers from '@core/themes/renderers/underwater';

describe('Renderer index exports', () => {
  it('exposes medieval renderer entry points', () => {
    expect(medievalRenderers.drawDragon).toBeDefined();
    expect(medievalRenderers.drawMedievalObstacle).toBeDefined();
    expect(medievalRenderers.drawFireball).toBeDefined();
    expect(medievalRenderers.drawRuneShield).toBeDefined();
    expect(medievalRenderers.drawSpellTome).toBeDefined();
    expect(medievalRenderers.setupMedievalBackground).toBeDefined();
  });

  it('exposes underwater renderer entry points', () => {
    expect(underwaterRenderers.drawSubmarine).toBeDefined();
    expect(underwaterRenderers.drawJellyfish).toBeDefined();
    expect(underwaterRenderers.drawTorpedo).toBeDefined();
    expect(underwaterRenderers.drawOctopusPowerup).toBeDefined();
    expect(underwaterRenderers.drawStarfishPowerup).toBeDefined();
    expect(underwaterRenderers.drawOceanBackground).toBeDefined();
  });
});
