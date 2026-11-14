import { contrastOn } from './color.ts';
import {
  EASE_OUT_CUBIC,
  REDUCED_SPRING,
  durations,
  press,
  springNames,
  springToCss,
  springs,
  stagger,
} from './motion.ts';
import type { Spring, SpringName } from './motion.ts';
import {
  ACCENT_SOFT_ALPHA,
  ON_SCRIM,
  SCRIM,
  accentNames,
  accents,
  dataSeries,
  paperNames,
  papers,
  seal,
  status,
} from './palette.ts';
import type { AccentRamp, PaperColors } from './palette.ts';
import {
  densities,
  fonts,
  metrics,
  radius,
  shadows,
  spacing,
  typeRoleNames,
  typeScale,
  zIndex,
} from './scale.ts';

/**
 * Every theme attribute the library reads. Put any of them on any element to re-theme that
 * subtree; nesting works because derived values are recomputed wherever an attribute is set.
 */
export const THEME_ATTRS = {
  paper: 'data-hj-paper',
  accent: 'data-hj-accent',
  density: 'data-hj-density',
  motion: 'data-hj-motion',
} as const;

const pct = (n: number): string => `${Math.round(n * 1000) / 10}%`;
const ld = (ramp: AccentRamp): string => `light-dark(${ramp.light}, ${ramp.dark})`;
const decl = (vars: Record<string, string>): string =>
  Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

/** CSS variables a paper defines. */
export function paperVars(p: PaperColors): Record<`--hj-${string}`, string> {
  return {
    'color-scheme': p.isDark ? 'dark' : 'light',
    '--hj-bg': p.bg,
    '--hj-bg-soft': p.bgSoft,
    '--hj-surface': p.surface,
    '--hj-surface-2': p.surface2,
    '--hj-line': p.line,
    '--hj-fg': p.fg,
    '--hj-fg-dim': p.fgDim,
    '--hj-fg-mute': p.fgMute,
    '--hj-danger': p.danger,
    '--hj-shadow-lift': p.isDark ? shadows.liftDark : shadows.lift,
  } as Record<`--hj-${string}`, string>;
}

/** CSS variables an accent defines: the stop is picked by the element's colour scheme. */
export function accentVars(ramp: AccentRamp): Record<`--hj-${string}`, string> {
  return {
    '--hj-accent': ld(ramp),
    '--hj-on-accent': `light-dark(${contrastOn(ramp.light)}, ${contrastOn(ramp.dark)})`,
  };
}

/** Values derived from paper + accent. Re-declared wherever either changes, so nesting stays true. */
const derived: Record<string, string> = {
  '--hj-accent-soft': `color-mix(in srgb, var(--hj-accent) ${pct(ACCENT_SOFT_ALPHA)}, var(--hj-bg))`,
  '--hj-danger-soft': 'color-mix(in srgb, var(--hj-danger) 14%, var(--hj-bg))',
  '--hj-success': ld(status.success),
  '--hj-success-soft': 'color-mix(in srgb, var(--hj-success) 14%, var(--hj-bg))',
  '--hj-warning': ld(status.warning),
  '--hj-warning-soft': 'color-mix(in srgb, var(--hj-warning) 16%, var(--hj-bg))',
  '--hj-info': ld(status.info),
  '--hj-info-soft': 'color-mix(in srgb, var(--hj-info) 14%, var(--hj-bg))',
  '--hj-focus': 'var(--hj-accent)',
  '--hj-seal': ld(seal),
  '--hj-scrim': SCRIM,
  '--hj-on-scrim': ON_SCRIM,
  ...Object.fromEntries(dataSeries.map((n, i) => [`--hj-data-${i + 1}`, ld(accents[n])])),
};

/** CSS variables for one spring (free and clamped). */
export function springVars(
  name: SpringName | string,
  spring: Spring,
): Record<`--hj-${string}`, string> {
  const free = springToCss(spring, false);
  const held = springToCss(spring, true);
  return {
    [`--hj-ease-${name}`]: free.easing,
    [`--hj-dur-${name}`]: `${free.duration}ms`,
    [`--hj-ease-${name}-settle`]: held.easing,
    [`--hj-dur-${name}-settle`]: `${held.duration}ms`,
  };
}

function motionVars(): Record<string, string> {
  const v: Record<string, string> = {
    '--hj-ease-out': EASE_OUT_CUBIC,
    '--hj-dur-fast': `${durations.fast}ms`,
    '--hj-dur-base': `${durations.base}ms`,
    '--hj-dur-slow': `${durations.slow}ms`,
    '--hj-stagger': `${stagger.stepMs}ms`,
    '--hj-stagger-cap': String(stagger.cap),
    '--hj-rise': `${stagger.rise}px`,
    '--hj-press': String(press.scale),
    '--hj-press-opacity': String(press.opacity),
    '--hj-travel': '1',
    /* loops: a spinner turns; ambient decoration runs */
    '--hj-anim-spin': 'hj-spin 900ms linear infinite',
    '--hj-ambient': 'running',
  };
  for (const n of springNames) Object.assign(v, springVars(n, springs[n]));
  return v;
}

