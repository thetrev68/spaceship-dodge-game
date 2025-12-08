import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { drawRuneShield, drawSpellTome } from '@core/themes/renderers/medieval/powerupRenderers';
import {
  createMockMedievalContext,
  createTestPowerup,
} from '../../../../helpers/medievalTestUtils';

vi.mock('@core/themes', () => ({
  getCurrentTheme: vi.fn(() => ({
    colors: {
      powerupShield: '#8b5cf6',
      powerupBlaster: '#10b981',
    },
  })),
}));

describe('Medieval powerup renderers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws rune shield with rotating ring and runes', () => {
    const ctx = createMockMedievalContext();
    const powerup = createTestPowerup({ type: 'shield' });

    drawRuneShield(ctx, powerup);

    // Outer glow + ring + pentagram + orbiting particles
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledTimes(5); // 5 rune glyphs
    expect(ctx.shadowBlur).toBe(0); // Reset after orbiting particles
  });

  it('renders spell tome pages and rising sparkles', () => {
    const ctx = createMockMedievalContext();
    const powerup = createTestPowerup({ type: 'doubleBlaster' });

    drawSpellTome(ctx, powerup);

    // Cover + spine + pages
    expect(ctx.fillRect).toHaveBeenCalled();
    // Sparkles and symbols should be drawn with fill operations
    expect(ctx.fill).toHaveBeenCalled();
    // Gradients used for page glow
    expect(ctx.createLinearGradient).toHaveBeenCalledTimes(2);
  });
});
