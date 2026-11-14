import { Avatar, Command, Field, Icon, Switch } from '@hanji/react';
import * as React from 'react';

interface Person {
  name: string;
  team: string;
  email: string;
}

const directory: Person[] = [
  { name: 'Mira Okafor', team: 'Design', email: 'mira@aster.app' },
  { name: 'Jun-seo Park', team: 'iOS', email: 'junseo@aster.app' },
  { name: 'Ilse Brandt', team: 'Finance', email: 'ilse@aster.app' },
  { name: 'Tomás Reyes', team: 'Support', email: 'tomas@aster.app' },
  { name: 'Aiko Sato', team: 'Research', email: 'aiko@aster.app' },
  { name: 'Dev Malhotra', team: 'Platform', email: 'dev@aster.app' },
  { name: 'Noor Haddad', team: 'Product', email: 'noor@aster.app' },
];

/** Stands in for a server: 650 ms away, cancellable, and sometimes unreachable. */
function searchDirectory(query: string, signal: AbortSignal, offline: boolean): Promise<Person[]> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (offline) {
        reject(new Error('offline'));
        return;
      }
      const q = query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      resolve(
        directory.filter((p) =>
          `${p.name} ${p.team} ${p.email}`
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .includes(q),
        ),
      );
    }, 650);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new Error('aborted'));
    });
  });
}

export function Example(): React.JSX.Element {
  const [query, setQuery] = React.useState('');
  const [people, setPeople] = React.useState<Person[]>([]);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [offline, setOffline] = React.useState(false);
  const inflight = React.useRef<AbortController | null>(null);

  function search(next: string): void {
    setQuery(next);
    inflight.current?.abort();
    const q = next.trim();
    if (!q) {
      setPeople([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    inflight.current = controller;
    setStatus('loading');
    searchDirectory(q, controller.signal, offline).then(
      (found) => {
        setPeople(found);
        setStatus('done');
      },
      () => {
        if (controller.signal.aborted) return;
        setPeople([]);
        setStatus('error');
      },
    );
  }

  return (
    <div style={{ display: 'grid', gap: 14, width: 'min(520px, 100%)' }}>
      <Command.Root filter={false} query={query} onQueryChange={search}>
        <Command.Input placeholder="Find people by name, team or email" />
        <Command.Loading loading={status === 'loading'}>Searching the directory…</Command.Loading>
        <Command.List>
          {people.length > 0 ? (
            <Command.Group label="People">
              {people.map((p) => (
                <Command.Item key={p.email} value={p.name}>
                  <Avatar.Root name={p.name} size={24} aria-hidden />
                  {p.name}
                  <Command.Detail>
                    {p.team} · {p.email}
                  </Command.Detail>
                </Command.Item>
              ))}
            </Command.Group>
          ) : null}
        </Command.List>
        <Command.Empty>
          {(q) =>
            status === 'error' ? (
              <>
                <b style={{ color: 'var(--hj-danger)' }}>
                  <Icon name="alert" size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                  Couldn’t reach the directory.
                </b>{' '}
                Check your connection, then type again to retry.
              </>
            ) : q ? (
              <>
                No one matches <b>“{q}”</b>. Try a first name, a team or an email.
              </>
            ) : (
              'Start typing to search 214 people at Aster.'
            )
          }
        </Command.Empty>
      </Command.Root>
      <Field.Root style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Switch.Root size="sm" checked={offline} onCheckedChange={setOffline} />
        <Field.Label>Simulate a dropped connection</Field.Label>
      </Field.Root>
    </div>
  );
}
