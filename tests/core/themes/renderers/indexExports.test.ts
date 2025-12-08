import { describe, it, expect } from 'vitest';
import * as medievalRenderers from '@core/themes/renderers/medieval';
import * as underwaterRenderers from '@core/themes/renderers/underwater';

describe('Renderer index exports', () => {
  it('exposes medieval renderer entry points', () => {
    expect(medievalRenderers.drawDragon).toBeDefined();
    expect(typeof medievalRenderers.drawDragon).toBe('function');
    expect(medievalRenderers.drawMedievalObstacle).toBeDefined();
    expect(typeof medievalRenderers.drawMedievalObstacle).toBe('function');
    expect(medievalRenderers.drawFireball).toBeDefined();
    expect(typeof medievalRenderers.drawFireball).toBe('function');
    expect(medievalRenderers.drawRuneShield).toBeDefined();
    expect(typeof medievalRenderers.drawRuneShield).toBe('function');
    expect(medievalRenderers.drawSpellTome).toBeDefined();
    expect(typeof medievalRenderers.drawSpellTome).toBe('function');
    expect(medievalRenderers.setupMedievalBackground).toBeDefined();
    expect(typeof medievalRenderers.setupMedievalBackground).toBe('function');
  });

  it('exposes underwater renderer entry points', () => {
    expect(underwaterRenderers.drawSubmarine).toBeDefined();
    expect(typeof underwaterRenderers.drawSubmarine).toBe('function');
    expect(underwaterRenderers.drawJellyfish).toBeDefined();
    expect(typeof underwaterRenderers.drawJellyfish).toBe('function');
    expect(underwaterRenderers.drawTorpedo).toBeDefined();
    expect(typeof underwaterRenderers.drawTorpedo).toBe('function');
    expect(underwaterRenderers.drawOctopusPowerup).toBeDefined();
    expect(typeof underwaterRenderers.drawOctopusPowerup).toBe('function');
    expect(underwaterRenderers.drawStarfishPowerup).toBeDefined();
    expect(typeof underwaterRenderers.drawStarfishPowerup).toBe('function');
    expect(underwaterRenderers.drawOceanBackground).toBeDefined();
    expect(typeof underwaterRenderers.drawOceanBackground).toBe('function');
  });
});
