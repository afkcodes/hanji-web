import { Button, Sheet } from '@hanji/react';
import * as React from 'react';

const queue = [
  ['The Long Way Round the Harbour', 'Ilse Brandt', '4:07'],
  ['Paper Lanterns', 'Jun-seo Park', '3:32'],
  ['Night Bus Home', 'Noor Haddad', '5:01'],
  ['Saltmarsh', 'Ilse Brandt', '3:48'],
  ['Kettle Hymn', 'Kōya Lanes', '6:12'],
  ['Seoul, 4 a.m.', 'Jun-seo Park', '2:59'],
  ['Low Tide Choir', 'Aiko Sato', '4:41'],
  ['Field Notes', 'Tomás Reyes', '3:15'],
  ['Quiet Machines', 'Dev Malhotra', '7:02'],
  ['Sunday, slowly', 'Mira Okafor', '3:27'],
] as const;

const snapPoints = [0.5, 0.9];

export function Example(): React.JSX.Element {
  const [snap, setSnap] = React.useState<number | string | null>(snapPoints[0] ?? null);
  return (
    <Sheet.Root snapPoints={snapPoints} snapPoint={snap} onSnapPointChange={setSnap}>
      <Sheet.Trigger render={<Button variant="secondary" />}>Up next · 10</Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Up next</Sheet.Title>
          <Sheet.Description>From “Late Night Drive” · 44 min left</Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Body defer>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {queue.map(([title, artist, time], i) => (
              <li
                key={title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  minHeight: 56,
                  borderBottom: '1px solid var(--hj-line)',
                }}
              >
                <span style={{ font: '500 12px var(--hj-font-mono)', color: 'var(--hj-fg-mute)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <span style={{ display: 'block', fontWeight: 500 }}>{title}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>{artist}</span>
                </span>
                <span style={{ font: '500 12.5px var(--hj-font-mono)', color: 'var(--hj-fg-dim)' }}>
                  {time}
                </span>
              </li>
            ))}
          </ol>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  );
}
