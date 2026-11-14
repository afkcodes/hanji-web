import { Button, Command, Icon, Kbd, Text } from '@hanji/react';
import * as React from 'react';

const issues = [
  { id: 'AST-412', title: 'Checkout fails on Safari 17', who: 'Dev Malhotra' },
  { id: 'AST-398', title: 'Invite email lands in spam', who: 'Noor Haddad' },
  { id: 'AST-377', title: 'Export drops time zones', who: 'Aiko Sato' },
];
const statuses = ['Backlog', 'Todo', 'In progress', 'In review', 'Done', 'Canceled'];

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [ran, setRan] = React.useState<string | null>(null);
  const q = query.trim();
  const run = (what: string) => () => setRan(what);

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Icon name="search" size={18} />
        Search or jump to…
        <Command.Shortcut keys={['mod', 'K']} />
      </Button>
      <Text variant="sub" tone="mute" render={<output />}>
        {ran ?? 'Press the shortcut anywhere on this page. Escape steps back, then closes.'}
      </Text>

      <Command.Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        query={query}
        onQueryChange={setQuery}
      >
        <Command.Input placeholder="Search Aster…" />
        <Command.List>
          <Command.Group label="Go to">
            <Command.Item onSelect={run('Went to Inbox')}>
              Inbox
              <Command.Shortcut keys={['G', 'I']} />
            </Command.Item>
            <Command.Item keywords={['assigned', 'mine']} onSelect={run('Went to My issues')}>
              My issues
              <Command.Shortcut keys={['G', 'M']} />
            </Command.Item>
            <Command.Item keywords={['plan', 'timeline']} onSelect={run('Went to Roadmap')}>
              Roadmap
              <Command.Shortcut keys={['G', 'R']} />
            </Command.Item>
          </Command.Group>
          <Command.Group label="Issues">
            {issues.map((i) => (
              <Command.Item
                key={i.id}
                value={`${i.id} ${i.title}`}
                keywords={[i.who]}
                onSelect={run(`Opened ${i.id}`)}
              >
                {i.title}
                <Command.Detail>
                  {i.id} · {i.who.split(' ')[0]}
                </Command.Detail>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group label="Actions">
            <Command.Item keywords={['new', 'bug', 'ticket']} onSelect={run('Created an issue')}>
              Create issue
              <Command.Shortcut keys={['C']} />
            </Command.Item>
            <Command.Item keywords={['assignee', 'take']} onSelect={run('Assigned to you')}>
              Assign to me
              <Command.Shortcut keys={['I']} />
            </Command.Item>
            <Command.Item keywords={['state', 'move']} page="status">
              Change status…
            </Command.Item>
          </Command.Group>
          {q ? (
            <Command.Group label="hanji">
              <Command.Item forceMount onSelect={run(`Asked hanji about “${q}”`)}>
                <Icon name="sparkle" size={18} style={{ color: 'var(--hj-accent)' }} />
                <span>
                  Ask hanji about <b>“{q}”</b>
                </span>
              </Command.Item>
            </Command.Group>
          ) : null}
          <Command.Page id="status" label="Status" placeholder="Move AST-412 to…">
            {statuses.map((s) => (
              <Command.Item key={s} onSelect={run(`Status set to ${s}`)}>
                {s}
              </Command.Item>
            ))}
          </Command.Page>
        </Command.List>
        <Command.Empty />
        <Command.Footer>
          <span>
            <Kbd size="sm">↵</Kbd> run
          </span>
          <span>
            <Kbd size="sm">esc</Kbd> back · close
          </span>
          <span style={{ marginLeft: 'auto' }}>
            <Command.Shortcut keys={['mod', 'K']} /> toggle
          </span>
        </Command.Footer>
      </Command.Dialog>
    </div>
  );
}
