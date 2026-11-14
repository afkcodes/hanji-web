import { contrastOn, isHex } from './color.ts';
import { THEME_ATTRS, springVars } from './css.ts';
import type { springNames } from './motion.ts';
import { accentNames, paperNames } from './palette.ts';
import { DENSITY_MAX, DENSITY_MIN, cornerShapeFor, radius as radiusScale } from './scale.ts';

/** A colour: one hex for every paper, or a {light, dark} pair. */
export type ThemeColor = string | { light: string; dark: string };

/** A spring, compiled to a CSS linear() easing at theme time. */
export interface ThemeSpring {
  damping: number;
  stiffness: number;
  mass?: number;
}

/**
 * The theme contract. Every field is optional; omitted fields keep hanji’s defaults.
 * Exported as JSON Schema (`@hanji/tokens/theme.schema.json`) so tools and agents can theme
 * the library without reading CSS.
 */
export interface ThemeInput {
  /** paper = warm light · ink = true black · charcoal = soft dark · auto = paper by day, charcoal at night. */
  paper?: 'paper' | 'ink' | 'charcoal' | 'auto';
  /** A preset accent, or a custom {light, dark} pair. One accent per app. */
  accent?: (typeof accentNames)[number] | { light: string; dark: string };
  /** cozy = 1, compact = .7, or a number between .6 and 1.4. */
  density?: 'cozy' | 'compact' | number;
  /** system follows prefers-reduced-motion. */
  motion?: 'system' | 'full' | 'reduced';
  /** sharp = .5×, soft = 1× (hanji), round = 1.4×, or a number 0–2. Pills stay pills. */
  radius?: 'sharp' | 'soft' | 'round' | number;
  /** Corner smoothing 0–1: 0 = circular, .72 = hanji's squircle (default), 1 = most continuous. */
  smoothing?: number;
  fonts?: { sans?: string; mono?: string };
  colors?: Partial<Record<'danger' | 'success' | 'warning' | 'info' | 'seal', ThemeColor>>;
  springs?: Partial<Record<(typeof springNames)[number], ThemeSpring>>;
}

/** Attributes a theme puts on its root element. */
export interface ThemeAttributes {
  'data-hj-paper'?: string;
  'data-hj-accent'?: string;
  'data-hj-density'?: string;
  'data-hj-motion'?: string;
  'data-hj-radius'?: string;
  'data-hj-smoothing'?: string;
}

/** A resolved theme: attributes plus the few CSS variables presets can’t express. */
export interface HanjiTheme {
  readonly input: ThemeInput;
  readonly attributes: ThemeAttributes;
  /** Inline CSS variables (custom accent, radius, fonts, springs, colours). Often empty. */
  readonly vars: Readonly<Record<`--hj-${string}`, string>>;
  /** The theme as a CSS rule for `selector`, for SSR or a static stylesheet. */
  toCss(selector?: string): string;
}

const RADIUS_FACTOR = { sharp: 0.5, soft: 1, round: 1.4 } as const;
const ldv = (v: string | { light: string; dark: string }): string =>
  typeof v === 'string' ? v : `light-dark(${v.light}, ${v.dark})`;

/**
 * Validate and resolve a theme. Throws a readable error (zod) when the input is wrong, so an
 * agent gets told exactly which field to fix.
 *
 * @example
 * const theme = createTheme({ paper: 'ink', accent: 'cobalt', density: 'compact' });
 * <Theme theme={theme}>…</Theme>
 */
