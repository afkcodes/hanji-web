/**
 * After tsdown: dist/icons.json (catalog + drawings, for agents and tools) and raw SVG files
 * (dist/svg/{outline,solid,wash}/<name>.svg) for design tools and other frameworks.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const icons = (await import(join(dist, 'index.js'))) as Record<string, unknown> & {
  toSvg: (i: unknown, v?: string) => string;
};
const { catalog, tablerVersion } = (await import(join(dist, 'catalog.js'))) as {
  catalog: { name: string; component: string; category: string; tags: string[]; filled: boolean }[];
  tablerVersion: string;
};

for (const v of ['outline', 'solid', 'wash']) mkdirSync(join(dist, 'svg', v), { recursive: true });
const entries = catalog.map((c) => {
  const icon = icons[c.component] as { outline: string; solid: readonly string[] | null };
  for (const v of ['outline', 'solid', 'wash'] as const) {
    writeFileSync(join(dist, 'svg', v, `${c.name}.svg`), `${icons.toSvg(icon, v)}\n`);
  }
  return {
    name: c.name,
    component: c.component,
    category: c.category,
    tags: c.tags,
    filled: c.filled,
    import: `import { ${c.component} } from '@hanji/icons';`,
    outline: icon.outline,
    solid: icon.solid,
  };
});
writeFileSync(
  join(dist, 'icons.json'),
  JSON.stringify({
    name: '@hanji/icons',
    source: `@tabler/icons ${tablerVersion}`,
    count: entries.length,
    icons: entries,
  }),
);
console.log(`icons: ${entries.length} → dist/icons.json and ${entries.length * 3} SVG files`);
