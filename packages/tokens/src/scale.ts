/** Spacing, radius, type and metrics — @hanji/core tokens, in points (CSS px). */

export const spacing: Readonly<
  Record<'1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12', number>
> = {
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
};

export const radius: Readonly<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pill', number>> = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

/** hanji squircle smoothing (@hanji/core smoothing.squircle). 0 = circular corners. */
export const SMOOTHING = 0.72;

/**
 * CSS `corner-shape` that reproduces the figma squircle (hanji's native corner) for a smoothing.
 * Pair it with border-radius × (1 + smoothing): the figma curve starts that far along each edge.
 * The exponent makes the 45° point of the superellipse land where the native curve's does.
 */
export function cornerShapeFor(smoothing: number): string {
  if (smoothing <= 0) return 'round';
  const s = Math.min(1, smoothing);
  const n = -1 / Math.log2(1 - (1 - Math.SQRT1_2) / (1 + s));
  return `superellipse(${Math.round(Math.log2(n) * 1000) / 1000})`;
}

/** Density is a token transform: spacing × factor. Hairlines and touch targets are floors. */
export const densities: Readonly<Record<'cozy' | 'compact', number>> = { cozy: 1, compact: 0.7 };
export const DENSITY_MIN = 0.6;
export const DENSITY_MAX = 1.4;

export const metrics: Readonly<{ hairline: number; touchTarget: number }> = {
  hairline: 1,
  touchTarget: 44,
};

export interface TypeRole {
  readonly weight: 400 | 500 | 600 | 700;
  readonly size: number;
  readonly lineHeight: number;
  /** In px. */
  readonly tracking: number;
  readonly uppercase?: boolean;
  readonly mono?: boolean;
}

export const typeRoleNames = [
  'hero',
  'display',
  'title',
  'heading',
  'subheading',
  'body',
  'sub',
  'label',
  'eyebrow',
  'mono',
] as const;
export type TypeRoleName = (typeof typeRoleNames)[number];

/** hanji typeScale, plus `hero` (proposed: one number per screen). */
export const typeScale: Readonly<Record<TypeRoleName, TypeRole>> = {
  hero: { weight: 700, size: 44, lineHeight: 46, tracking: -1.2 },
  display: { weight: 700, size: 34, lineHeight: 38, tracking: -0.5 },
  title: { weight: 700, size: 22, lineHeight: 26, tracking: -0.3 },
  heading: { weight: 600, size: 19, lineHeight: 24, tracking: -0.2 },
  subheading: { weight: 600, size: 18, lineHeight: 23, tracking: -0.2 },
  body: { weight: 500, size: 15, lineHeight: 20, tracking: 0 },
  sub: { weight: 400, size: 12.5, lineHeight: 17, tracking: 0 },
  label: { weight: 600, size: 11, lineHeight: 14, tracking: 0.4 },
  eyebrow: { weight: 600, size: 10, lineHeight: 12, tracking: 1.6, uppercase: true },
  mono: { weight: 500, size: 12.5, lineHeight: 17, tracking: 0.2, mono: true },
};

export const fonts: Readonly<{ sans: string; mono: string }> = {
  sans: "'Figtree', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'DM Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
};

/** Layering for floating surfaces. */
export const zIndex: Readonly<
  Record<'sticky' | 'overlay' | 'popover' | 'toast' | 'tooltip', number>
> = {
  sticky: 10,
  overlay: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
};

/** hanji has no shadow scale. Imagery gets one drop; anchored popovers get a lift (proposed). */
export const shadows: Readonly<{ art: string; lift: string; liftDark: string }> = {
  art: '0 12px 24px rgba(0, 0, 0, .45)',
  lift: '0 1px 0 rgba(0, 0, 0, .02), 0 18px 40px -16px rgba(0, 0, 0, .28)',
  liftDark: '0 18px 40px -16px rgba(0, 0, 0, .7)',
};
