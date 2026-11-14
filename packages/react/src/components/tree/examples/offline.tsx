import { Button, Text, Tree } from '@hanji/react';
import * as React from 'react';

interface Entry {
  id: string;
  title: string;
  detail: string;
  /** Size in MB. */
  size: number;
  disabled?: boolean;
}
interface Shelf {
  id: string;
  title: string;
  entries: Entry[];
}

const SHELVES: Shelf[] = [
  {
    id: 'playlists',
    title: 'Playlists',
    entries: [
      { id: 'late-night', title: 'Late Night Drive', detail: '42 tracks', size: 312 },
      { id: 'sunday', title: 'Sunday Papers', detail: '18 tracks', size: 128 },
      { id: 'run', title: 'Run 5K', detail: '24 tracks', size: 176 },
    ],
  },
  {
    id: 'albums',
    title: 'Albums',
    entries: [
      { id: 'salt-tide', title: 'Salt Tide', detail: 'Aiko Sato', size: 96 },
      { id: 'glass-house', title: 'Glass House', detail: 'Ilse Brandt', size: 84 },
      { id: 'paper-lanterns', title: 'Paper Lanterns', detail: 'Mira Okafor', size: 104 },
    ],
  },
  {
    id: 'podcasts',
    title: 'Podcasts',
    entries: [
      { id: 'ledger', title: 'Ledger Lines', detail: '6 episodes', size: 240 },
      {
        id: 'small-rooms',
        title: 'Small Rooms',
        detail: 'Streaming only',
        size: 0,
        disabled: true,
      },
    ],
  },
];

const ENTRIES = new Map(SHELVES.flatMap((s) => s.entries.map((e) => [e.id, e] as const)));
const SHELF = new Map(SHELVES.map((s) => [s.id, s] as const));

const mb = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(2)} GB` : `${Math.round(n)} MB`;

/** What a selection downloads: a whole shelf counts once, even if some of its items are ticked too. */
function total(selected: readonly string[]): number {
  const shelves = new Set(selected.filter((id) => SHELF.has(id)));
  let sum = 0;
  for (const id of shelves) {
    for (const e of SHELF.get(id)?.entries ?? []) sum += e.disabled ? 0 : e.size;
  }
  for (const id of selected) {
    const e = ENTRIES.get(id);
    const inShelf = SHELVES.some((s) => shelves.has(s.id) && s.entries.includes(e as Entry));
    if (e && !inShelf) sum += e.size;
  }
  return sum;
}

export function Example(): React.JSX.Element {
  const titleId = React.useId();
  const [selected, setSelected] = React.useState<readonly string[]>(['late-night', 'salt-tide']);
  const size = total(selected);
  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        maxWidth: 380,
        borderRadius: 16,
        background: 'var(--hj-surface)',
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '14px 16px 6px' }}>
        <Text variant="subheading" id={titleId}>
          Download for offline
        </Text>
        <Text variant="sub" tone="mute">
          Tick a shelf for all of it, or pick items. Space ticks; ⌘A ticks everything.
        </Text>
      </div>
      <Tree.Root
        aria-labelledby={titleId}
        selectionMode="multiple"
        selected={selected}
        onSelectedChange={setSelected}
        defaultExpanded={['playlists', 'albums']}
        style={{ padding: 6 }}
      >
        {SHELVES.map((s) => (
          <Tree.Item key={s.id} id={s.id}>
            <Tree.Label>{s.title}</Tree.Label>
            <Tree.Meta>{s.entries.length}</Tree.Meta>
            <Tree.Group>
              {s.entries.map((e) => (
                <Tree.Item key={e.id} id={e.id} disabled={e.disabled} textValue={e.title}>
                  <Tree.Label>
                    {e.title}
                    <Text render={<span />} variant="sub" tone="mute">
                      {' '}
                      · {e.detail}
                    </Text>
                  </Tree.Label>
                  <Tree.Meta>{e.disabled ? '—' : mb(e.size)}</Tree.Meta>
                </Tree.Item>
              ))}
            </Tree.Group>
          </Tree.Item>
        ))}
      </Tree.Root>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px 12px 16px',
          borderTop: '1px solid var(--hj-line)',
        }}
      >
        <Text variant="sub" tone="dim" style={{ flex: 1 }} aria-live="polite">
          {selected.length ? `${selected.length} selected · ${mb(size)}` : 'Nothing selected'}
        </Text>
        <Button
          size="sm"
          variant="quiet"
          disabled={!selected.length}
          onClick={() => setSelected([])}
        >
          Clear
        </Button>
        <Button size="sm" disabled={!size}>
          Download
        </Button>
      </div>
    </div>
  );
}
