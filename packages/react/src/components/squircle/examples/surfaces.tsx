import { Squircle } from '@hanji/react';

const covers = [
  { title: 'Low Tide Choir', by: 'Jun-seo Park', a: 'var(--hj-data-1)', b: 'var(--hj-data-4)' },
  { title: 'Field Notes, S2', by: 'Noor Haddad', a: 'var(--hj-data-3)', b: 'var(--hj-data-6)' },
  { title: 'Paper Lanterns', by: 'Ilse Brandt', a: 'var(--hj-data-2)', b: 'var(--hj-data-5)' },
];

/** Squircles for art: cover tiles at radius lg, and a 28px app-style sheet corner. */
export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
      {covers.map((c) => (
        <figure key={c.title} style={{ margin: 0, width: 132 }}>
          <Squircle
            radius="lg"
            aria-hidden="true"
            style={{
              aspectRatio: '1',
              background: `linear-gradient(150deg, ${c.a}, ${c.b})`,
              boxShadow: 'var(--hj-shadow-art)',
            }}
          />
          <figcaption style={{ marginTop: 10, font: 'var(--hj-type-sub)' }}>
            <b style={{ display: 'block', fontWeight: 600, color: 'var(--hj-fg)' }}>{c.title}</b>
            <span style={{ color: 'var(--hj-fg-mute)' }}>{c.by}</span>
          </figcaption>
        </figure>
      ))}
      <Squircle
        radius="xl"
        style={{
          width: 220,
          padding: 20,
          background: 'var(--hj-surface-2)',
          boxShadow: 'inset 0 0 0 1px var(--hj-line)',
          font: 'var(--hj-type-body)',
        }}
      >
        <b style={{ display: 'block', font: 'var(--hj-type-heading)' }}>Sheet corner</b>
        <span style={{ color: 'var(--hj-fg-dim)', font: 'var(--hj-type-sub)' }}>
          28px, continuous. Uses CSS corner-shape where available; no JavaScript.
        </span>
      </Squircle>
    </div>
  );
}
