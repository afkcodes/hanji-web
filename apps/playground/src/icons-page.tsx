import * as icons from '@hanji/icons';
import type { HanjiIcon, IconVariant } from '@hanji/icons';
import { catalog } from '@hanji/icons/catalog';
import type { CatalogEntry } from '@hanji/icons/catalog';
import { Button, CodeBlock, Field, Icon, SegmentedControl, Select, Slider } from '@hanji/react';
import * as React from 'react';

const byName = new Map<string, HanjiIcon>(
  catalog.map((c) => [
    c.name,
    (icons as unknown as Record<string, HanjiIcon>)[c.component] as HanjiIcon,
  ]),
);
const categories = [...new Set(catalog.map((c) => c.category).filter(Boolean))].toSorted();
const categoryItems = [
  { value: 'all', label: 'All categories' },
  ...categories.map((c) => ({ value: c, label: c })),
];
const aliasCount = catalog.reduce((n, c) => n + c.aliases.length, 0);
const STYLES: readonly IconVariant[] = ['outline', 'solid', 'wash', 'duotone', 'duotone-solid'];
const styleLabel: Record<IconVariant, string> = {
  outline: 'Outline',
  solid: 'Solid',
  wash: 'Wash',
  duotone: 'Duotone',
  'duotone-solid': 'Duo solid',
};

function matches(c: CatalogEntry, terms: string[]): boolean {
  return terms.every(
    (t) =>
      c.name.includes(t) ||
      c.aliases.some((a) => a.includes(t)) ||
      c.tags.some((g) => g.includes(t)),
  );
}

function Detail({
  entry,
  variant,
}: {
  entry: CatalogEntry;
  variant: IconVariant;
}): React.JSX.Element {
  const Glyph = byName.get(entry.name) as HanjiIcon;
  const jsx = `<${entry.component}${variant === 'outline' ? '' : ` variant="${variant}"`} />`;
  return (
    <aside className="pg-icon-detail" aria-label={`${entry.name} icon`}>
      <div className="pg-icon-stage">
        {STYLES.map((v) => (
          <figure key={v} data-current={v === variant ? '' : undefined}>
            <Glyph variant={v} size={36} />
            <figcaption>{styleLabel[v]}</figcaption>
          </figure>
        ))}
      </div>
      <h3>{entry.name}</h3>
      <p className="pg-icon-meta">
        {entry.category || 'Uncategorised'} ·{' '}
        {entry.original ? 'drawn for hanji' : 'from Solar, reshaped by hanji'}
        {entry.aliases.length ? ` · also ${entry.aliases.join(', ')}` : ''}
      </p>
      <CodeBlock.Snippet
        language="tsx"
        code={`import { ${entry.component} } from '@hanji/icons';`}
      />
      <CodeBlock.Snippet language="tsx" code={jsx} />
      <CodeBlock.Root language="svg" wrap className="pg-icon-svg">
        <CodeBlock.Header>
          <CodeBlock.Language>svg</CodeBlock.Language>
          <CodeBlock.Actions>
            <CodeBlock.Copy />
          </CodeBlock.Actions>
        </CodeBlock.Header>
        <CodeBlock.Code code={icons.toSvg(Glyph, variant)} />
      </CodeBlock.Root>
      {entry.tags.length ? (
        <p className="pg-icon-tags">Also found by: {entry.tags.slice(0, 12).join(', ')}</p>
      ) : null}
    </aside>
  );
}

