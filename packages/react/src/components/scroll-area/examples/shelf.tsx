import { ScrollArea } from '@hanji/react';

const covers = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  title: [
    'Paper Weather',
    'Saltmarsh',
    'Seoul, 4 a.m.',
    'Low Tide Choir',
    'Field Notes',
    'Quiet Machines',
  ][i % 6],
  bg: `linear-gradient(${120 + i * 17}deg, var(--hj-data-${(i % 6) + 1}), var(--hj-data-${((i + 3) % 6) + 1}))`,
}));

export function Example(): React.JSX.Element {
  return (
    <ScrollArea.Box orientation="horizontal" style={{ width: 'min(560px, 100%)' }}>
      <div style={{ display: 'flex', gap: 12, padding: '4px 4px 14px' }}>
        {covers.map((c) => (
          <figure key={c.id} style={{ margin: 0, flex: 'none', width: 120 }}>
            <div style={{ width: 120, height: 120, borderRadius: 12, background: c.bg }} />
            <figcaption style={{ marginTop: 6, fontSize: 12.5, fontWeight: 500 }}>
              {c.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </ScrollArea.Box>
  );
}
