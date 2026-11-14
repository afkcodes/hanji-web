/**
 * Generates @hanji/icons from Tabler Icons (MIT): one module per icon, the barrel, the lazy
 * loaders and the catalog. Deterministic — run again after bumping @tabler/icons.
 *
 * Selection:
 *   - pairs: every non-brand icon Tabler draws as both outline and filled → solid is the fill;
 *   - line icons: open-stroke glyphs (arrows, chevrons, check, x…) → solid is the bold line;
 *   - essentials: everyday closed glyphs Tabler doesn't fill (wifi, share…) → bold line too.
 * Skipped: brand logos (trademarks are not ours to redraw), letters and numbers, and `-off`
 * variants of shapes without a fill. Every path gets hanji's continuous corners (corners.ts).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hanjiPath, parse } from './corners.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, '..');
const tabler = join(pkg, 'node_modules/@tabler/icons');
const src = join(pkg, 'src');
const out = join(src, 'icons');

type Node = [string, { d: string; fill?: string }];
interface Meta {
  name: string;
  category?: string;
  tags?: (string | number)[];
}
const meta = JSON.parse(readFileSync(join(tabler, 'icons.json'), 'utf8')) as Record<string, Meta>;
const outlines = JSON.parse(
  readFileSync(join(tabler, 'tabler-nodes-outline.json'), 'utf8'),
) as Record<string, Node[]>;
const filled = JSON.parse(readFileSync(join(tabler, 'tabler-nodes-filled.json'), 'utf8')) as Record<
  string,
  Node[]
>;
const version = (
  JSON.parse(readFileSync(join(tabler, 'package.json'), 'utf8')) as { version: string }
).version;

/** Everyday glyphs kept even though Tabler draws no fill for them; their solid is the bold line. */
const ESSENTIALS = [
  'bell-off',
  'camera-off',
  'cloud-off',
  'eye-off',
  'filter-off',
  'link-off',
  'lock-off',
  'microphone-off',
  'notification-off',
  'phone-off',
  'video-off',
  'volume-off',
  'wifi-off',
  'chart-bar',
  'circle-minus',
  'command',
  'dots',
  'dots-vertical',
  'git-branch',
  'grip-horizontal',
  'grip-vertical',
  'inbox',
  'music',
  'question-mark',
  'robot',
  'search',
  'share',
  'tool',
  'volume',
  'wand',
  'wifi',
];

const missing = ESSENTIALS.filter((n) => !outlines[n]);
if (missing.length)
  throw new Error(`Essentials not in @tabler/icons ${version}: ${missing.join(', ')}`);

const isBrand = (n: string): boolean => n.startsWith('brand-') || meta[n]?.category === 'Brand';

/** True when any subpath of the outline encloses an area (it ends where it began, or closes). */
function encloses(nodes: Node[]): boolean {
  for (const [, { d }] of nodes) {
    let start: readonly [number, number] | null = null;
    let end: readonly [number, number] | null = null;
    const check = (): boolean =>
      start !== null &&
      end !== null &&
      Math.abs(start[0] - end[0]) < 0.02 &&
      Math.abs(start[1] - end[1]) < 0.02;
    for (const g of parse(d)) {
      if (g.t === 'Z') return true;
      if (g.t === 'M') {
        if (check()) return true;
        start = g.p;
        end = null;
      } else end = g.p;
    }
    if (check()) return true;
  }
  return false;
}

interface Picked {
  name: string;
  component: string;
  outline: string;
  solid: string[] | null;
  category: string;
  tags: string[];
}

const pascal = (n: string): string =>
  n.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

const picked: Picked[] = [];
for (const name of Object.keys(outlines).toSorted()) {
  if (isBrand(name)) continue;
  const category = meta[name]?.category ?? '';
  const nodes = outlines[name] as Node[];
  const fill = filled[name];
  let kind: 'pair' | 'line' | 'essential' | null = null;
  if (fill) kind = 'pair';
  else if (ESSENTIALS.includes(name)) kind = 'essential';
  else if (
    !name.endsWith('-off') &&
    category !== 'Letters' &&
    category !== 'Numbers' &&
    !encloses(nodes)
  )
    kind = 'line';
  if (!kind) continue;
  picked.push({
    name,
    component: `Icon${pascal(name)}`,
    outline: nodes.map(([, a]) => hanjiPath(a.d)).join(''),
    solid: fill ? fill.map(([, a]) => hanjiPath(a.d)) : null,
    category,
    tags: (meta[name]?.tags ?? []).map(String),
  });
}

const seen = new Map<string, string>();
for (const p of picked) {
  const prev = seen.get(p.component);
  if (prev) throw new Error(`${p.component} would name both ${prev} and ${p.name}`);
  seen.set(p.component, p.name);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const q = (s: string): string => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
for (const p of picked) {
  const solid = p.solid ? `[${p.solid.map(q).join(', ')}]` : 'null';
  const kind = p.solid ? 'outline, solid (filled) and wash' : 'outline, solid (bold line) and wash';
  writeFileSync(
    join(out, `${p.name}.ts`),
    `import { icon } from '../create-icon.tsx';
import type { HanjiIcon } from '../create-icon.tsx';

/** \`${p.name}\` — ${kind}.${p.tags.length ? ` Also: ${p.tags.slice(0, 8).join(', ')}.` : ''} */
export const ${p.component}: HanjiIcon = /* @__PURE__ */ icon(
  ${q(p.name)},
  ${q(p.outline)},
  ${solid},
);
`,
  );
}

const header = `// Generated by scripts/generate.ts from @tabler/icons ${version} — do not edit.\n`;

writeFileSync(
  join(src, 'index.ts'),
  `${header}export { icon, toSvg } from './create-icon.tsx';
export type { HanjiIcon, IconProps, IconVariant } from './create-icon.tsx';
export { iconNames } from './names.ts';
export type { IconName } from './names.ts';
${picked.map((p) => `export { ${p.component} } from './icons/${p.name}.ts';`).join('\n')}
`,
);

writeFileSync(
  join(src, 'names.ts'),
  `${header}/** Every icon name, kebab-case. */
export const iconNames = [
${picked.map((p) => `  ${q(p.name)},`).join('\n')}
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
${picked.map((p) => `  ${q(p.name)}: () => import('./icons/${p.name}.ts').then((m) => m.${p.component}),`).join('\n')}
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
  /** Search words from Tabler's metadata. */
  readonly tags: readonly string[];
  /** True when the solid variant is a filled drawing; false when it is the bold line. */
  readonly filled: boolean;
}

/** Every icon with its category and search tags — for pickers, search and agents. */
export const catalog: readonly CatalogEntry[] = [
${picked
  .map(
    (p) =>
      `  { name: ${q(p.name)}, component: ${q(p.component)}, category: ${q(p.category)}, tags: [${p.tags.map(q).join(', ')}], filled: ${p.solid ? 'true' : 'false'} },`,
  )
  .join('\n')}
];

export const tablerVersion = ${q(version)};
`,
);

const pairs = picked.filter((p) => p.solid).length;
console.log(
  `@hanji/icons: ${picked.length} icons (${pairs} with filled solids, ${picked.length - pairs} with bold-line solids) from @tabler/icons ${version}`,
);

// keep generated code in the repo's format
execFileSync(join(pkg, '../../node_modules/.bin/oxfmt'), [src], { stdio: 'inherit' });
