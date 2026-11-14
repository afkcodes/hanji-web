import type { ComponentMeta } from '../../../packages/react/src/system/meta.ts';

/** Auto-discovered: every component folder's meta and examples. No shared list to edit. */
const metas = import.meta.glob<{ meta: ComponentMeta }>(
  '../../../packages/react/src/components/*/*.meta.ts',
  {
    eager: true,
  },
);
const examples = import.meta.glob<{ Example: () => React.JSX.Element }>(
  '../../../packages/react/src/components/*/examples/*.tsx',
  { eager: true },
);
const sources = import.meta.glob<string>(
  '../../../packages/react/src/components/*/examples/*.tsx',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
);

export interface Entry {
  meta: ComponentMeta;
  examples: {
    file: string;
    title: string;
    description: string;
    Example: () => React.JSX.Element;
    source: string;
  }[];
}

const order = ['foundation', 'atoms', 'controls', 'surfaces', 'navigation', 'data', 'ai'] as const;

export const entries: Entry[] = Object.entries(metas)
  .map(([path, mod]) => {
    const dir = path.slice(0, path.lastIndexOf('/'));
    return {
      meta: mod.meta,
      examples: mod.meta.examples.flatMap((ex) => {
        const key = `${dir}/examples/${ex.file}.tsx`;
        const m = examples[key];
        return m ? [{ ...ex, Example: m.Example, source: sources[key] ?? '' }] : [];
      }),
    };
  })
  .toSorted(
    (a, b) =>
      order.indexOf(a.meta.category) - order.indexOf(b.meta.category) ||
      a.meta.name.localeCompare(b.meta.name),
  );

export const categories: { id: (typeof order)[number]; items: Entry[] }[] = order
  .map((id) => ({ id, items: entries.filter((e) => e.meta.category === id) }))
  .filter((c) => c.items.length > 0);
