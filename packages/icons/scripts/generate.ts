/**
 * Generates @hanji/icons from the Solar icon set by 480 Design (CC BY 4.0 — credited in LICENSE,
 * the README and the docs). Deterministic: run again after bumping @iconify-json/solar.
 *
 * What hanji changes, on every drawing:
 *   - every sharp vertex between two straight strokes or edges gets a soft fillet
 *     (FILLET_LINE on lines, FILLET_FILL on solids), and every line join and cap is round;
 *   - every circular rounded corner becomes hanji's continuous corner (corners.ts);
 *   - two-ink styles: Solar's secondary marks are redrawn in a second ink (the accent in hanji);
 *   - a wash style: the line over its own solid at 16%;
 *   - hanji names, aliases and search words; and hanji's own glyphs where Solar has none.
 * Icons whose line drawing needs SVG masks are skipped; other styles fall back as noted.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hanjiPath } from './corners.ts';
import { ALIASES, ORIGINALS, SYNONYMS } from './hanji.ts';
import type { Drawing, Node } from './hanji.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, '..');
const solarDir = join(pkg, 'node_modules/@iconify-json/solar');
const src = join(pkg, 'src');
const out = join(src, 'icons');

const FILLET_LINE = 1.2;
const FILLET_FILL = 0.6;
const PRECISION = 2;

const solar = JSON.parse(readFileSync(join(solarDir, 'icons.json'), 'utf8')) as {
  icons: Record<string, { body: string }>;
};
const meta = JSON.parse(readFileSync(join(solarDir, 'metadata.json'), 'utf8')) as {
  categories: Record<string, string[]>;
};
const version = (
  JSON.parse(readFileSync(join(solarDir, 'package.json'), 'utf8')) as { version: string }
).version;

type Style = 'line-duotone' | 'bold-duotone' | 'linear' | 'bold';
const STYLE_RE = /-(bold-duotone|line-duotone|bold|linear|broken|outline)$/;

const categoryOf = new Map<string, string>();
for (const [cat, names] of Object.entries(meta.categories)) {
  for (const n of names) categoryOf.set(n.replace(STYLE_RE, ''), cat);
}

// ---------- body → nodes ----------

const ATTR = /([\w:-]+)="([^"]*)"/g;
const TAG = /<(\/?)(\w+)([^>]*?)(\/?)>/g;

function attrs(s: string): Record<string, string> {
  const a: Record<string, string> = {};
  for (const m of s.matchAll(ATTR)) a[m[1] as string] = m[2] as string;
  return a;
}

function shapeToPath(tag: string, a: Record<string, string>): string | null {
  const n = (k: string, d = 0): number => (a[k] === undefined ? d : Number(a[k]));
  if (tag === 'path') return a.d ?? null;
  if (tag === 'circle' || tag === 'ellipse') {
    const cx = n('cx');
    const cy = n('cy');
    const rx = tag === 'circle' ? n('r') : n('rx');
    const ry = tag === 'circle' ? n('r') : n('ry');
    return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
  }
  if (tag === 'rect') {
    const x = n('x');
    const y = n('y');
    const w = n('width');
    const h = n('height');
    const rx = Math.min(a.rx !== undefined ? n('rx') : n('ry'), w / 2);
    const ry = Math.min(a.ry !== undefined ? n('ry') : rx, h / 2);
    if (!rx) return `M${x} ${y}h${w}v${h}h${-w}z`;
    return `M${x + rx} ${y}h${w - 2 * rx}a${rx} ${ry} 0 0 1 ${rx} ${ry}v${h - 2 * ry}a${rx} ${ry} 0 0 1 ${-rx} ${ry}h${-(w - 2 * rx)}a${rx} ${ry} 0 0 1 ${-rx} ${-ry}v${-(h - 2 * ry)}a${rx} ${ry} 0 0 1 ${rx} ${-ry}z`;
  }
  return null;
}

/** Parse an Iconify body into hanji nodes, or null when it needs masks or clips. */
function nodes(body: string): Node[] | null {
  if (/<(mask|clipPath|use|defs|linearGradient|radialGradient)\b/.test(body)) return null;
  const stack: Record<string, string>[] = [{}];
  const result: Node[] = [];
  for (const m of body.matchAll(TAG)) {
    const close = m[1];
    const tag = m[2] as string;
    const own = attrs(m[3] ?? '');
    const self = m[4];
    if (close) {
      if (tag === 'g') stack.pop();
      continue;
    }
    const parent = stack.at(-1) as Record<string, string>;
    const inherited = { ...parent, ...own };
    const opacity = Number(parent.opacity ?? 1) * Number(own.opacity ?? 1);
    if (tag === 'g') {
      if (!self) stack.push({ ...inherited, opacity: String(opacity) });
      continue;
    }
    const d = shapeToPath(tag, own);
    if (!d) continue;
    const secondary = opacity < 0.99;
    const fill = inherited.fill ?? 'currentColor';
    const stroke = inherited.stroke;
    const width = Number(inherited['stroke-width'] ?? 1);
    if (fill !== 'none') {
      result.push({
        kind: inherited['fill-rule'] === 'evenodd' ? 'e' : 'f',
        d: hanjiPath(d, { fillet: FILLET_FILL, precision: PRECISION }),
        secondary,
      });
    }
    if (stroke && stroke !== 'none') {
      result.push({
        kind: 's',
        d: hanjiPath(d, { fillet: FILLET_LINE, precision: PRECISION }),
        secondary,
        width: Math.abs(width - 1.5) < 0.01 ? undefined : width,
      });
    }
  }
  return result.length ? result : null;
}

