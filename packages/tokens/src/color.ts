/**
 * Colour arithmetic, ported 1:1 from `@hanji/core` (theme/color.ts) so the web and native
 * libraries derive identical values from the same inputs.
 */

/** An sRGB colour with 0–255 channels. */
export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const clamp255 = (n: number): number => (n < 0 ? 0 : n > 255 ? 255 : Math.round(n));
const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** True when the string is a 3- or 6-digit hex colour, with or without `#`. */
export function isHex(value: string): boolean {
  return HEX.test(value.trim());
}

/** Parse `#rgb` or `#rrggbb`. Throws on anything else. */
export function parseHex(hex: string): Rgb {
  const m = HEX.exec(hex.trim());
  if (m === null) throw new Error(`Not a hex colour: ${hex}`);
  const body = m[1] ?? '';
  const full = body.length === 3 ? body.replace(/./g, (c) => c + c) : body;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

/** Format an sRGB colour as `#rrggbb`. */
const hex2 = (n: number): string => clamp255(n).toString(16).padStart(2, '0');

export function toHex({ r, g, b }: Rgb): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

/** `rgba()` string for a hex colour at the given alpha. */
export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(alpha)})`;
}

/** Linear sRGB blend of `overlay` over `base` at `alpha` — hanji's surface-step arithmetic. */
export function blend(base: string, overlay: string, alpha: number): string {
  const a = parseHex(base);
  const o = parseHex(overlay);
  const t = clamp01(alpha);
  return toHex({ r: a.r + (o.r - a.r) * t, g: a.g + (o.g - a.g) * t, b: a.b + (o.b - a.b) * t });
}

/** hanji's perceptual-ish luminance (Rec. 709 weights on gamma-encoded channels), 0–1. */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Ink for text drawn on `hex`: near-black above .55 luminance, white below. */
export function contrastOn(hex: string): string {
  return luminance(hex) > 0.55 ? '#0b0a09' : '#ffffff';
}

/** WCAG 2.x relative luminance. */
const linearChannel = (v: number): number => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
