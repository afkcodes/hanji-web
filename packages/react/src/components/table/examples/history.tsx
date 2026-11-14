import { Icon, Table } from '@hanji/react';
import * as React from 'react';

type Row = {
  track: string;
  artist: string;
  plays: number;
  minutes: number;
  sync: 'synced' | 'pending' | 'failed';
};

const rows: Row[] = [
  {
    track: 'The Long Way Round the Harbour',
    artist: 'Ilse Brandt',
    plays: 41,
    minutes: 168,
    sync: 'synced',
  },
  { track: 'Night Bus Home', artist: 'Noor Haddad', plays: 37, minutes: 129, sync: 'synced' },
  { track: 'Saudade, Again', artist: 'Tomás Reyes', plays: 22, minutes: 84, sync: 'pending' },
  { track: 'Kōya Lanes', artist: 'Aiko Sato', plays: 19, minutes: 97, sync: 'synced' },
  { track: 'Quiet Machines', artist: 'Dev Malhotra', plays: 8, minutes: 31, sync: 'failed' },
];

type Key = 'track' | 'plays' | 'minutes';

export function Example(): React.JSX.Element {
  const [sort, setSort] = React.useState<{ key: Key; dir: 'ascending' | 'descending' }>({
    key: 'plays',
    dir: 'descending',
  });
  const sorted = React.useMemo(() => {
    const m = sort.dir === 'ascending' ? 1 : -1;
    return rows.toSorted((a, b) =>
      sort.key === 'track' ? a.track.localeCompare(b.track) * m : (a[sort.key] - b[sort.key]) * m,
    );
  }, [sort]);
  const by = (key: Key) => () =>
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === 'descending' ? 'ascending' : 'descending',
    }));
  const dir = (key: Key): 'ascending' | 'descending' | 'none' =>
    sort.key === key ? sort.dir : 'none';
  return (
    <Table.Root aria-label="Play history" style={{ maxWidth: 640 }}>
      <Table.Caption>This month · 127 plays across 5 tracks</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head sort={dir('track')} onSort={by('track')}>
            Track
          </Table.Head>
          <Table.Head>Sync</Table.Head>
          <Table.Head numeric sort={dir('plays')} onSort={by('plays')}>
            Plays
          </Table.Head>
          <Table.Head numeric sort={dir('minutes')} onSort={by('minutes')}>
            Minutes
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map((r) => (
          <Table.Row key={r.track}>
            <Table.Cell>
              <div style={{ fontWeight: 500 }}>{r.track}</div>
              <div style={{ fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>{r.artist}</div>
            </Table.Cell>
            <Table.Cell>
              {r.sync === 'failed' ? (
                <span
                  style={{
                    display: 'inline-flex',
                    gap: 5,
                    alignItems: 'center',
                    color: 'var(--hj-danger)',
                    fontSize: 13,
                  }}
                >
                  <Icon name="alert" size={15} /> Failed
                </span>
              ) : r.sync === 'pending' ? (
                <span style={{ color: 'var(--hj-fg-mute)', fontSize: 13 }}>Pending · on Wi-Fi</span>
              ) : (
                <span style={{ color: 'var(--hj-fg-dim)', fontSize: 13 }}>Synced</span>
              )}
            </Table.Cell>
            <Table.Cell numeric>{r.plays}</Table.Cell>
            <Table.Cell numeric>{r.minutes}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell>Total</Table.Cell>
          <Table.Cell />
          <Table.Cell numeric>127</Table.Cell>
          <Table.Cell numeric>509</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Root>
  );
}