// ---------- pick icons ----------

interface Picked {
  name: string;
  component: string;
  category: string;
  tags: string[];
  aliases: string[];
  line: Drawing;
  solid: Drawing;
  duo: Drawing;
  duoSolid: Drawing;
  original: boolean;
}

const pascal = (n: string): string =>
  n.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

const bases = new Set<string>();
for (const n of Object.keys(solar.icons)) if (STYLE_RE.test(n)) bases.add(n.replace(STYLE_RE, ''));

const flat = (d: Drawing): Drawing => d.map((n) => ({ ...n, secondary: false }));
const get = (base: string, style: Style): Drawing | null => {
  const icon = solar.icons[`${base}-${style}`];
  return icon ? nodes(icon.body) : null;
};

const aliasesOf = new Map<string, string[]>();
for (const [alias, target] of Object.entries(ALIASES)) {
  aliasesOf.set(target, [...(aliasesOf.get(target) ?? []), alias]);
}

const words = (n: string): string[] => n.split('-').filter((w) => !/^\d+$/.test(w));

const picked: Picked[] = [];
let skipped = 0;
for (const base of [...bases].toSorted()) {
  const line = get(base, 'linear');
  const bold = get(base, 'bold');
  const boldDuo = get(base, 'bold-duotone');
  const solid = bold ?? (boldDuo ? flat(boldDuo) : null);
  if (!line || !solid) {
    skipped++;
    continue;
  }
  const duo = get(base, 'line-duotone') ?? line;
  const aliases = aliasesOf.get(base) ?? [];
  const tagSet = new Set<string>([...words(base), ...aliases.flatMap(words)]);
  for (const w of Array.from(tagSet)) for (const syn of SYNONYMS[w] ?? []) tagSet.add(syn);
  picked.push({
    name: base,
    component: `Icon${pascal(base)}`,
    category: categoryOf.get(base) ?? '',
    tags: [...tagSet].filter((t) => t !== base),
    aliases,
    line: flat(line),
    solid: flat(solid),
    duo,
    duoSolid: boldDuo ?? solid,
    original: false,
  });
}

for (const o of ORIGINALS) {
  if (bases.has(o.name)) throw new Error(`hanji original ${o.name} collides with a Solar icon`);
  const shape = (d: Drawing): Drawing =>
    d.map((n) => ({
      ...n,
      d: hanjiPath(n.d, {
        fillet: n.kind === 's' ? FILLET_LINE : FILLET_FILL,
        precision: PRECISION,
      }),
    }));
  const aliases = aliasesOf.get(o.name) ?? [];
  picked.push({
    name: o.name,
    component: `Icon${pascal(o.name)}`,
    category: o.category,
    tags: [...new Set([...words(o.name), ...o.tags, ...aliases])],
    aliases,
    line: shape(o.line),
    solid: shape(o.solid),
    duo: shape(o.duo ?? o.line),
    duoSolid: shape(o.duoSolid ?? o.solid),
    original: true,
  });
}
picked.sort((a, b) => a.name.localeCompare(b.name));

for (const [alias, target] of Object.entries(ALIASES)) {
  if (!picked.some((p) => p.name === target)) throw new Error(`Alias ${alias} → missing ${target}`);
  if (picked.some((p) => p.name === alias)) throw new Error(`Alias ${alias} shadows an icon`);
}
const seen = new Map<string, string>();
for (const p of picked) {
  const prev = seen.get(p.component);
  if (prev) throw new Error(`${p.component} would name both ${prev} and ${p.name}`);
  seen.set(p.component, p.name);
}

// ---------- emit ----------

const q = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const code = (n: Node): string => `${n.secondary ? '~' : ''}${n.kind}${n.width ?? ''}`;
const same = (a: Drawing, b: Drawing): boolean =>
  a.length === b.length && a.every((n, i) => n.kind === b[i]?.kind && n.d === b[i]?.d);
const drawing = (d: Drawing): string =>
  `[${d.map((n) => `[${q(code(n))}, ${q(n.d)}]`).join(', ')}]`;
