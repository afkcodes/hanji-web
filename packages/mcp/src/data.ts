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

/** One icon from @hanji/icons/icons.json. */
export interface IconEntry {
  name: string;
  component: string;
  category: string;
  tags: string[];
  /** Familiar names exported for the same drawing (chevron-down → alt-arrow-down). */
  aliases: string[];
  /** Drawn for hanji rather than reshaped from Solar. */
  original: boolean;
  import: string;
  /** Ready SVG markup per style: outline, solid, wash, duotone, duotone-solid. */
  svg: Record<string, string>;
}

export interface HanjiData {
  manifest: Manifest;
  /** Empty when @hanji/icons isn't installed or built. */
  icons: IconEntry[];
  llms: string;
  tokens: Record<string, unknown>;
  schema: Record<string, unknown>;
  doc(slug: string): string | undefined;
}

/**
 * Load the generated artefacts from the installed packages (or a directory, for tests).
 * Throws a clear message when @hanji/react hasn't been built.
 */
export function loadData(reactDist?: string, iconsFile?: string): HanjiData {
  const require = createRequire(import.meta.url);
  let iconsPath = iconsFile;
  if (iconsPath === undefined) {
    try {
      iconsPath = require.resolve('@hanji/icons/icons.json');
    } catch {
      iconsPath = undefined;
    }
  }
  const icons =
    iconsPath && existsSync(iconsPath)
      ? (JSON.parse(readFileSync(iconsPath, 'utf8')) as { icons: IconEntry[] }).icons
      : [];
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
    icons,
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

/** Rank icons for a query: exact name or alias ≫ name words ≫ exact tag ≫ tag ≫ category. */
export function searchIcons(icons: IconEntry[], query: string, limit = 24): IconEntry[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (!terms.length) return [];
  const phrase = terms.join('-');
  return icons
    .map((icon) => {
      const parts = new Set([
        ...icon.name.split('-'),
        ...icon.aliases.flatMap((a) => a.split('-')),
      ]);
      let score = icon.name === phrase || icon.aliases.includes(phrase) ? 40 : 0;
      for (const t of terms) {
        if (parts.has(t)) score += 10;
        else if (icon.name.includes(t)) score += 5;
        if (icon.tags.includes(t)) score += 6;
        else if (icon.tags.some((g) => g.includes(t))) score += 2;
        if (icon.category.toLowerCase() === t) score += 2;
      }
      // prefer the plain glyph over its decorated variants (bell over bell-bing)
      return { icon, score: score - icon.name.split('-').length * 0.1 };
    })
    .filter((r) => r.score > 1)
    .toSorted((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.icon);
}
