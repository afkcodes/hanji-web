/**
 * Plain CSS scales only with rules. This enforces them, and fails the build on any breach:
 *  1. every component stylesheet is wrapped in `@layer hj.components`;
 *  2. every class it defines is prefixed `hj-<slug>` (its own namespace);
 *  3. no class is defined by two components;
 *  4. no raw hex colours outside the tokens package (use --hj-* tokens).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const comps = join(root, 'packages', 'react', 'src', 'components');
const errors: string[] = [];
const owner = new Map<string, string>();

/** Classes shared on purpose: hanji's system classes, usable inside any component's CSS. */
const SHARED = new Set(['hj-icon', 'hj-theme', 'hj-sr-only']);

for (const d of readdirSync(comps, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const slug = d.name;
  const file = join(comps, slug, `${slug}.css`);
  if (!existsSync(file)) continue;
  const raw = readFileSync(file, 'utf8');
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  const rel = file.replace(`${root}/`, '');
  if (!/^\s*@layer\s+hj\.components\s*\{/.test(css))
    errors.push(`${rel}: must start with @layer hj.components { … }`);
  // class selectors (skip things inside url(), and numbers like .5)
  const selectors = (css.replace(/\{[^{}]*\}/g, '{}').match(/[^{}]+(?=\{)/g) ?? []).filter(
    (s) => !s.trim().startsWith('@'),
  );
  for (const sel of selectors) {
    for (const m of sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
      const cls = m[1] ?? '';
      if (SHARED.has(cls)) continue;
      if (!cls.startsWith(`hj-${slug}`)) {
        errors.push(`${rel}: .${cls} is outside this component's namespace (hj-${slug}…)`);
        continue;
      }
      const prev = owner.get(cls);
      if (prev && prev !== slug) errors.push(`${rel}: .${cls} is also defined by ${prev}`);
      owner.set(cls, slug);
    }
  }
  const hex = css.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hex) errors.push(`${rel}: raw colour ${[...new Set(hex)].join(', ')} — use --hj-* tokens`);
}

if (errors.length) {
  console.error(
    `lint:css — ${errors.length} problem(s)\n${errors.map((e) => `  ✗ ${e}`).join('\n')}`,
  );
  process.exit(1);
}
console.log(`lint:css — ${owner.size} classes, all namespaced, no collisions`);