export function createTheme(input: ThemeInput = {}): HanjiTheme {
  const t = checkTheme(input);
  const attributes: ThemeAttributes = {};
  const vars: Record<`--hj-${string}`, string> = {};

  if (t.paper) attributes[THEME_ATTRS.paper] = t.paper;
  if (t.motion) attributes[THEME_ATTRS.motion] = t.motion;

  if (typeof t.accent === 'string') attributes[THEME_ATTRS.accent] = t.accent;
  else if (t.accent) {
    attributes[THEME_ATTRS.accent] = 'custom';
    vars['--hj-accent'] = ldv(t.accent);
    vars['--hj-on-accent'] =
      `light-dark(${contrastOn(t.accent.light)}, ${contrastOn(t.accent.dark)})`;
  }

  if (typeof t.density === 'string') attributes[THEME_ATTRS.density] = t.density;
  else if (typeof t.density === 'number') {
    attributes[THEME_ATTRS.density] = 'custom';
    vars['--hj-density'] = String(t.density);
  }

  if (t.radius !== undefined) {
    const f = typeof t.radius === 'number' ? t.radius : RADIUS_FACTOR[t.radius];
    attributes[THEME_ATTRS.radius] = 'custom';
    for (const [k, px] of Object.entries(radiusScale)) {
      if (k !== 'pill') vars[`--hj-r-${k}`] = `${Math.round(px * f * 10) / 10}px`;
    }
  }
  if (t.smoothing !== undefined) {
    attributes[THEME_ATTRS.smoothing] = 'custom';
    vars['--hj-smoothing'] = String(Math.max(0, Math.min(1, t.smoothing)));
    vars['--hj-corner-shape'] = cornerShapeFor(t.smoothing);
  }
  if (t.fonts?.sans) vars['--hj-font-sans'] = t.fonts.sans;
  if (t.fonts?.mono) vars['--hj-font-mono'] = t.fonts.mono;
  if (t.colors) {
    for (const [k, v] of Object.entries(t.colors)) if (v) vars[`--hj-${k}`] = ldv(v);
  }
  if (t.springs) {
    for (const [name, s] of Object.entries(t.springs)) {
      if (s)
        Object.assign(
          vars,
          springVars(name, { damping: s.damping, stiffness: s.stiffness, mass: s.mass ?? 1 }),
        );
    }
  }

  return {
    input,
    attributes,
    vars,
    toCss(selector = ':root'): string {
      const attrs = Object.entries(attributes)
        .map(([k, v]) => `/* ${k}="${v}" */`)
        .join(' ');
      const body = Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
      return `${attrs}\n@layer hj.tokens {\n${selector} {\n${body}\n}\n}\n`;
    },
  };
}

/**
 * Dependency-free validation, so `createTheme` can run in the browser without shipping zod.
 * For full validation with field-level messages, use `parseTheme` from `@hanji/tokens/schema`.
 */
const fail = (msg: string): never => {
  throw new TypeError(`[hanji] createTheme: ${msg}`);
};
const isRamp = (v: unknown): v is { light: string; dark: string } =>
  typeof v === 'object' &&
  v !== null &&
  isHex(String((v as { light?: unknown }).light)) &&
  isHex(String((v as { dark?: unknown }).dark));

function checkTheme(t: ThemeInput): ThemeInput {
  if (t.paper && ![...paperNames, 'auto'].includes(t.paper))
    fail(`paper must be one of paper, ink, charcoal, auto — got "${t.paper}"`);
  if (typeof t.accent === 'string' && !(accentNames as readonly string[]).includes(t.accent))
    fail(`accent must be one of ${accentNames.join(', ')} or {light, dark} — got "${t.accent}"`);
  if (t.accent && typeof t.accent === 'object' && !isRamp(t.accent))
    fail('accent {light, dark} needs two hex colours');
  if (t.smoothing !== undefined && !(t.smoothing >= 0 && t.smoothing <= 1))
    fail(`smoothing must be between 0 and 1 — got ${t.smoothing}`);
  if (typeof t.density === 'number' && (t.density < DENSITY_MIN || t.density > DENSITY_MAX))
    fail(`density must be between ${DENSITY_MIN} and ${DENSITY_MAX} — got ${t.density}`);
  if (t.colors)
    for (const [k, v] of Object.entries(t.colors))
      if (v && !(typeof v === 'string' ? isHex(v) : isRamp(v)))
        fail(`colors.${k} is not a hex colour or {light, dark}`);
  return t;
}
