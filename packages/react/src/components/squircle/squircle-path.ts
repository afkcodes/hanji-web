/**
 * The figma-style squircle (iOS continuous corners), as an SVG path: the geometry hanji's native
 * `Squircle` draws with fast-squircle. Each corner is a circular arc blended into the straight
 * edge by two cubic Béziers; `smoothing` (0–1) sets how far the blend reaches along the edge.
 */

const rad = (deg: number): number => (deg * Math.PI) / 180;

interface Corner {
  a: number;
  b: number;
  c: number;
  d: number;
  p: number;
  arc: number;
  r: number;
}

function corner(radius: number, smoothing: number, budget: number): Corner {
  const r = Math.min(radius, budget);
  if (r <= 0) return { a: 0, b: 0, c: 0, d: 0, p: 0, arc: 0, r: 0 };
  // keep the curve inside half the shorter side: reduce smoothing before reducing radius
  const s = Math.max(0, Math.min(smoothing, budget / r - 1));
  const p = Math.min((1 + s) * r, budget);
  const arcMeasure = 90 * (1 - s);
  const arc = Math.sin(rad(arcMeasure / 2)) * r * Math.SQRT2;
  const alpha = (90 - arcMeasure) / 2;
  const p3ToP4 = r * Math.tan(rad(alpha / 2));
  const beta = 45 * s;
  const c = p3ToP4 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;
  return { a, b, c, d, p, arc, r };
}

const n = (v: number): string => (Math.round(v * 100) / 100).toString();

/**
 * SVG path data for a `width × height` squircle.
 *
 * @param radius     corner radius in px (clamped to half the shorter side)
 * @param smoothing  0 = circular corners · .72 = hanji · 1 = most continuous
 */
export function squirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing = 0.72,
): string {
  const k = corner(radius, smoothing, Math.min(width, height) / 2);
  const { a, b, c, d, p, arc, r } = k;
  if (r === 0) return `M0 0H${n(width)}V${n(height)}H0Z`;
  return [
    `M${n(width - p)} 0`,
    `c${n(a)} 0 ${n(a + b)} 0 ${n(a + b + c)} ${n(d)}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(arc)}`,
    `c${n(d)} ${n(c)} ${n(d)} ${n(b + c)} ${n(d)} ${n(a + b + c)}`,
    `L${n(width)} ${n(height - p)}`,
    `c0 ${n(a)} 0 ${n(a + b)} ${n(-d)} ${n(a + b + c)}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(arc)}`,
    `c${n(-c)} ${n(d)} ${n(-(b + c))} ${n(d)} ${n(-(a + b + c))} ${n(d)}`,
    `L${n(p)} ${n(height)}`,
    `c${n(-a)} 0 ${n(-(a + b))} 0 ${n(-(a + b + c))} ${n(-d)}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(-arc)}`,
    `c${n(-d)} ${n(-c)} ${n(-d)} ${n(-(b + c))} ${n(-d)} ${n(-(a + b + c))}`,
    `L0 ${n(p)}`,
    `c0 ${n(-a)} 0 ${n(-(a + b))} ${n(d)} ${n(-(a + b + c))}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(-arc)}`,
    `c${n(c)} ${n(-d)} ${n(b + c)} ${n(-d)} ${n(a + b + c)} ${n(-d)}`,
    'Z',
  ].join(' ');
}

/** CSS `corner-shape` matching a smoothing — use with border-radius × (1 + smoothing). */
export { cornerShapeFor as cornerShape } from '@hanji/tokens';
