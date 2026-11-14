import { Artwork, Text } from '@hanji/react';

const playlists = [
  { name: 'Morning', ids: ['Low Tide'] },
  { name: 'Focus', ids: ['Glasshouse', 'Slow Signal'] },
  { name: 'Late Night Drive', ids: ['Night Bus to Hongdae', 'Saudade, Again', 'Paper Lanterns'] },
  { name: 'Field Notes', ids: ['Cartography', 'Ink & Water', 'Low Tide', 'Glasshouse'] },
  { name: 'New playlist', ids: [] },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      {playlists.map((p) => (
        <div key={p.name} style={{ display: 'grid', gap: 8, width: 104 }}>
          <Artwork.Root size={104}>
            <Artwork.Collage ids={p.ids} fallback={p.name} />
          </Artwork.Root>
          <div>
            <Text variant="label">{p.name}</Text>
            <Text variant="sub" tone="mute">
              {p.ids.length ? `${p.ids.length * 12} tracks` : 'Empty'}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}
