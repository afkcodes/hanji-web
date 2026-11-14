import { Card } from '@hanji/react';

const items = [
  {
    title: 'Paper Weather',
    by: 'Kōya Lanes',
    meta: '9 tracks · 41 min',
    art: 'linear-gradient(150deg, var(--hj-data-1), var(--hj-data-4))',
  },
  {
    title: 'Saltmarsh',
    by: 'Ilse Brandt',
    meta: '12 tracks · 52 min',
    art: 'linear-gradient(160deg, var(--hj-data-3), var(--hj-data-6))',
  },
  {
    title: 'Seoul, 4 a.m.',
    by: 'Jun-seo Park',
    meta: 'Single · 2:59',
    art: 'radial-gradient(90% 90% at 30% 20%, var(--hj-data-2), var(--hj-data-5))',
  },
  { title: 'Untitled draft', by: 'You', meta: 'No tracks yet', art: null },
] as const;

export function Example(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        width: '100%',
      }}
    >
      {items.map((it) => (
        <Card.Root key={it.title} pressable render={<a href={`#album/${it.title}`} />}>
          <Card.Media ratio="1:1">
            {it.art ? (
              <div style={{ width: '100%', height: '100%', background: it.art }} />
            ) : (
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  height: '100%',
                  color: 'var(--hj-fg-mute)',
                  fontSize: 12.5,
                }}
              >
                Add a cover
              </div>
            )}
          </Card.Media>
          <Card.Body>
            <Card.Title>{it.title}</Card.Title>
            <Card.Description>{it.by}</Card.Description>
          </Card.Body>
          <Card.Footer>{it.meta}</Card.Footer>
        </Card.Root>
      ))}
    </div>
  );
}
