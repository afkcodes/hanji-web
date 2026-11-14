import { Collapsible } from '@hanji/react';
import * as React from 'react';

const tracks = [
  ['Paper Lanterns', '3:32'],
  ['The Long Way Round the Harbour', '4:07'],
  ['Night Bus Home', '5:01'],
  ['Saudade, Again', '3:48'],
  ['Cartographies', '4:22'],
  ['Kōya at Dusk', '6:10'],
  ['Ferry Shed', '2:58'],
  ['Low Tide Choir', '4:44'],
] as const;

function Row({ n, title, time }: { n: number; title: string; time: string }): React.JSX.Element {
  return (
    <li
      style={{
        display: 'flex',
        gap: 14,
        padding: '10px 0',
        borderBottom: '1px solid var(--hj-line)',
      }}
    >
      <span className="hj-text-mono hj-tone-mute" style={{ width: 18 }}>
        {String(n).padStart(2, '0')}
      </span>
      <span className="hj-text-body" style={{ flex: 1 }}>
        {title}
      </span>
      <span className="hj-text-mono hj-tone-mute">{time}</span>
    </li>
  );
}

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const hidden = tracks.length - 3;
  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {tracks.slice(0, 3).map(([t, d], i) => (
          <Row key={t} n={i + 1} title={t} time={d} />
        ))}
      </ul>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Panel>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {tracks.slice(3).map(([t, d], i) => (
              <Row key={t} n={i + 4} title={t} time={d} />
            ))}
          </ul>
        </Collapsible.Panel>
        <Collapsible.Trigger>
          {open ? 'Show fewer' : `Show ${hidden} more tracks`}
        </Collapsible.Trigger>
      </Collapsible.Root>
    </div>
  );
}
