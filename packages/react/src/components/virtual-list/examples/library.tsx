import { Artwork, Button, Text, VirtualList } from '@hanji/react';
import type { VirtualListActions } from '@hanji/react';
import * as React from 'react';

const FIRST = ['Paper', 'Night', 'Salt', 'Harbour', 'Low', 'Glass', 'Ink', 'Slow', 'Cedar', 'Late'];
const SECOND = [
  'Lanterns',
  'Drive',
  'Tide',
  'Lights',
  'Season',
  'House',
  'Water',
  'Signal',
  'Moon',
  'Bus',
];
const ARTISTS = [
  'Mira Okafor',
  'Jun-seo Park',
  'Ilse Brandt',
  'Tomás Reyes',
  'Aiko Sato',
  'Noor Haddad',
  'Dev Malhotra',
];
const COUNT = 10_000;

function track(i: number): { title: string; artist: string; time: string } {
  const title = `${FIRST[i % 10]} ${SECOND[Math.floor(i / 10) % 10]}${i >= 100 ? ` ${Math.floor(i / 100) + 1}` : ''}`;
  const secs = 120 + ((i * 37) % 240);
  return {
    title,
    artist: ARTISTS[i % ARTISTS.length] as string,
    time: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`,
  };
}

export function Example(): React.JSX.Element {
  const actions = React.useRef<VirtualListActions>(null);
  const [range, setRange] = React.useState({ start: 0, end: 0 });
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 520 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Text variant="sub" tone="mute" style={{ flex: 1 }}>
          Rows {(range.start + 1).toLocaleString()}–{(range.end + 1).toLocaleString()} of{' '}
          {COUNT.toLocaleString()}
        </Text>
        <Button size="sm" variant="secondary" onClick={() => actions.current?.scrollToIndex(0)}>
          Top
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => actions.current?.scrollToIndex(4_999, { align: 'center' })}
        >
          No. 5,000
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => actions.current?.scrollToIndex(COUNT - 1)}
        >
          End
        </Button>
      </div>
      <VirtualList.Root
        count={COUNT}
        estimateSize={56}
        actionsRef={actions}
        onRangeChange={setRange}
        aria-label="All tracks"
        style={{ height: 420, boxShadow: 'inset 0 0 0 1px var(--hj-line)' }}
      >
        {(i) => {
          const t = track(i);
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 56,
                padding: '0 14px',
              }}
            >
              <Text variant="mono" tone="mute" style={{ width: 44, textAlign: 'right' }}>
                {(i + 1).toLocaleString()}
              </Text>
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
            </div>
          );
        }}
      </VirtualList.Root>
    </div>
  );
}
