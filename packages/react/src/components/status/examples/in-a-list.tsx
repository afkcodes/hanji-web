import { Status, Text } from '@hanji/react';

const rows = [
  {
    title: 'Late Night Drive',
    sub: '48 tracks · 212 MB',
    status: (
      <Status tone="success" meta="Yesterday">
        Downloaded
      </Status>
    ),
  },
  {
    title: 'Paper Cranes',
    sub: '12 tracks · 64% of 98 MB',
    status: <Status tone="pending">Downloading</Status>,
  },
  {
    title: 'Sunday, slowly',
    sub: 'Needs 1.1 GB · 0.4 GB free',
    status: (
      <Status tone="danger" meta="Not enough space">
        Failed
      </Status>
    ),
  },
  {
    title: 'Field Recordings, Jeju',
    sub: 'Removed by the artist',
    status: <Status meta="Since 3 Nov">Unavailable</Status>,
  },
];

export function Example(): React.JSX.Element {
  return (
    <div aria-live="polite" style={{ width: '100%', maxWidth: 520 }}>
      {rows.map((r) => (
        <div
          key={r.title}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid var(--hj-line)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Text truncate>{r.title}</Text>
            <Text variant="sub" tone="mute">
              {r.sub}
            </Text>
          </div>
          {r.status}
        </div>
      ))}
    </div>
  );
}
