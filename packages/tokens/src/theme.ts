import { bestInkOn, contrastRatio, deltaE, isHex } from './color.ts';
import {
  DARK_GROUNDS,
  LIGHT_GROUNDS,
  THEME_ATTRS,
  clashesWithDanger,
  paperVars,
  springVars,
  textRamp,
} from './css.ts';
import type { springNames } from './motion.ts';
import {
  ACCENT_SOFT_ALPHA,
  DANGER,
  accentNames,
  accents,
  derivePaper,
  paperNames,
  papers,
  status,
  tintPaper,
} from './palette.ts';
import type { AccentRamp, PaperColors, PaperInput } from './palette.ts';
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
 * A ground of your own. Give a background and an ink (everything else is derived the way
 * hanji's papers are, and can be overridden), a pair for light and dark, or one tint to build
 * both from — a brand's neutrals.
 */
export type CustomPaper =
  | PaperInput
  | { light: PaperInput; dark: PaperInput }
  | { tint: string; mode?: 'light' | 'dark' | 'auto' };

/**
 * The theme contract. Every field is optional; omitted fields keep hanji’s defaults.
 * Exported as JSON Schema (`@hanji/tokens/theme.schema.json`) so tools and agents can theme
 * the library without reading CSS.
 */
export interface ThemeInput {
  /**
   * paper = warm light · ink = true black · charcoal = soft dark · auto = paper by day, charcoal
   * at night — or a custom ground: `{ bg, fg }`, `{ light, dark }` or `{ tint, mode }`.
   */
  paper?: 'paper' | 'ink' | 'charcoal' | 'auto' | CustomPaper;
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
  /**
   * Status colours. `pending` (work in progress) defaults to the accent — or to info when the
   * accent could be mistaken for danger.
   */
  colors?: Partial<
    Record<'danger' | 'success' | 'warning' | 'info' | 'pending' | 'seal', ThemeColor>
  >;
  /** Chart series 1–6, in order. Give fewer and the rest keep hanji's. */
  data?: readonly ThemeColor[];
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
  /** Always set: soft tints re-derive inside the theme from whatever it changed. */
  'data-hj-theme'?: string;
}

/** Something about the colours worth a look. The theme still works; this says where it's weak. */
export interface ThemeWarning {
  /**
   * accent-danger · accent-text · on-accent · ink-contrast · flat-surfaces · data-contrast ·
   * data-similar
   */
  code: string;
  message: string;
}

/** A resolved theme: attributes plus the few CSS variables presets can’t express. */
export interface HanjiTheme {
  readonly input: ThemeInput;
  readonly attributes: ThemeAttributes;
  /** Inline CSS variables (custom paper and accent, radius, fonts, springs, colours). Often empty. */
  readonly vars: Readonly<Record<`--hj-${string}`, string>>;
  /** Contrast and clash checks on the colours this theme sets. Empty for hanji's presets. */
  readonly warnings: readonly ThemeWarning[];
  /** The theme as a CSS rule for `selector`, for SSR or a static stylesheet. */
  toCss(selector?: string): string;
}

const RADIUS_FACTOR = { sharp: 0.5, soft: 1, round: 1.4 } as const;

const ldv = (v: string | { light: string; dark: string }): string =>
  typeof v === 'string' ? v : `light-dark(${v.light}, ${v.dark})`;
const pair = (v: ThemeColor): AccentRamp => (typeof v === 'string' ? { light: v, dark: v } : v);
const fmt = (n: number): string => n.toFixed(1);
const MODES = ['light', 'dark'] as const;
type Mode = (typeof MODES)[number];
const ON = { light: 'on light grounds', dark: 'on dark grounds' } as const;

/** The grounds a theme is drawn on, per scheme; empty when it never shows that scheme. */
interface Grounds {
  light: PaperColors[];
  dark: PaperColors[];
  /** The custom paper's resolved colours, when there is one. */
  custom: { light?: PaperColors; dark?: PaperColors } | null;
}

function resolveGrounds(paper: ThemeInput['paper']): Grounds {
  const { paper: light, ink, charcoal } = papers;
  if (paper === undefined) return { light: [light], dark: [charcoal, ink], custom: null };
  if (paper === 'paper') return { light: [light], dark: [], custom: null };
  if (paper === 'ink') return { light: [], dark: [ink], custom: null };
  if (paper === 'charcoal') return { light: [], dark: [charcoal], custom: null };
  if (paper === 'auto') return { light: [light], dark: [charcoal], custom: null };
  let both: { light?: PaperColors; dark?: PaperColors };
  if ('tint' in paper) {
    const mode = paper.mode ?? 'auto';
    both = {
      light: mode === 'dark' ? undefined : derivePaper(tintPaper(paper.tint, 'light')),
      dark: mode === 'light' ? undefined : derivePaper(tintPaper(paper.tint, 'dark')),
    };
  } else if ('bg' in paper) {
    const p = derivePaper(paper);
    both = p.isDark ? { dark: p } : { light: p };
  } else {
    both = { light: derivePaper(paper.light), dark: derivePaper(paper.dark) };
  }
  return {
    light: both.light ? [both.light] : [],
    dark: both.dark ? [both.dark] : [],
    custom: both,
  };
}

/** A custom paper as inline variables: plain values for one scheme, light-dark() pairs for two. */
function customPaperVars(c: { light?: PaperColors; dark?: PaperColors }): Record<string, string> {
  const l = c.light ? paperVars(c.light) : undefined;
  const d = c.dark ? paperVars(c.dark) : undefined;
  const out: Record<string, string> = {};
  if (l && d) {
    for (const [k, v] of Object.entries(l)) {
      if (k === 'color-scheme' || k === '--hj-shadow-lift') continue;
      out[k] = `light-dark(${v}, ${d[k as keyof typeof d]})`;
    }
    // a shadow isn't a colour, so light-dark() goes inside it
    out['--hj-shadow-lift'] =
      '0 1px 0 light-dark(rgba(0, 0, 0, .02), transparent), 0 18px 40px -16px light-dark(rgba(0, 0, 0, .28), rgba(0, 0, 0, .7))';
    out['--hj-color-scheme'] = 'light dark';
  } else {
    const one = (l ?? d) as Record<string, string>;
    for (const [k, v] of Object.entries(one)) if (k !== 'color-scheme') out[k] = v;
    out['--hj-color-scheme'] = l ? 'light' : 'dark';
  }
  return out;
}

/**
 * Validate and resolve a theme. Throws a readable error when the input is wrong, so an agent is
 * told exactly which field to fix; returns `warnings` for colours that work but read poorly.
 *
 * @example
 * const theme = createTheme({ paper: { tint: '#1e3a5f' }, accent: { light: '#0b6bcb', dark: '#5aa9ff' } });
 * <Theme theme={theme}>…</Theme>
 */
export function createTheme(input: ThemeInput = {}): HanjiTheme {
  const t = checkTheme(input);
  const attributes: ThemeAttributes = { [THEME_ATTRS.theme]: '' };
  const vars: Record<`--hj-${string}`, string> = {};
  const warnings: ThemeWarning[] = [];
  const set = (k: string, v: string): void => {
    vars[k as `--hj-${string}`] = v;
  };

  if (typeof t.paper === 'string') attributes[THEME_ATTRS.paper] = t.paper;
  if (t.motion) attributes[THEME_ATTRS.motion] = t.motion;

  /* -- colour ------------------------------------------------------------------------------- */
  const g = resolveGrounds(t.paper);
  const bgs = (m: Mode): readonly string[] =>
    g[m].length ? g[m].map((p) => p.bg) : m === 'light' ? LIGHT_GROUNDS : DARK_GROUNDS;
  const text = (r: AccentRamp, soft = ACCENT_SOFT_ALPHA): string =>
    textRamp(r, soft, bgs('light'), bgs('dark'));
  const customAccent = typeof t.accent === 'object';
  const customPaper = g.custom !== null;
  const accent: AccentRamp =
    typeof t.accent === 'object' ? t.accent : accents[t.accent ?? 'scarlet'];

  if (g.custom) {
    attributes[THEME_ATTRS.paper] = 'custom';
    for (const [k, v] of Object.entries(customPaperVars(g.custom))) set(k, v);
  }
  if (typeof t.accent === 'string') attributes[THEME_ATTRS.accent] = t.accent;
  else if (t.accent) {
    attributes[THEME_ATTRS.accent] = 'custom';
    set('--hj-accent', ldv(t.accent));
    set('--hj-on-accent', `light-dark(${bestInkOn(t.accent.light)}, ${bestInkOn(t.accent.dark)})`);
  }
  // text-safe stops are measured against the grounds, so they follow a custom accent or paper
  if (customAccent || customPaper) set('--hj-accent-text', text(accent));

  const danger: AccentRamp = t.colors?.danger
    ? pair(t.colors.danger)
    : {
        light: g.light[0]?.danger ?? DANGER.light,
        dark: g.dark[0]?.danger ?? DANGER.dark,
      };
  for (const name of ['danger', 'success', 'warning', 'info', 'seal'] as const) {
    const v = t.colors?.[name];
    if (v) set(`--hj-${name}`, ldv(v));
    if (name === 'seal') continue;
    const base = name === 'danger' ? danger : v ? pair(v) : status[name];
    if (v || customPaper) set(`--hj-${name}-text`, text(base, name === 'warning' ? 0.16 : 0.14));
  }
  if (t.colors?.pending) {
    set('--hj-pending', ldv(t.colors.pending));
    set('--hj-pending-text', text(pair(t.colors.pending)));
  } else if (customAccent || customPaper || t.colors?.danger) {
    const clash = clashesWithDanger(accent, danger);
    set('--hj-pending', clash ? 'var(--hj-info)' : 'var(--hj-accent)');
    set('--hj-pending-text', clash ? 'var(--hj-info-text)' : 'var(--hj-accent-text)');
    if (clash) {
      const d = Math.min(deltaE(accent.light, danger.light), deltaE(accent.dark, danger.dark));
      warnings.push({
        code: 'accent-danger',
        message: `The accent and danger are nearly the same colour (ΔE ${d.toFixed(2)}). Status “pending” uses info instead, so work in progress never reads as a failure; keep destructive actions labelled with a verb and a glyph, not colour alone.`,
      });
    }
  }
  t.data?.forEach((c, i) => set(`--hj-data-${i + 1}`, ldv(c)));

  /* -- checks ------------------------------------------------------------------------------- */
  // one warning per finding: a single-colour series says the same thing in both schemes
  const said = new Set<string>();
  const warn = (w: ThemeWarning): void => {
    if (said.has(w.message.replace(ON.dark, ON.light))) return;
    said.add(w.message.replace(ON.dark, ON.light));
    warnings.push(w);
  };
  for (const m of MODES) {
    const grounds = g[m];
    if (!grounds.length) continue;
    const a = accent[m];
    if (customAccent || customPaper) {
      const worst = Math.min(...grounds.map((p) => contrastRatio(a, p.bg)));
      if (worst < 4.5)
        warnings.push({
          code: 'accent-text',
          message: `The accent is ${fmt(worst)}:1 as text ${ON[m]}. hanji draws accent labels and links with a deepened stop (--hj-accent-text) that reaches 4.5:1; fills keep ${a}.`,
        });
    }
    if (customAccent) {
      const on = contrastRatio(bestInkOn(a), a);
      if (on < 4.5)
        warnings.push({
          code: 'on-accent',
          message: `Labels on accent fills reach only ${fmt(on)}:1 ${ON[m]}. Pick a deeper or lighter ${m} stop so button text reads at 4.5:1.`,
        });
    }
    if (customPaper)
      for (const p of grounds) {
        const ink = contrastRatio(p.fg, p.bg);
        if (ink < 4.5)
          warnings.push({
            code: 'ink-contrast',
            message: `Body text on the ${m} ground is ${fmt(ink)}:1 — under AA. Choose a ${m === 'light' ? 'darker' : 'lighter'} ink.`,
          });
        if (!p.isDark && contrastRatio(p.surface2, p.bg) < 1.03)
          warnings.push({
            code: 'flat-surfaces',
            message: `The light ground (${p.bg}) is nearly white, so cards and popovers — a step lighter by design — can't stand apart from it. Tint the ground slightly (for example #f4f3f0) or pass surface and surface2.`,
          });
      }
    t.data?.forEach((c, i) => {
      const x = pair(c)[m];
      const worst = Math.min(...grounds.map((p) => contrastRatio(x, p.bg)));
      if (worst < 3)
        warn({
          code: 'data-contrast',
          message: `Chart colour ${i + 1} (${x}) is ${fmt(worst)}:1 ${ON[m]}; marks need 3:1 to be seen.`,
        });
      const next = t.data?.[i + 1];
      if (next !== undefined) {
        const d = deltaE(x, pair(next)[m]);
        if (d < 0.08)
          warn({
            code: 'data-similar',
            message: `Chart colours ${i + 1} and ${i + 2} are nearly the same ${ON[m]} (ΔE ${d.toFixed(2)}); neighbouring series will blur together.`,
          });
      }
    });
  }

  /* -- the rest ------------------------------------------------------------------------------ */
  if (typeof t.density === 'string') attributes[THEME_ATTRS.density] = t.density;
  else if (typeof t.density === 'number') {
    attributes[THEME_ATTRS.density] = 'custom';
    set('--hj-density', String(t.density));
  }
  if (t.radius !== undefined) {
    const f = typeof t.radius === 'number' ? t.radius : RADIUS_FACTOR[t.radius];
    attributes[THEME_ATTRS.radius] = 'custom';
    for (const [k, px] of Object.entries(radiusScale)) {
      if (k !== 'pill') set(`--hj-r-${k}`, `${Math.round(px * f * 10) / 10}px`);
    }
  }
  if (t.smoothing !== undefined) {
    attributes[THEME_ATTRS.smoothing] = 'custom';
    set('--hj-smoothing', String(Math.max(0, Math.min(1, t.smoothing))));
    set('--hj-corner-shape', cornerShapeFor(t.smoothing));
  }
  if (t.fonts?.sans) set('--hj-font-sans', t.fonts.sans);
  if (t.fonts?.mono) set('--hj-font-mono', t.fonts.mono);
  if (t.springs) {
    for (const [name, sp] of Object.entries(t.springs)) {
      if (sp)
        Object.assign(
          vars,
          springVars(name, { damping: sp.damping, stiffness: sp.stiffness, mass: sp.mass ?? 1 }),
        );
    }
  }
  return {
    input,
    attributes,
    vars,
    warnings,
    toCss(selector = ':root'): string {
      const attrs = Object.entries(attributes)
        .map(([k, v]) => `/* ${k}="${v}" */`)
        .join(' ');
      const body = Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
      // a custom paper's scheme normally rides on [data-hj-paper="custom"]; a bare selector needs it here
      const scheme = vars['--hj-color-scheme'] ? '\n  color-scheme: var(--hj-color-scheme);' : '';
      return `${attrs}\n@layer hj.tokens {\n${selector} {\n${body}${scheme}\n}\n}\n`;
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

const isPaperInput = (v: unknown): v is PaperInput => {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  if (!isHex(String(p.bg)) || !isHex(String(p.fg))) return false;
  // line may be rgba(); the rest are hex
  return ['bgSoft', 'surface', 'surface2', 'fgDim', 'fgMute', 'danger'].every(
    (k) => p[k] === undefined || isHex(String(p[k])),
  );
};

function checkPaper(p: unknown): void {
  if (typeof p === 'string') {
    if (![...paperNames, 'auto'].includes(p as 'auto'))
      fail(`paper must be one of paper, ink, charcoal, auto or a custom ground — got "${p}"`);
    return;
  }
  if (typeof p !== 'object' || p === null) fail('paper must be a name or a custom ground');
  const o = p as Record<string, unknown>;
  if ('tint' in o) {
    if (!isHex(String(o.tint))) fail('paper.tint must be a hex colour');
    if (o.mode !== undefined && !['light', 'dark', 'auto'].includes(String(o.mode)))
      fail('paper.mode must be light, dark or auto');
  } else if ('bg' in o) {
    if (!isPaperInput(o)) fail('paper {bg, fg} needs hex colours (line may be rgba)');
  } else if (!isPaperInput(o.light) || !isPaperInput(o.dark)) {
    fail('paper {light, dark} needs a {bg, fg} ground for each');
  }
}

const isColor = (v: unknown): boolean => (typeof v === 'string' ? isHex(v) : isRamp(v));

function checkTheme(t: ThemeInput): ThemeInput {
  if (t.paper !== undefined) checkPaper(t.paper);
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
      if (v && !isColor(v)) fail(`colors.${k} is not a hex colour or {light, dark}`);
  if (t.data !== undefined) {
    if (!Array.isArray(t.data) || t.data.length > 6) fail('data takes up to six colours');
    t.data.forEach((c, i) => {
      if (!isColor(c)) fail(`data[${i}] is not a hex colour or {light, dark}`);
    });
  }
  return t;
}
