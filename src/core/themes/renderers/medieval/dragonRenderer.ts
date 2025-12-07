/**
 * Medieval theme: Dragon renderer (vector graphics)
 *
 * Implements the Phase 2 design from PHASE_2_DRAGON.md with a cleaner,
 * more angular outline style inspired by heraldic dragon icons.
 * Features animated wings, swaying tail, and rider silhouette.
 */
import { getCurrentTheme } from '@core/themes';
import { isMobile } from '@utils/platform';
import type { Player } from '@types';
import { playerState } from '@core/state/playerState';

/** Main entry - draw the dragon player */
export function drawDragon(ctx: CanvasRenderingContext2D, player: Player): void {
  const theme = getCurrentTheme();
  const x = player.x;
  const y = player.y;
  const w = player.width;
  const h = player.height;
  const cx = x + w / 2;
  const cy = y + h / 2;

  // Animation timing
  const time = performance.now() / 1000;
  const wingExtension = Math.sin(time * 3) * 0.2 + 1; // 0.8 to 1.2
  const tailSway = Math.sin(time * 2) * w * 0.15; // horizontal tail curve

  ctx.strokeStyle = theme.colors.player;
  ctx.lineWidth = Math.max(2, w * 0.06);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'transparent';

  // Drawing order: tail -> wings -> body -> head -> rider -> fire -> shield
  drawDragonTail(ctx, cx, cy, h, tailSway, theme.colors.player);
  drawDragonWings(ctx, cx, cy, w, h, wingExtension, theme.colors.player);
  drawDragonBody(ctx, cx, cy, w, h, tailSway, theme.colors.player);
  drawDragonHead(ctx, cx, cy, w, h, theme.colors.player);
  drawRider(ctx, cx, cy, w, h, theme.colors.player);

  // Fire breath when moving
  if (!isMobile() && Math.abs(player.dy || 0) > 0.5) {
    drawFireBreath(ctx, cx, cy + h * 0.35, theme.colors.playerEngine || 'rgba(239,68,68,0.6)');
  }

  // Shield effect
  if (playerState.powerUps.shield.active) {
    drawMagicShield(ctx, cx, cy, Math.max(w, h) * 1.4, theme.colors.playerShield || '#a855f7');
  }
}

/** Dragon head: Angular arrowhead pointing upward */
function drawDragonHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.strokeStyle = color;

  const headTipY = cy - h * 0.45;
  const neckY = cy - h * 0.25;

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(cx, headTipY);
  ctx.lineTo(cx - w * 0.15, neckY);
  ctx.lineTo(cx + w * 0.15, neckY);
  ctx.closePath();
  ctx.stroke();
}

/** Dragon tail: Wavy center line tapering to a point */
function drawDragonTail(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyHeight: number,
  swayOffset: number,
  color: string
): void {
  ctx.strokeStyle = color;

  const tailStartY = cy + bodyHeight * 0.1;
  const tailEndY = cy + bodyHeight * 0.45;

  ctx.beginPath();
  ctx.moveTo(cx + swayOffset * 0.2, tailStartY);
  ctx.bezierCurveTo(
    cx + swayOffset * 0.4,
    tailStartY + (tailEndY - tailStartY) * 0.33,
    cx + swayOffset * 0.2,
    tailStartY + (tailEndY - tailStartY) * 0.66,
    cx + swayOffset * 0.1,
    tailEndY
  );
  ctx.stroke();
}

/** Dragon wings: Angular bat-wing style with animation */
function drawDragonWings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyWidth: number,
  bodyHeight: number,
  extension: number,
  color: string
): void {
  ctx.strokeStyle = color;

  const wingStartY = cy - bodyHeight * 0.15;
  const wingOutX = bodyWidth * 0.5 * extension;
  const wingDownY = bodyHeight * 0.15;

  // LEFT WING
  ctx.beginPath();
  ctx.moveTo(cx, wingStartY);
  ctx.lineTo(cx - wingOutX, wingStartY - bodyHeight * 0.05); // top edge out
  ctx.lineTo(cx - wingOutX * 0.95, wingStartY + wingDownY); // wing tip down
  ctx.lineTo(cx - wingOutX * 0.35, wingStartY + wingDownY * 0.7); // zig-zag back in
  ctx.lineTo(cx, wingStartY + wingDownY * 0.25);
  ctx.stroke();

  // RIGHT WING (Mirror)
  ctx.beginPath();
  ctx.moveTo(cx, wingStartY);
  ctx.lineTo(cx + wingOutX, wingStartY - bodyHeight * 0.05);
  ctx.lineTo(cx + wingOutX * 0.95, wingStartY + wingDownY);
  ctx.lineTo(cx + wingOutX * 0.35, wingStartY + wingDownY * 0.7);
  ctx.lineTo(cx, wingStartY + wingDownY * 0.25);
  ctx.stroke();
}

/** Dragon body: Vertical spine connecting head to tail */
function drawDragonBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  swayOffset: number,
  color: string
): void {
  ctx.strokeStyle = color;

  const neckY = cy - h * 0.25;
  const bodyMidY = cy;
  const tailStartY = cy + h * 0.1;

  ctx.beginPath();
  ctx.moveTo(cx, neckY);
  ctx.bezierCurveTo(
    cx + swayOffset * 0.2,
    bodyMidY,
    cx - swayOffset * 0.15,
    tailStartY,
    cx,
    tailStartY
  );
  ctx.stroke();
}

/** Rider silhouette at wing junction */
function drawRider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.strokeStyle = color;

  const riderHeadY = cy - h * 0.15;

  // Rider Head (small circle)
  ctx.beginPath();
  ctx.arc(cx, riderHeadY, w * 0.05, 0, Math.PI * 2);
  ctx.stroke();

  // Rider Body/Cape (curved bracket shape below head)
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.08, riderHeadY + h * 0.05);
  ctx.quadraticCurveTo(cx, riderHeadY + h * 0.12, cx + w * 0.08, riderHeadY + h * 0.05);
  ctx.stroke();
}

/** Fire breath particle trail */
function drawFireBreath(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.save();
  const particleCount = isMobile() ? 4 : 7;
  for (let i = 1; i <= particleCount; i++) {
    const particleY = y + i * 6;
    const particleRadius = Math.max(1, 3 - i * 0.3);
    const opacity = Math.max(0, 1 - i * 0.12);

    // Use provided color as the final (largest) particle, otherwise gradient hues
    const hue = i === particleCount ? color : i < 3 ? '#fbbf24' : i < 5 ? '#fb923c' : '#dc2626';
    ctx.fillStyle = hue;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, particleY, particleRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Magic shield (rotating pentagram) */
function drawMagicShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
): void {
  const time = performance.now() / 1000;
  const rotation = time * 0.5;
  const pulse = Math.sin(time * 2) * 0.1 + 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7 * pulse;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // pentagram (5-pointed star)
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 5; i++) {
    const angle = ((i * 4) / 5) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius * 0.7;
    const y = Math.sin(angle) * radius * 0.7;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha = 1;
}
