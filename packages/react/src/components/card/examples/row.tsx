import { Card } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 10, width: 'min(420px, 100%)' }}>
      <Card.Root pressable orientation="horizontal" render={<a href="#episode/312" />}>
        <Card.Media ratio="1:1">
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(140deg, var(--hj-data-5), var(--hj-data-2))',
            }}
          />
        </Card.Media>
        <Card.Body>
          <Card.Eyebrow>Field Notes · Ep. 312</Card.Eyebrow>
          <Card.Title>How a choir learns a room</Card.Title>
          <Card.Description>With Aiko Sato · 48 min · 12 min left</Card.Description>
        </Card.Body>
      </Card.Root>
      <Card.Root orientation="horizontal">
        <Card.Media ratio="1:1" />
        <Card.Body>
          <Card.Eyebrow>Field Notes · Ep. 313</Card.Eyebrow>
          <Card.Title>Coming Friday</Card.Title>
          <Card.Description>Not out yet — we’ll download it on Wi-Fi when it is.</Card.Description>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