export function IconsPage(): React.JSX.Element {
  const [query, setQuery] = React.useState('');
  const [variant, setVariant] = React.useState<IconVariant>('outline');
  const [category, setCategory] = React.useState('all');
  const [stroke, setStroke] = React.useState(1.5);
  const [ink, setInk] = React.useState<'tint' | 'accent'>('tint');
  const [selected, setSelected] = React.useState('home');
  const deferred = React.useDeferredValue(query);
  const terms = deferred.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = catalog.filter(
    (c) => (category === 'all' || c.category === category) && (!terms.length || matches(c, terms)),
  );
  const current = catalog.find((c) => c.name === selected) ?? catalog[0];
  return (
    <article className="pg-page pg-icons">
      <div className="pg-eyebrow">
        foundation · <span data-status="new">new</span>
      </div>
      <h1>Icons</h1>
      <p className="pg-lede">
        {catalog.length.toLocaleString()} icons, each in five styles: outline, solid, wash, duotone
        and duotone solid, with {aliasCount} familiar aliases. Reshaped from Solar with hanji’s
        softened joins and rounder corners; the second ink takes your accent when you ask. One
        module per icon.
      </p>
      <p className="pg-icon-credit">
        Drawings adapted from{' '}
        <a
          href="https://www.figma.com/community/file/1166831539721848736"
          target="_blank"
          rel="noreferrer"
        >
          Solar by 480 Design
        </a>{' '}
        under CC BY 4.0; search and wrench are drawn for hanji.
      </p>
      <CodeBlock.Snippet code="pnpm add @hanji/icons" className="pg-import" />

      <div className="pg-icon-tools">
        <Field.Root className="pg-icon-search">
          <Field.Label className="hj-sr-only">Search icons</Field.Label>
          <Field.Shell>
            <Field.Adornment>
              <Icon name="search" />
            </Field.Adornment>
            <Field.Control
              type="search"
              placeholder="Search 1,500+ icons: delete, upload, weather…"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
          </Field.Shell>
        </Field.Root>
        <SegmentedControl.Root
          aria-label="Style"
          value={variant}
          onValueChange={(v) => setVariant(v as IconVariant)}
        >
          {STYLES.map((v) => (
            <SegmentedControl.Item key={v} value={v}>
              {styleLabel[v]}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
        <SegmentedControl.Root
          size="sm"
          aria-label="Second ink"
          value={ink}
          onValueChange={(v) => setInk(v as 'tint' | 'accent')}
        >
          <SegmentedControl.Item value="tint">Tint</SegmentedControl.Item>
          <SegmentedControl.Item value="accent">Accent</SegmentedControl.Item>
        </SegmentedControl.Root>
        <Select.Root
          items={categoryItems}
          value={category}
          onValueChange={(v) => setCategory(String(v))}
        >
          <Select.Trigger aria-label="Category" className="pg-icon-category">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Content alignItemWithTrigger={false}>
            {categoryItems.map((c) => (
              <Select.Option key={c.value} value={c.value}>
                {c.label}
              </Select.Option>
            ))}
          </Select.Content>
        </Select.Root>
        <Slider.Root
          className="pg-icon-stroke"
          min={1}
          max={2.5}
          step={0.25}
          value={stroke}
          onValueChange={(v) => setStroke(v as number)}
        >
          <Slider.Label>Line</Slider.Label>
          <Slider.Value>{() => stroke.toFixed(2)}</Slider.Value>
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
              <Slider.Thumb />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </div>

      <p className="pg-icon-count" aria-live="polite">
        {shown.length === catalog.length
          ? `${catalog.length.toLocaleString()} icons`
          : `${shown.length.toLocaleString()} of ${catalog.length.toLocaleString()}`}
      </p>

      <div className="pg-icon-layout">
        <div
          className="pg-icon-grid"
          style={{
            ['--hj-icon-stroke' as string]: stroke,
            ['--hj-icon-second' as string]: ink === 'accent' ? 'var(--hj-accent)' : undefined,
          }}
        >
          {shown.map((c) => {
            const Glyph = byName.get(c.name) as HanjiIcon;
            return (
              <button
                key={c.name}
                type="button"
                className="pg-icon-cell"
                aria-pressed={c.name === current?.name}
                title={c.name}
                onClick={() => setSelected(c.name)}
              >
                <Glyph variant={variant} size={24} />
                <span>{c.name}</span>
              </button>
            );
          })}
          {shown.length === 0 ? (
            <div className="pg-icon-empty">
              <p>No icon matches “{deferred}”. Try a synonym — icons are tagged with them.</p>
              <Button size="sm" variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            </div>
          ) : null}
        </div>
        {current ? (
          <div
            style={{
              ['--hj-icon-second' as string]: ink === 'accent' ? 'var(--hj-accent)' : undefined,
            }}
          >
            <Detail entry={current} variant={variant} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