/** A two-ink drawing that only re-marks an existing one is stored as the marked indices. */
const twoInk = (duo: Drawing, base: Drawing): string =>
  same(duo, base)
    ? `[${duo.flatMap((n, i) => (n.secondary ? [i] : [])).join(', ')}]`
    : drawing(duo);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of picked) {
  const credit = p.original
    ? 'Drawn for hanji.'
    : 'From Solar by 480 Design (CC BY 4.0), reshaped by hanji.';
  writeFileSync(
    join(out, `${p.name}.ts`),
    `import { icon } from '../create-icon.tsx';
import type { HanjiIcon } from '../create-icon.tsx';

/** \`${p.name}\`${p.aliases.length ? ` (also ${p.aliases.join(', ')})` : ''}. ${credit} */
export const ${p.component}: HanjiIcon = /* @__PURE__ */ icon(${q(p.name)}, {
  line: ${drawing(p.line)},
  solid: ${drawing(p.solid)},
  duo: ${twoInk(p.duo, p.line)},
  duoSolid: ${twoInk(p.duoSolid, p.solid)},
});
`,
  );
}

const header = `// Generated by scripts/generate.ts from @iconify-json/solar ${version} — do not edit.\n`;
const aliasEntries = Object.entries(ALIASES).toSorted(([a], [b]) => a.localeCompare(b));
const byName = new Map(picked.map((p) => [p.name, p]));

writeFileSync(
  join(src, 'index.ts'),
  `${header}export { icon, toSvg } from './create-icon.tsx';
export type { Drawing, HanjiIcon, IconProps, IconVariant } from './create-icon.tsx';
export { iconNames } from './names.ts';
export type { IconName } from './names.ts';
${picked.map((p) => `export { ${p.component} } from './icons/${p.name}.ts';`).join('\n')}
// hanji aliases: familiar names for the same drawings
${aliasEntries
  .map(([alias, target]) => {
    const t = byName.get(target) as Picked;
    return `export { ${t.component} as Icon${pascal(alias)} } from './icons/${target}.ts';`;
  })
  .join('\n')}
`,
);

writeFileSync(
  join(src, 'names.ts'),
  `${header}/** Every icon name and alias, kebab-case. */
export const iconNames = [
${[...picked.map((p) => p.name), ...aliasEntries.map(([a]) => a)]
  .toSorted()
  .map((n) => `  ${q(n)},`)
  .join('\n')}
] as const;
export type IconName = (typeof iconNames)[number];
`,
);

writeFileSync(
  join(src, 'loaders.ts'),
  `${header}import type { HanjiIcon } from './create-icon.tsx';
import type { IconName } from './names.ts';

/** One dynamic import per icon, so a name chosen at runtime loads only that icon. */
export const loaders: Readonly<Record<IconName, () => Promise<HanjiIcon>>> = {
${[
  ...picked.map((p) => [p.name, p] as const),
  ...aliasEntries.map(([a, t]) => [a, byName.get(t) as Picked] as const),
]
  .toSorted(([a], [b]) => a.localeCompare(b))
  .map(([n, p]) => `  ${q(n)}: () => import('./icons/${p.name}.ts').then((m) => m.${p.component}),`)
  .join('\n')}
};
`,
);

writeFileSync(
  join(src, 'catalog.ts'),
  `${header}export interface CatalogEntry {
  /** kebab-case name */
  readonly name: string;
  /** The React component to import from '@hanji/icons'. */
  readonly component: string;
  readonly category: string;
  /** Search words: the name's words, aliases and common synonyms. */
  readonly tags: readonly string[];
  /** Familiar names exported for the same icon, e.g. chevron-down for alt-arrow-down. */
  readonly aliases: readonly string[];
  /** Drawn for hanji rather than reshaped from Solar. */
  readonly original: boolean;
}

/** Every icon with its category and search words — for pickers, search and agents. */
export const catalog: readonly CatalogEntry[] = [
${picked
  .map(
    (p) =>
      `  { name: ${q(p.name)}, component: ${q(p.component)}, category: ${q(p.category)}, tags: [${p.tags.map(q).join(', ')}], aliases: [${p.aliases.map(q).join(', ')}], original: ${p.original} },`,
  )
  .join('\n')}
];

export const source: string = ${q(`Solar by 480 Design (CC BY 4.0), @iconify-json/solar ${version}`)};
`,
);

const originals = picked.filter((p) => p.original).length;
console.log(
  `@hanji/icons: ${picked.length} icons (${picked.length - originals} reshaped from Solar ${version}, ${originals} drawn for hanji), ${aliasEntries.length} aliases; skipped ${skipped} that need masks`,
);

execFileSync(join(pkg, '../../node_modules/.bin/oxfmt'), [src], { stdio: 'inherit' });
