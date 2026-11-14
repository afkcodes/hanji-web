/**
 * Build the agent-readable layer from the typed `*.meta.ts` files and the real examples:
 *
 *   dist/manifest.json      every component: parts, own props, data-attributes, CSS vars, examples (code), a11y, motion
 *   dist/docs/<slug>.md     one Markdown doc per component, including Base UI's API for the wrapped parts
 *   dist/llms.txt           llmstxt.org index        (also copied to the repo root)
 *   dist/llms-full.txt      every doc in one file     (also copied to the repo root)
 *   ../../registry/         shadcn-compatible source registry (registry.json + r/<slug>.json)
 *
 * Deterministic output (no timestamps), so it caches and diffs cleanly.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { ComponentMeta } from '../src/system/meta.ts';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(pkgDir, '..', '..');
const src = join(pkgDir, 'src');
const dist = join(pkgDir, 'dist');
const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')) as {
  name: string;
  version: string;
  description: string;
};
const require = createRequire(import.meta.url);
const baseDocs = join(
  dirname(require.resolve('@base-ui/react/package.json')),
  'docs',
  'react',
  'components',
);

mkdirSync(join(dist, 'docs'), { recursive: true });
// ship the theme contract next to the manifest so agents find everything in one package
const tokensDist = dirname(require.resolve('@hanji/tokens/tokens.json'));
for (const f of ['theme.schema.json', 'tokens.json'])
  writeFileSync(join(dist, f), readFileSync(join(tokensDist, f)));

// ---------- load metas ----------
interface Loaded {
  meta: ComponentMeta;
  dir: string;
  examples: { file: string; title: string; description: string; code: string }[];
}
const dirs = readdirSync(join(src, 'components'), { withFileTypes: true })
  .filter(
    (d) => d.isDirectory() && existsSync(join(src, 'components', d.name, `${d.name}.meta.ts`)),
  )
  .map((d) => d.name);
const mods = await Promise.all(
  dirs.map(async (name) => ({
    name,
    mod: (await import(pathToFileURL(join(src, 'components', name, `${name}.meta.ts`)).href)) as {
      meta?: ComponentMeta;
    },
  })),
);
const loaded: Loaded[] = mods.flatMap(({ name, mod }) => {
  if (!mod.meta) return [];
  const dir = join(src, 'components', name);
  const examples = mod.meta.examples.flatMap((ex) => {
    const f = join(dir, 'examples', `${ex.file}.tsx`);
    return existsSync(f) ? [{ ...ex, code: readFileSync(f, 'utf8').trim() }] : [];
  });
  return [{ meta: mod.meta, dir, examples }];
});

const order = ['foundation', 'atoms', 'controls', 'surfaces', 'navigation', 'data', 'ai'];
loaded.sort(
  (a, b) =>
    order.indexOf(a.meta.category) - order.indexOf(b.meta.category) ||
    a.meta.name.localeCompare(b.meta.name),
);

// ---------- Base UI API extraction ----------
function baseApi(name: string | undefined): string {
  if (!name) return '';
  const f = join(baseDocs, `${name}.md`);
  if (!existsSync(f)) return '';
  const md = readFileSync(f, 'utf8');
  const start = md.indexOf('## API reference');
  if (start < 0) return '';
  const rest = md.slice(start + 1);
  const next = rest.search(/\n## (?!API reference)/);
  return (next < 0 ? rest : rest.slice(0, next))
    .replace(/^# API reference/, '')
    .replace(/&#xA;/g, ' ')
    .trim();
}

// ---------- per-component Markdown ----------
const table = (head: string[], rows: string[][]): string =>
  `| ${head.join(' | ')} |\n| ${head.map(() => '---').join(' | ')} |\n${rows.map((r) => `| ${r.map((c) => c.replace(/\|/g, '\\|')).join(' | ')} |`).join('\n')}`;

function doc(l: Loaded): string {
  const m = l.meta;
  const multi = m.parts.length > 1;
  const out: string[] = [];
  out.push(
    `# ${m.name}`,
    '',
    `> ${m.description}`,
    '',
    `Category: ${m.category} · Status: ${m.status}${m.baseUi ? ` · Built on Base UI \`${m.baseUi}\`` : ''}`,
    '',
  );
  out.push(
    '```tsx',
    m.import,
    "import '@hanji/react/styles.css'; // once, at the app root",
    '```',
    '',
  );
  out.push(
    '## When to use',
    ...m.whenToUse.map((w) => `- ${w}`),
    '',
    '## When not to use',
    ...m.whenNotToUse.map((w) => `- ${w}`),
    '',
  );
  out.push('## Anatomy', '');
  for (const p of m.parts) {
    const title = multi ? `${m.name}.${p.name}` : p.name;
    out.push(
      `### ${title}`,
      '',
      `${p.description} Renders \`<${p.element}>\`.${p.base ? ` Wraps Base UI \`${p.base}\` and accepts all its props.` : ''}`,
      '',
    );
    const facts = [`slot: \`${p.slot}\``];
    if (p.className) facts.push(`class: \`.${p.className}\``);
    out.push(facts.join(' · '), '');
    if (p.props && Object.keys(p.props).length)
      out.push(
        table(
          ['Prop', 'Type', 'Default', 'Description'],
          Object.entries(p.props).map(([k, d]) => [
            `\`${k}\``,
            `\`${d.type}\``,
            d.default ? `\`${d.default}\`` : '—',
            d.description,
          ]),
        ),
        '',
      );
    if (p.dataAttributes)
      out.push(
        table(
          ['Data attribute', 'Meaning'],
          Object.entries(p.dataAttributes).map(([k, d]) => [`\`${k}\``, d]),
        ),
        '',
      );
    if (p.cssVars)
      out.push(
        table(
          ['CSS variable', 'Meaning'],
          Object.entries(p.cssVars).map(([k, d]) => [`\`${k}\``, d]),
        ),
        '',
      );
  }
  out.push('## Examples', '');
  for (const ex of l.examples)
    out.push(`### ${ex.title}`, '', ex.description, '', '```tsx', ex.code, '```', '');
  out.push('## Accessibility', ...m.accessibility.map((a) => `- ${a}`), '');
  if (m.motion) out.push('## Motion', '', m.motion, '');
  out.push(
    '## Customise',
    '',
    '- Theme: `<Theme paper accent density motion>` or `createTheme()` (see theme.schema.json).',
    `- Slot classes / defaults: \`<HanjiProvider classNames={{ '${m.parts[0]?.slot ?? m.name}': '…' }} defaults={{ '${m.parts[0]?.slot ?? m.name}': { … } }}>\`.`,
    '- Per-part: `className` (string or function of state), `style`, `render` to swap the element.',
    '- Unstyled: `<HanjiProvider unstyled>` keeps behaviour, ARIA and data-attributes, drops hanji classes.',
    '',
  );
  if (m.tokens.length)
    out.push(`Tokens read: ${m.tokens.map((t) => `\`--hj-${t}\``).join(', ')}`, '');
  if (m.related.length) out.push(`Related: ${m.related.join(', ')}`, '');
  const api = baseApi(m.baseUi);
  if (api) out.push('## Base UI API (inherited)', '', api.replace(/^### /gm, `### ${m.name}.`), '');
  return `${out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
}

const docs = loaded.map((l) => ({ slug: l.meta.slug, md: doc(l) }));
for (const d of docs) writeFileSync(join(dist, 'docs', `${d.slug}.md`), d.md);

// ---------- manifest ----------
const manifest = {
  $schema: 'https://hanji.dev/schema/manifest.v1.json',
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  setup: {
    install: 'pnpm add @hanji/react @hanji/tokens @base-ui/react react react-dom',
    styles: "import '@hanji/react/styles.css';",
    theme:
      'import { Theme } from \'@hanji/react\'; <Theme paper="paper" accent="scarlet">…</Theme>',
    themeSchema: '@hanji/tokens/theme.schema.json',
    fonts: 'Load Figtree (400–700) and DM Mono (400–500), or set fonts in createTheme().',
  },
  conventions: {
    compound:
      'Multi-part components are namespaces: <Dialog.Root>, <Dialog.Trigger>, <Dialog.Content>… Single-part components are plain: <Button>.',
    composition:
      'Every part accepts Base UI\'s `render` prop: <Dialog.Trigger render={<Button variant="secondary" />}>.',
    styling:
      'Classes hj-<slug>-<part>; variants as data-attributes; state from Base UI data-attributes; all in @layer hj.* so app CSS wins.',
    customisation: [
      'tokens (Theme / createTheme)',
      'variant props',
      'per-part className/style/render',
      'HanjiProvider classNames/defaults/unstyled/icons/strings',
      '--hj-<component>-* CSS variables on any ancestor',
    ],
    motion:
      'Springs compiled to CSS linear(); exits faster than entrances; reduced motion handled by tokens.',
  },
  components: loaded.map((l) => ({
    ...l.meta,
    examples: l.examples,
    doc: `docs/${l.meta.slug}.md`,
  })),
};
writeFileSync(join(dist, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

// ---------- llms.txt ----------
const byCat = order
  .map((c) => ({ c, items: loaded.filter((l) => l.meta.category === c) }))
  .filter((g) => g.items.length);
const sections: string[] = [];
for (const g of byCat) {
  sections.push(`## ${g.c[0]?.toUpperCase()}${g.c.slice(1)}`, '');
  for (const l of g.items)
    sections.push(`- [${l.meta.name}](./docs/${l.meta.slug}.md): ${l.meta.description}`);
  sections.push('');
}
const llms = [
  '# hanji (@hanji/react)',
  '',
  `> ${pkg.description}`,
  '',
  'Compound React components on Base UI. Plain CSS in cascade layers, themed by --hj-* tokens (three papers × twelve accents, density, motion policy). Install `@hanji/react @hanji/tokens @base-ui/react`, import `@hanji/react/styles.css` once, wrap the app in `<Theme>`. Every part takes className (string or fn of state), style, and render. Prefer the documented parts; do not restyle internals — use variants, tokens, slot classes or `--hj-<component>-*` variables.',
  '',
  '## Setup',
  '',
  '- [Theme schema](./theme.schema.json): JSON Schema for createTheme() — paper, accent, density, motion, radius, fonts, colors, springs.',
  '- [Manifest](./manifest.json): every component as structured JSON.',
  '',
  '## Icons (@hanji/icons)',
  '',
  '- 1,500+ icons, each in `outline` (1.5 line), `solid` and `wash` (line over a 16% fill). Reshaped from Solar by 480 Design (CC BY 4.0): softened joins, rounder corners, hanji names and aliases (chevron-down, trash, more, x, plus…).',
  '- Motion: `active={liked}` floods a toggle with ink on a spring (like, bookmark, star); `animate="draw" | "pop" | "ring" | "shake" | "spin"` plays on mount and replays when `trigger` changes. Uses hanji\'s spring tokens; reduced motion becomes fades.',
  '- `import { IconTrashBinTrash } from \'@hanji/icons\'` (or its alias `IconTrash`) → `<IconTrash variant="solid" size={20} label="Delete" />`. Size defaults to 1em; colour is currentColor; `--hj-icon-stroke` retunes every line.',
  "- Names chosen at runtime: `import { DynamicIcon } from '@hanji/icons/dynamic'` loads only that icon (names and aliases). Use hanji icons inside components with `<HanjiProvider icons={iconAdapter('outline')}>` from `@hanji/icons/adapter`.",
  '- Find one: the MCP tools `search_icons` and `get_icon`, or `@hanji/icons/icons.json` (names, aliases, tags, categories, SVG for every style).',
  '',
  ...sections,
].join('\n');
writeFileSync(join(dist, 'llms.txt'), `${llms.trim()}\n`);
writeFileSync(
  join(dist, 'llms-full.txt'),
  `${llms.trim()}\n\n---\n\n${docs.map((d) => d.md).join('\n---\n\n')}`,
);
writeFileSync(
  join(repo, 'llms.txt'),
  `${llms.replace(/\.\/docs\//g, './packages/react/dist/docs/').trim()}\n`,
);

// ---------- shadcn-compatible registry ----------
const reg = join(repo, 'registry');
mkdirSync(join(reg, 'r'), { recursive: true });
const file = (
  abs: string,
  target: string,
  type = 'registry:ui',
): { path: string; type: string; target: string; content: string } => ({
  path: relative(repo, abs),
  type,
  target,
  content: readFileSync(abs, 'utf8'),
});
const systemFiles = readdirSync(join(src, 'system'))
  .filter((f) => /\.(tsx?|css)$/.test(f) && !f.endsWith('.test.tsx'))
  .toSorted()
  .map((f) => file(join(src, 'system', f), `hanji/system/${f}`, 'registry:lib'));
const styleFiles = ['base.css', 'utilities.css'].map((f) =>
  file(join(src, 'styles', f), `hanji/styles/${f}`, 'registry:style'),
);
const items: {
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: ReturnType<typeof file>[];
  categories?: string[];
}[] = [
  {
    name: 'hanji-system',
    type: 'registry:lib',
    title: 'hanji system',
    description:
      'Provider, Theme, slot helpers, part factories, icon adapter, springs and base styles every hanji component uses.',
    dependencies: ['@base-ui/react', '@hanji/tokens'],
    files: [...systemFiles, ...styleFiles],
  },
];
for (const l of loaded) {
  const files = readdirSync(l.dir)
    .filter((f) => /\.(tsx?|css)$/.test(f) && !/\.(test|meta)\./.test(f))
    .toSorted()
    .map((f) => file(join(l.dir, f), `hanji/components/${l.meta.slug}/${f}`));
  // sibling hanji components this one imports
  const siblings = new Set<string>();
  for (const f of files)
    for (const m of f.content.matchAll(/from '\.\.\/([a-z-]+)\//g))
      if (m[1] && m[1] !== l.meta.slug) siblings.add(m[1]);
  items.push({
    name: l.meta.slug,
    type: 'registry:ui',
    title: l.meta.name,
    description: l.meta.description,
    dependencies: ['@base-ui/react', '@hanji/tokens'],
    registryDependencies: ['hanji-system', ...[...siblings].toSorted()],
    categories: [l.meta.category],
    files,
  });
}
writeFileSync(
  join(reg, 'registry.json'),
  `${JSON.stringify({ $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'hanji', homepage: 'https://github.com/afkcodes/hanji', items: items.map(({ files, ...rest }) => ({ ...rest, files: files.map(({ content: _c, ...f }) => f) })) }, null, 2)}\n`,
);
for (const it of items)
  writeFileSync(
    join(reg, 'r', `${it.name}.json`),
    `${JSON.stringify({ $schema: 'https://ui.shadcn.com/schema/registry-item.json', ...it }, null, 2)}\n`,
  );

console.log(
  `ai: ${loaded.length} components → manifest.json, ${docs.length} docs, llms.txt (${(llms.length / 1024).toFixed(1)} KB), llms-full.txt, registry (${items.length} items)`,
);
