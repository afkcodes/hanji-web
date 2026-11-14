import { Artwork, Text } from '@hanji/react';

const rows = [
  { title: 'Late Night Drive', sub: 'Playlist · 48 tracks' },
  { title: 'Saudade, Again', sub: 'Ilse Brandt · Cartographies' },
  { title: 'Night Bus to Hongdae', sub: 'Jun-seo Park · Last Stop' },
  { title: 'Paper Lanterns', sub: 'Aiko Sato · Hanging Light' },
  { title: 'Low Tide', sub: 'Mira Okafor · Salt Year' },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 28, width: '100%', maxWidth: 560 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        <Artwork.Root id="Late Night Drive" size={132} lift />
        <div style={{ display: 'grid', gap: 4, paddingBottom: 6 }}>
          <Text variant="eyebrow" tone="mute">
            Playlist · by you
          </Text>
          <Text variant="title">Late Night Drive</Text>
          <Text variant="sub" tone="dim">
            48 tracks · 3 h 12 min
          </Text>
        </div>
      </div>
      <div>
        {rows.map((r) => (
          <div
            key={r.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
              borderBottom: '1px solid var(--hj-line)',
            }}
          >
            <Artwork.Root id={r.title} size={44} />
            <div>
              <Text>{r.title}</Text>
              <Text variant="sub" tone="mute">
                {r.sub}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
