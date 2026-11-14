import { blend, rgba } from './color.ts';

/** The three grounds hanji ships. `auto` follows the system: paper by day, charcoal by night. */
export const paperNames = ['paper', 'ink', 'charcoal'] as const;
export type PaperName = (typeof paperNames)[number];

/** Semantic colours a paper defines (everything except the accent trio). */
export interface PaperColors {
  readonly isDark: boolean;
  readonly bg: string;
  readonly bgSoft: string;
  readonly surface: string;
  readonly surface2: string;
  /** Hairline, as rgba — it must read on every surface step. */
  readonly line: string;
  readonly fg: string;
  readonly fgDim: string;
  readonly fgMute: string;
  readonly danger: string;
}

const WHITE = '#ffffff';
const BLACK = '#000000';
const INK_BG = '#000000';
const INK_FG = '#f4f2ef';
const CHARCOAL_BG = '#111114';
const CHARCOAL_FG = '#f1efec';
const PAPER_BG = '#f0ece3';
const PAPER_FG = '#16130f';

/** @hanji/core theme/themes.ts — same blends, same values. */
export const papers: Readonly<Record<PaperName, PaperColors>> = {
  paper: {
    isDark: false,
    bg: PAPER_BG,
    bgSoft: blend(PAPER_BG, WHITE, 0.45),
    surface: blend(PAPER_BG, WHITE, 0.75),
    surface2: WHITE,
    line: rgba(BLACK, 0.1),
    fg: PAPER_FG,
    fgDim: blend(PAPER_BG, PAPER_FG, 0.68),
    // .50 not .42: the contrast linter's first catch (3.30:1 vs a 3:1 floor).
    fgMute: blend(PAPER_BG, PAPER_FG, 0.5),
    danger: '#c4321f',
  },
  ink: {
    isDark: true,
    bg: INK_BG,
    bgSoft: blend(INK_BG, WHITE, 0.03),
    surface: blend(INK_BG, WHITE, 0.05),
    surface2: blend(INK_BG, WHITE, 0.08),
    line: rgba(WHITE, 0.08),
    fg: INK_FG,
    fgDim: blend(INK_BG, INK_FG, 0.72),
    fgMute: blend(INK_BG, INK_FG, 0.45),
    danger: '#ff6b5e',
  },
  charcoal: {
    isDark: true,
    bg: CHARCOAL_BG,
    bgSoft: blend(CHARCOAL_BG, WHITE, 0.04),
    surface: blend(CHARCOAL_BG, WHITE, 0.07),
    surface2: blend(CHARCOAL_BG, WHITE, 0.11),
    line: rgba(WHITE, 0.1),
    fg: CHARCOAL_FG,
    fgDim: blend(CHARCOAL_BG, CHARCOAL_FG, 0.74),
    fgMute: blend(CHARCOAL_BG, CHARCOAL_FG, 0.48),
    danger: '#ff6b5e',
  },
};

/** An accent is a pair: a deeper stop for light paper, a lighter one for dark papers. */
export interface AccentRamp {
  readonly light: string;
  readonly dark: string;
}

export const accentNames = [
  'iris',
  'violet',
  'rose',
  'scarlet',
  'ember',
  'amber',
  'lime',
  'moss',
  'teal',
  'azure',
  'cobalt',
  'mono',
] as const;
export type AccentName = (typeof accentNames)[number];

/** @hanji/core theme/accents.ts */
export const accents: Readonly<Record<AccentName, AccentRamp>> = {
  iris: { light: '#5a45c9', dark: '#8e7bf0' },
  violet: { light: '#8b33c4', dark: '#c083e8' },
  rose: { light: '#c81e56', dark: '#f5789f' },
  scarlet: { light: '#b81f18', dark: '#ff5a52' },
  ember: { light: '#c4441a', dark: '#ff7a4d' },
  amber: { light: '#9a6b00', dark: '#f5c044' },
  lime: { light: '#5c7a00', dark: '#b8d94a' },
  moss: { light: '#237a46', dark: '#6fcf97' },
  teal: { light: '#0f7f76', dark: '#4fd1c5' },
  azure: { light: '#0a6e93', dark: '#62c4e8' },
  cobalt: { light: '#2848c9', dark: '#7e9bff' },
  mono: { light: '#2a2622', dark: '#e8e6e2' },
};

/** `blend(bg, accent, .14)` — accentSoft. */
export const ACCENT_SOFT_ALPHA = 0.14;

/**
 * Status roles (proposed): no new hues — each borrows a ramp hanji already ships.
 * `danger` stays per-paper (above); these follow light/dark like an accent.
 */
export const status: Readonly<Record<'success' | 'warning' | 'info', AccentRamp>> = {
  success: accents.moss,
  warning: accents.amber,
  info: accents.azure,
};

/** Data series (proposed): ordered so neighbours never share a family. */
export const dataSeries: readonly AccentName[] = [
  'cobalt',
  'ember',
  'moss',
  'violet',
  'amber',
  'teal',
];

/** The brand seal — cinnabar on every paper, never re-inked by the accent. */
export const seal: AccentRamp = { light: '#b5241b', dark: '#d23a2e' };

/** Scrim and the ink drawn on it: black and near-white on every paper. */
export const SCRIM = '#000000';
export const ON_SCRIM = '#f4f2ef';