function staticVars(): Record<string, string> {
  const v: Record<string, string> = {
    '--hj-font-sans': fonts.sans,
    '--hj-font-mono': fonts.mono,
    '--hj-hairline': `${metrics.hairline}px`,
    '--hj-touch': `${metrics.touchTarget}px`,
    '--hj-shadow-art': shadows.art,
    ...motionVars(),
  };
  for (const [k, px] of Object.entries(radius)) v[`--hj-radius-${k}`] = `${px}px`;
  for (const [k, n] of Object.entries(zIndex)) v[`--hj-z-${k}`] = String(n);
  for (const role of typeRoleNames) {
    const t = typeScale[role];
    const family = t.mono ? 'var(--hj-font-mono)' : 'var(--hj-font-sans)';
    v[`--hj-type-${role}`] = `${t.weight} ${t.size}px/${t.lineHeight}px ${family}`;
    v[`--hj-tracking-${role}`] = `${t.tracking}px`;
  }
  return v;
}

function spacingVars(): Record<string, string> {
  const v: Record<string, string> = {};
  for (const [k, px] of Object.entries(spacing))
    v[`--hj-space-${k}`] = `calc(${px}px * var(--hj-density))`;
  // Control heights follow density more gently than spacing: compact .7 → ~.87, so a 44px button
  // draws at 38. Hit areas stay 44 (components grow them with ::before).
  v['--hj-density-size'] = 'calc(1 - (1 - var(--hj-density)) * 0.42)';
  v['--hj-gutter'] = 'var(--hj-space-5)';
  v['--hj-section-gap'] = 'var(--hj-space-10)';
  return v;
}

/** Reduced motion: feedback survives, decoration dies, travel becomes a fade, nothing lingers. */
function reducedVars(): Record<string, string> {
  const v: Record<string, string> = {
    '--hj-travel': '0',
    '--hj-stagger': '0ms',
    '--hj-dur-base': '180ms',
    '--hj-dur-slow': '180ms',
    // a spinner is feedback, so it survives — as a pulse, not a turn; decoration stops
    '--hj-anim-spin': 'hj-pulse 1100ms ease-in-out infinite alternate',
    '--hj-ambient': 'paused',
  };
  const r = springToCss(REDUCED_SPRING, true);
  for (const n of springNames) {
    v[`--hj-ease-${n}`] = 'var(--hj-ease-out)';
    v[`--hj-ease-${n}-settle`] = 'var(--hj-ease-out)';
    v[`--hj-dur-${n}`] = `${Math.max(r.duration, 120)}ms`;
    v[`--hj-dur-${n}-settle`] = `${Math.max(r.duration, 120)}ms`;
  }
  return v;
}

const block = (selector: string, vars: Record<string, string>): string =>
  `${selector} {\n${decl(vars)}\n}`;

/**
 * The complete token stylesheet, wrapped in `@layer hj.tokens` so any app CSS outranks it.
 * Default theme: paper + scarlet, cozy, motion following the system.
 */
export function tokensCss(
  defaults: { paper?: (typeof paperNames)[number]; accent?: (typeof accentNames)[number] } = {},
): string {
  const paper = defaults.paper ?? 'paper';
  const accent = defaults.accent ?? 'scarlet';
  const D = THEME_ATTRS;
  const out: string[] = [];
  out.push(block(':root', staticVars()));
  // papers — :root carries the default, attributes override it (same specificity, later wins)
  out.push(block(`:root`, paperVars(papers[paper])));
  for (const name of paperNames) out.push(block(`[${D.paper}="${name}"]`, paperVars(papers[name])));
  out.push(block(`[${D.paper}="auto"]`, paperVars(papers.paper)));
  out.push(
    `@media (prefers-color-scheme: dark) {\n${block(`[${D.paper}="auto"]`, paperVars(papers.charcoal))}\n}`,
  );
  // accents
  out.push(block(':root', accentVars(accents[accent])));
  for (const name of accentNames)
    out.push(block(`[${D.accent}="${name}"]`, accentVars(accents[name])));
  // derived — recomputed wherever paper or accent changes
  out.push(block(`:root, [${D.paper}], [${D.accent}]`, derived));
  // density — spacing recomputed wherever density changes
  out.push(block(':root', { '--hj-density': String(densities.cozy) }));
  for (const [name, f] of Object.entries(densities))
    out.push(block(`[${D.density}="${name}"]`, { '--hj-density': String(f) }));
  out.push(block(`:root, [${D.density}]`, spacingVars()));
  // motion policy — system by default, overridable either way
  out.push(
    `@media (prefers-reduced-motion: reduce) {\n${block(`:root:not([${D.motion}="full"]), [${D.motion}="system"]`, reducedVars())}\n}`,
  );
  out.push(block(`[${D.motion}="reduced"]`, reducedVars()));
  out.push(block(`[${D.motion}="full"]`, motionVars()));
  // browsers without linear(): springs fall back to ease-out
  out.push(
    `@supports not (transition-timing-function: linear(0, 1)) {\n${block(
      ':root',
      Object.fromEntries(
        springNames.flatMap((n) => [
          [`--hj-ease-${n}`, 'var(--hj-ease-out)'],
          [`--hj-ease-${n}-settle`, 'var(--hj-ease-out)'],
        ]),
      ),
    )}\n}`,
  );
  return `@layer hj.tokens, hj.base, hj.components, hj.utilities;\n\n@layer hj.tokens {\n${out.join('\n\n')}\n}\n`;
}
