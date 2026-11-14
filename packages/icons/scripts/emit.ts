/**
 * After tsdown: dist/icons.json (catalog + ready SVG for every style, for agents and tools) and
 * raw SVG files (dist/svg/<style>/<name>.svg) for design tools and other frameworks.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const icons = (await import(join(dist, 'index.js'))) as Record<string, unknown> & {
  toSvg: (i: unknown, v?: string) => string;
};
const { catalog, source } = (await import(join(dist, 'catalog.js'))) as {
  catalog: {
    name: string;
    component: string;
    category: string;
    tags: string[];
    aliases: string[];
    original: boolean;
  }[];
  source: string;
};

const variants = ['outline', 'solid', 'wash', 'duotone', 'duotone-solid'] as const;
for (const v of variants) mkdirSync(join(dist, 'svg', v), { recursive: true });
const entries = catalog.map((c) => {
  const icon = icons[c.component];
  const svg: Record<string, string> = {};
  for (const v of variants) {
    svg[v] = icons.toSvg(icon, v);
    writeFileSync(join(dist, 'svg', v, `${c.name}.svg`), `${svg[v]}\n`);
  }
  return {
    name: c.name,
    component: c.component,
    category: c.category,
    tags: c.tags,
    aliases: c.aliases,
    original: c.original,
    import: `import { ${c.component} } from '@hanji/icons';`,
    svg,
  };
});
writeFileSync(
  join(dist, 'icons.json'),
  JSON.stringify({ name: '@hanji/icons', source, count: entries.length, icons: entries }),
);
console.log(
  `icons: ${entries.length} → dist/icons.json and ${entries.length * variants.length} SVG files`,
);
