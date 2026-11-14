import { Rating } from '@hanji/react';

const rows = [
  { title: 'Low Tide Choir', by: 'Jun-seo Park', value: 4.6, count: 2184 },
  { title: 'Field Notes, S2', by: 'Noor Haddad', value: 3.8, count: 412 },
  { title: 'Paper Lanterns', by: 'Ilse Brandt', value: 4.95, count: 18_920 },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 2, width: 380 }}>
      {rows.map((r) => (
        <div
          key={r.title}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid var(--hj-line)',
          }}
        >
          <span>
            <span className="hj-text-body">{r.title}</span>
            <br />
            <span className="hj-text-sub hj-tone-mute">{r.by}</span>
          </span>
          <Rating.Display value={r.value} count={r.count} />
        </div>
      ))}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 14,
        }}
      >
        <span className="hj-text-sub hj-tone-mute">Rate after you’ve listened</span>
        <Rating.Root aria-label="Rate Night Bus Home" size="sm" disabled />
      </div>
    </div>
  );
}
