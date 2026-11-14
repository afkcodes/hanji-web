import { DragList, Text } from '@hanji/react';
import * as React from 'react';

const SECTIONS = [
  { id: 'recent', title: 'Recently played', note: 'Your last 20 albums and playlists.' },
  {
    id: 'mixes',
    title: 'Made for you',
    note: 'Six daily mixes built from what you play most, refreshed every morning at 6. They skip anything you have hidden.',
  },
  { id: 'new', title: 'New releases', note: 'From artists you follow.' },
  {
    id: 'offline',
    title: 'Downloaded',
    note: 'Everything that plays without a connection — 48 albums, 3.1 GB on this device.',
  },
  { id: 'radio', title: 'Radio', note: 'Stations seeded from a song, an artist or a mood.' },
];

export function Example(): React.JSX.Element {
  const [order, setOrder] = React.useState(SECTIONS);
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <DragList.Root
        aria-label="Home sections"
        onReorder={(from, to) => setOrder((o) => DragList.reorder(o, from, to))}
      >
        {order.map((s, i) => (
          <DragList.Item key={s.id} label={s.title}>
            <Text variant="mono" tone="mute" style={{ width: 18 }}>
              {i + 1}
            </Text>
            <div style={{ flex: 1, minWidth: 0, padding: '4px 0' }}>
              <Text variant="label">{s.title}</Text>
              <Text variant="sub" tone="dim">
                {s.note}
              </Text>
            </div>
            <DragList.Handle />
          </DragList.Item>
        ))}
      </DragList.Root>
    </div>
  );
}
