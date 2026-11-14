/**
 * Bundle the stylesheet with Lightning CSS:
 *   dist/styles.css        tokens + base + every component + utilities (one import)
 *   dist/css/tokens.css     tokens only
 *   dist/css/base.css       base layer
 *   dist/css/<slug>.css     one component, for apps that import per component
 * Every component file is already inside `@layer hj.components`; the layer order is declared
 * once at the top of tokens.css, so your unlayered CSS always wins.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { transform } from 'lightningcss';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(pkg, 'src');
const out = join(pkg, 'dist', 'css');
mkdirSync(out, { recursive: true });

const require = createRequire(import.meta.url);
const tokensCss = readFileSync(require.resolve('@hanji/tokens/tokens.css'), 'utf8');

// Chrome 123 / Safari 17.5 / Firefox 120: light-dark(), color-mix(), linear(), :has(), @layer.
const targets = { chrome: 123 << 16, safari: (17 << 16) | (5 << 8), firefox: 120 << 16 };
const min = (filename: string, code: string): string =>
  transform({ filename, code: Buffer.from(code), minify: true, targets }).code.toString();

const base = readFileSync(join(src, 'styles', 'base.css'), 'utf8');
const utilities = readFileSync(join(src, 'styles', 'utilities.css'), 'utf8');
const comps = readdirSync(join(src, 'components'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => ({ slug: d.name, file: join(src, 'components', d.name, `${d.name}.css`) }))
  .filter((c) => existsSync(c.file))
  .toSorted((a, b) => a.slug.localeCompare(b.slug));

const layerOrder = '@layer hj.tokens, hj.base, hj.components, hj.utilities;\n';
writeFileSync(join(out, 'tokens.css'), min('tokens.css', tokensCss));
writeFileSync(join(out, 'base.css'), min('base.css', layerOrder + base));
let all = tokensCss + base;
for (const c of comps) {
  const css = readFileSync(c.file, 'utf8');
  writeFileSync(join(out, `${c.slug}.css`), min(`${c.slug}.css`, layerOrder + css));
  all += css;
}
all += utilities;
writeFileSync(join(out, 'utilities.css'), min('utilities.css', layerOrder + utilities));
const bundled = min('styles.css', all);
writeFileSync(join(pkg, 'dist', 'styles.css'), bundled);
console.log(`css: ${comps.length} components, styles.css ${(bundled.length / 1024).toFixed(1)} KB`);
