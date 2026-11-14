import { Artwork, Button, Icon, Text, VirtualList } from '@hanji/react';
import type { VirtualListActions } from '@hanji/react';
import * as React from 'react';

const WORDS = ['Paper', 'Night', 'Salt', 'Harbour', 'Low', 'Glass', 'Ink', 'Slow', 'Cedar', 'Late'];
const NOUNS = ['Lanterns', 'Weather', 'Tides', 'Rooms', 'Season', 'Houses', 'Rivers', 'Signals'];
const ARTISTS = [
  'Mira Okafor',
  'Jun-seo Park',
  'Ilse Brandt',
  'Tomás Reyes',
  'Aiko Sato',
  'Noor Haddad',
  'Dev Malhotra',
];
const COUNT = 2_400;
const COVER = 136;

function album(i: number): { title: string; artist: string; year: number } {
  const title = `${WORDS[i % WORDS.length]} ${NOUNS[Math.floor(i / WORDS.length) % NOUNS.length]}`;
  return {
    title: i >= 80 ? `${title} ${Math.floor(i / 80) + 1}` : title,
    artist: ARTISTS[(i * 3) % ARTISTS.length] as string,
    year: 2026 - (i % 19),
  };
}

export function Example(): React.JSX.Element {
  const titleId = React.useId();
  const actions = React.useRef<VirtualListActions>(null);
  const [range, setRange] = React.useState({ start: 0, end: 0 });
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 640 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Text variant="heading" id={titleId}>
            All albums
          </Text>
          <Text variant="sub" tone="mute">
            {(range.start + 1).toLocaleString()}–{(range.end + 1).toLocaleString()} of{' '}
            {COUNT.toLocaleString()}
          </Text>
        </div>
        <Button
          size="sm"
          variant="secondary"
          iconOnly
          aria-label="Previous albums"
          disabled={atStart}
          // a page back: the same step as Next, so back and forth land on the same albums
          onClick={() =>
            actions.current?.scrollToIndex(Math.max(0, 2 * range.start - range.end), {
              align: 'start',
              behavior: 'smooth',
            })
          }
        >
          <Icon name="chevronLeft" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          iconOnly
          aria-label="Next albums"
          disabled={atEnd}
          // the album cut off at the right edge leads the next page
          onClick={() =>
            actions.current?.scrollToIndex(range.end, { align: 'start', behavior: 'smooth' })
          }
        >
          <Icon name="chevronRight" />
        </Button>
      </div>
      <VirtualList.Root
        orientation="horizontal"
        count={COUNT}
        estimateSize={COVER}
        gap={16}
        actionsRef={actions}
        onRangeChange={setRange}
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtStart(el.scrollLeft <= 0);
          setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
        }}
        aria-labelledby={titleId}
        style={{ height: 196 }}
      >
        {(i) => {
          const a = album(i);
          return (
            <div style={{ width: COVER, display: 'grid', alignContent: 'start', gap: 2 }}>
              <Artwork.Root id={a.title} size={COVER} style={{ marginBottom: 8 }} />
              <Text truncate>{a.title}</Text>
              <Text variant="sub" tone="mute" truncate>
                {a.artist} · {a.year}
              </Text>
            </div>
          );
        }}
      </VirtualList.Root>
    </div>
  );
}
