import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/** One component as the manifest describes it (a structural subset of ComponentMeta). */
export interface ManifestComponent {
  name: string;
  slug: string;
  category: string;
  status: string;
  description: string;
  whenToUse: string[];
  whenNotToUse: string[];
  import: string;
  parts: {
    name: string;
    element: string;
    description: string;
    base?: string;
    slot: string;
    className: string;
    props?: Record<string, { type: string; default?: string; description: string }>;
  }[];
  examples: { file: string; title: string; description: string; code: string }[];
  accessibility: string[];
  motion?: string;
  tokens: string[];
  related: string[];
  doc: string;
}

export interface Manifest {
  name: string;
  version: string;
  description: string;
  setup: Record<string, string>;
  conventions: Record<string, unknown>;
  components: ManifestComponent[];
}

export interface HanjiData {
  manifest: Manifest;
  llms: string;
  tokens: Record<string, unknown>;
  schema: Record<string, unknown>;
  doc(slug: string): string | undefined;
}

/**
 * Load the generated artefacts from the installed packages (or a directory, for tests).
 * Throws a clear message when @hanji/react hasn't been built.
 */
export function loadData(reactDist?: string): HanjiData {
  const require = createRequire(import.meta.url);
  const dist = reactDist ?? dirname(require.resolve('@hanji/react/manifest.json'));
  const manifestFile = join(dist, 'manifest.json');
  if (!existsSync(manifestFile)) {
    throw new Error(
      `hanji manifest not found at ${manifestFile}. Build @hanji/react first (pnpm build).`,
    );
  }
  const read = (f: string): string => readFileSync(join(dist, f), 'utf8');
  return {
    manifest: JSON.parse(read('manifest.json')) as Manifest,
    llms: read('llms.txt'),
    tokens: JSON.parse(read('tokens.json')) as Record<string, unknown>,
    schema: JSON.parse(read('theme.schema.json')) as Record<string, unknown>,
    doc(slug: string): string | undefined {
      const f = join(dist, 'docs', `${slug}.md`);
      return existsSync(f) ? readFileSync(f, 'utf8') : undefined;
    },
  };
}

/** Resolve a component by slug, name or Base UI-style dotted part ("Dialog.Popup"). */
export function findComponent(manifest: Manifest, query: string): ManifestComponent | undefined {
  const q = query.trim().toLowerCase().split('.')[0] ?? '';
  const kebab = q.replace(/\s+/g, '-');
  return manifest.components.find(
    (c) =>
      c.slug === kebab ||
      c.name.toLowerCase() === q ||
      c.slug.replace(/-/g, '') === q.replace(/[-\s]/g, ''),
  );
}

/** Rank components for a free-text query: name ≫ description ≫ when-to-use ≫ parts. */
export function searchComponents(
  manifest: Manifest,
  query: string,
  limit = 8,
): { component: ManifestComponent; score: number }[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
  if (!terms.length) return [];
  return manifest.components
    .map((c) => {
      const hay = {
        name: `${c.name} ${c.slug}`.toLowerCase(),
        desc: c.description.toLowerCase(),
        use: [...c.whenToUse, ...c.related].join(' ').toLowerCase(),
        parts: c.parts
          .map((p) => `${p.name} ${p.description}`)
          .join(' ')
          .toLowerCase(),
      };
      const score = terms.reduce(
        (s, t) =>
          s +
          (hay.name.includes(t) ? 8 : 0) +
          (hay.desc.includes(t) ? 3 : 0) +
          (hay.use.includes(t) ? 2 : 0) +
          (hay.parts.includes(t) ? 1 : 0),
        0,
      );
      return { component: c, score };
    })
    .filter((r) => r.score > 0)
    .toSorted((a, b) => b.score - a.score)
    .slice(0, limit);
}
