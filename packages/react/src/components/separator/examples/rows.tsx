import { Separator, Text } from '@hanji/react';

const rows = [
  { title: 'Low Tide Choir', sub: 'Album · 2024', tint: 'var(--hj-data-1)' },
  { title: 'Field Notes', sub: 'Podcast · 3 new', tint: 'var(--hj-data-3)' },
  { title: 'Run Club', sub: 'Playlist · 32 tracks', tint: 'var(--hj-data-2)' },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      <Text variant="eyebrow" tone="mute">
        Recently played
      </Text>
      {rows.map((r, i) => (
        <div key={r.title}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 16px' }}>
            <span
              style={{ width: 40, height: 40, borderRadius: 8, background: r.tint, flex: 'none' }}
            />
            <div>
              <Text>{r.title}</Text>
              <Text variant="sub" tone="mute">
                {r.sub}
              </Text>
            </div>
          </div>
          {i < rows.length - 1 ? <Separator variant="inset" /> : null}
        </div>
      ))}
      <Separator style={{ margin: '16px 0' }} />
      <Text variant="sub" tone="dim">
        3 items · synced 2 min ago
      </Text>
    </div>
  );
}
