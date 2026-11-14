import { describe, expect, it } from 'vitest';

import { blend, contrastRatio, deltaE, readable } from './color.ts';
import { clashesWithDanger, tokensCss } from './css.ts';
import { DANGER, accentNames, accents, derivePaper, papers, tintPaper } from './palette.ts';
import { checkThemeInput, parseTheme, themeJsonSchema } from './schema.ts';
import { createTheme } from './theme.ts';

const css = tokensCss();
/** The value a rule for `selector` gives `prop` in the token stylesheet. */
function declared(selector: string, prop: string): string | undefined {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return undefined;
  const body = css.slice(start, css.indexOf('}', start));
  return new RegExp(`${prop}: ([^;]+);`).exec(body)?.[1];
}
const stops = (v: string | undefined): [string, string] => {
  const m = /light-dark\((#[0-9a-f]{6}), (#[0-9a-f]{6})\)/.exec(v ?? '');
  return [m?.[1] ?? '', m?.[2] ?? ''];
};

describe('preset tokens', () => {
  it('the default theme needs no variables and raises nothing', () => {
    const t = createTheme();
    expect(t.vars).toEqual({});
    expect(t.warnings).toEqual([]);
    expect(t.attributes['data-hj-theme']).toBe('');
  });

  it('every preset accent reads at 4.5:1 as text, on the ground and on its own tint', () => {
    const fails: string[] = [];
    for (const name of accentNames) {
      const [light, dark] = stops(declared(`[data-hj-accent="${name}"]`, '--hj-accent-text'));
      const r = accents[name];
      const paper = papers.paper.bg;
      if (contrastRatio(light, paper) < 4.5) fails.push(`${name} on paper`);
      if (contrastRatio(light, blend(paper, r.light, 0.14)) < 4.5)
        fails.push(`${name} on its tint`);
      for (const bg of [papers.charcoal.bg, papers.ink.bg])
        if (contrastRatio(dark, blend(bg, r.dark, 0.14)) < 4.5) fails.push(`${name} on ${bg}`);
    }
    expect(fails).toEqual([]);
  });

  it('accents that could pass for danger hand "pending" to info', () => {
    const pending = Object.fromEntries(
      accentNames.map((n) => [n, declared(`[data-hj-accent="${n}"]`, '--hj-pending')]),
    );
    const expected = Object.fromEntries(
      accentNames.map((n) => [
        n,
        clashesWithDanger(accents[n], DANGER) ? 'var(--hj-info)' : 'var(--hj-accent)',
      ]),
    );
    expect(pending).toEqual(expected);
    expect(clashesWithDanger(accents.scarlet)).toBe(true);
    expect(clashesWithDanger(accents.cobalt)).toBe(false);
  });

  it('re-derives soft tints inside any Theme, not only where a paper or accent is set', () => {
    expect(css).toMatch(/\[data-hj-theme\][^{]*\{[^}]*--hj-danger-soft/);
  });
});

describe('custom grounds', () => {
  it('derives surfaces and holds dim and mute ink to 4.5:1 and 3:1', () => {
    for (const p of [
      { bg: '#f6f1e7', fg: '#3b3a36' },
      { bg: '#1b2433', fg: '#9aa3b2' },
      { bg: '#ffffff', fg: '#555555' },
    ]) {
      const d = derivePaper(p);
      expect(contrastRatio(d.fgDim, d.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(d.fgMute, d.bg)).toBeGreaterThanOrEqual(3);
    }
    expect(derivePaper({ bg: '#10141c', fg: '#eef1f6' }).isDark).toBe(true);
  });

  it('builds both schemes from one tint and lets the browser pick', () => {
    const t = createTheme({ paper: { tint: '#1e3a5f' } });
    expect(t.attributes['data-hj-paper']).toBe('custom');
    expect(t.vars['--hj-color-scheme']).toBe('light dark');
    expect(t.vars['--hj-bg']).toMatch(/^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
    expect(t.vars['--hj-shadow-lift']).toContain('light-dark(');
    expect(t.toCss()).toContain('color-scheme: var(--hj-color-scheme)');
    const light = derivePaper(tintPaper('#1e3a5f', 'light'));
    expect(contrastRatio(light.fg, light.bg)).toBeGreaterThan(12);
  });

  it('a single custom ground sets just its own scheme', () => {
    const t = createTheme({ paper: { bg: '#0f1720', fg: '#e8edf3' } });
    expect(t.vars['--hj-color-scheme']).toBe('dark');
    expect(t.vars['--hj-bg']).toBe('#0f1720');
  });

  it('re-measures text stops against the custom ground', () => {
    const t = createTheme({ paper: { bg: '#dfe6f0', fg: '#0d1520' }, accent: 'amber' });
    const [light] = stops(t.vars['--hj-accent-text']);
    expect(contrastRatio(light, '#dfe6f0')).toBeGreaterThanOrEqual(4.5);
    expect(t.vars['--hj-success-text']).toBeDefined();
  });
});

describe('custom colours and warnings', () => {
  it('a custom accent gets a contrast-picked ink and a text-safe stop', () => {
    const t = createTheme({ accent: { light: '#ffcc00', dark: '#ffcc00' } });
    expect(t.vars['--hj-on-accent']).toBe('light-dark(#0b0a09, #0b0a09)');
    const [light] = stops(t.vars['--hj-accent-text']);
    expect(contrastRatio(light, papers.paper.bg)).toBeGreaterThanOrEqual(4.5);
    expect(t.warnings.map((w) => w.code)).toContain('accent-text');
  });

  it('a red brand accent warns about danger and moves pending to info', () => {
    const t = createTheme({ accent: { light: '#c8102e', dark: '#ff4d5e' } });
    expect(t.vars['--hj-pending']).toBe('var(--hj-info)');
    expect(t.warnings.map((w) => w.code)).toContain('accent-danger');
  });

  it('an explicit pending colour wins, and needs no clash check', () => {
    const t = createTheme({
      accent: { light: '#c8102e', dark: '#ff4d5e' },
      colors: { pending: { light: '#9a6b00', dark: '#f5c044' } },
    });
    expect(t.vars['--hj-pending']).toBe('light-dark(#9a6b00, #f5c044)');
    expect(t.warnings.map((w) => w.code)).not.toContain('accent-danger');
  });

  it('flags a white ground, faint chart colours and neighbours that look alike — once each', () => {
    const t = createTheme({
      paper: { bg: '#ffffff', fg: '#111111' },
      data: ['#2848c9', '#2a4bd0', '#eeeeee'],
    });
    const codes = t.warnings.map((w) => w.code);
    expect(codes).toContain('flat-surfaces');
    expect(codes.filter((c) => c === 'data-similar')).toHaveLength(1);
    expect(codes).toContain('data-contrast');
    expect(t.vars['--hj-data-3']).toBe('#eeeeee');
  });

  it('rejects malformed input with the field to fix', () => {
    expect(() => createTheme({ paper: { tint: 'navy' } })).toThrow(/paper\.tint/);
    expect(() => createTheme({ data: Array(7).fill('#000000') })).toThrow(/six/);
    expect(() => createTheme({ colors: { pending: 'soon' } })).toThrow(/colors\.pending/);
  });
});

describe('schema', () => {
  it('accepts every custom ground shape and chart colours', () => {
    for (const paper of [
      { tint: '#1e3a5f', mode: 'dark' as const },
      { bg: '#f6f1e7', fg: '#3b3a36', line: 'rgba(0, 0, 0, .12)' },
      { light: { bg: '#f6f1e7', fg: '#3b3a36' }, dark: { bg: '#141310', fg: '#ece6da' } },
    ])
      expect(checkThemeInput({ paper, data: ['#2848c9'] })).toEqual({ success: true });
    expect(parseTheme({ paper: { tint: '#1e3a5f' } }).attributes['data-hj-paper']).toBe('custom');
    expect(JSON.stringify(themeJsonSchema())).toContain('tint');
  });
});

describe('colour maths', () => {
  it('readable leaves colours that already read, and nudges the rest just far enough', () => {
    expect(readable('#2848c9', [papers.paper.bg])).toBe('#2848c9');
    const amber = readable('#9a6b00', [papers.paper.bg]);
    expect(contrastRatio(amber, blend(papers.paper.bg, '#9a6b00', 0.14))).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(deltaE(amber, '#9a6b00')).toBeLessThan(0.12);
  });
});
