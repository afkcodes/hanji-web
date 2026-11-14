import { Button, Skeleton, Text } from '@hanji/react';
import * as React from 'react';

const rows = [
  { title: 'Late Night Drive', sub: 'Playlist · 48 tracks', tint: 'var(--hj-data-4)' },
  { title: 'Low Tide Choir', sub: 'Album · Aiko Sato', tint: 'var(--hj-data-1)' },
  { title: 'Field Notes', sub: 'Podcast · 3 new episodes', tint: 'var(--hj-data-3)' },
];

export function Example(): React.JSX.Element {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div style={{ width: '100%', maxWidth: 380, display: 'grid', gap: 16 }}>
      <div aria-busy={!loaded}>
        {rows.map((r, i) => (
          <div
            key={r.title}
            className={loaded ? 'hj-stagger' : undefined}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              padding: '10px 0',
              ['--hj-i' as string]: i,
            }}
          >
            {loaded ? (
              <>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: r.tint,
                    flex: 'none',
                  }}
                />
                <div>
                  <Text>{r.title}</Text>
                  <Text variant="sub" tone="mute">
                    {r.sub}
                  </Text>
                </div>
              </>
            ) : (
              <>
                <Skeleton.Root width={40} height={40} />
                <div style={{ flex: 1 }}>
                  <Skeleton.Root shape="text" width="58%" style={{ fontSize: 15 }} />
                  <Skeleton.Root shape="text" width="38%" style={{ fontSize: 12.5 }} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setLoaded((v) => !v)}
        style={{ justifySelf: 'start' }}
      >
        {loaded ? 'Reset' : 'Load'}
      </Button>
    </div>
  );
}
