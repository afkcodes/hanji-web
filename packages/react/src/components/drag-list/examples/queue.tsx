import { Artwork, DragList, Text } from '@hanji/react';
import * as React from 'react';

const TRACKS = [
  { id: 'v', title: 'Variations on a Theme', artist: 'Ilse Brandt', time: '4:12' },
  { id: 'n', title: 'Night Drives', artist: 'Jun-seo Park', time: '3:47' },
  { id: 'h', title: 'Harbour Lights', artist: 'Noor Haddad', time: '5:03' },
  { id: 's', title: 'Salt & Cedar', artist: 'Tomás Reyes', time: '2:58' },
  { id: 'p', title: 'Paper Moon (Live)', artist: 'Aiko Sato', time: '6:21' },
  { id: 'l', title: 'Low Season', artist: 'Dev Malhotra', time: '3:30' },
];

export function Example(): React.JSX.Element {
  const [queue, setQueue] = React.useState(TRACKS);
  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px 16px' }}>
        <Text variant="heading">Up next</Text>
        <Text variant="sub" tone="mute">
          6 tracks · 26 min
        </Text>
      </div>
      <DragList.Root
        aria-label="Up next"
        style={{ ['--hj-drag-list-inset' as string]: '68px' }}
        onReorder={(from, to) => setQueue((q) => DragList.reorder(q, from, to))}
      >
        {queue.map((t) => (
          <DragList.Item key={t.id} label={`${t.title} by ${t.artist}`}>
            <Artwork.Root id={t.title} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text>{t.title}</Text>
              <Text variant="sub" tone="mute">
                {t.artist}
              </Text>
            </div>
            <Text variant="mono" tone="mute">
              {t.time}
            </Text>
            <DragList.Handle />
          </DragList.Item>
        ))}
      </DragList.Root>
    </div>
  );
}
