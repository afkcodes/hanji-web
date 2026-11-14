import { Command, Icon, Kbd } from '@hanji/react';
import * as React from 'react';

const recent = [
  { title: 'Q3 pricing memo', who: 'Mira Okafor', when: '2h' },
  { title: 'Onboarding flow v4', who: 'Jun-seo Park', when: 'Yesterday' },
  { title: 'Berlin offsite budget', who: 'Ilse Brandt', when: 'Mon' },
];
const themes = ['Paper', 'Ink', 'Sand', 'Match system'];

export function Example(): React.JSX.Element {
  const [query, setQuery] = React.useState('');
  const [theme, setTheme] = React.useState('Paper');
  const [ran, setRan] = React.useState('Nothing run yet');
  const q = query.trim();

  return (
    <div style={{ width: 'min(560px, 100%)' }}>
      <Command.Root query={query} onQueryChange={setQuery}>
        <Command.Input placeholder="Search files, pages and commands…" />
        <Command.List>
          <Command.Group label="Recent">
            {recent.map((r) => (
              <Command.Item
                key={r.title}
                keywords={[r.who]}
                onSelect={() => setRan(`Opened ${r.title}`)}
              >
                {r.title}
                <Command.Detail>
                  {r.who} · {r.when}
                </Command.Detail>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Separator />
          <Command.Group label="Go to">
            <Command.Item keywords={['mail', 'messages']} onSelect={() => setRan('Went to Inbox')}>
              Inbox
              <Command.Shortcut keys={['G', 'I']} />
            </Command.Item>
            <Command.Item onSelect={() => setRan('Went to Projects')}>
              Projects
              <Command.Shortcut keys={['G', 'P']} />
            </Command.Item>
            <Command.Item
              keywords={['preferences', 'account', 'profile']}
              onSelect={() => setRan('Opened Settings')}
            >
              Settings
              <Command.Shortcut keys={['mod', ',']} />
            </Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group label="Actions">
            <Command.Item keywords={['create', 'write']} onSelect={() => setRan('New document')}>
              New document
              <Command.Shortcut keys={['mod', 'N']} />
            </Command.Item>
            <Command.Item keywords={['share', 'url']} onSelect={() => setRan('Link copied')}>
              Copy link to page
              <Command.Shortcut keys={['mod', 'shift', 'C']} />
            </Command.Item>
            <Command.Item keywords={['appearance', 'dark mode', 'colours']} page="theme">
              Change theme…
              <Command.Detail>{theme}</Command.Detail>
            </Command.Item>
            <Command.Item disabled keywords={['download', 'backup']}>
              Export workspace
              <Command.Detail>Admins only</Command.Detail>
            </Command.Item>
          </Command.Group>
          {q ? (
            <Command.Group label="hanji">
              <Command.Item forceMount onSelect={() => setRan(`Asked hanji about “${q}”`)}>
                <Icon name="sparkle" size={18} style={{ color: 'var(--hj-accent)' }} />
                <span>
                  Ask hanji about <b>“{q}”</b>
                </span>
              </Command.Item>
            </Command.Group>
          ) : null}
          <Command.Page id="theme" label="Theme" placeholder="Pick a theme…">
            {themes.map((t) => (
              <Command.Item
                key={t}
                onSelect={() => {
                  setTheme(t);
                  setRan(`Theme set to ${t}`);
                }}
              >
                {t}
                {t === theme ? (
                  <Command.Detail>
                    <Icon name="check" size={16} label="Current" />
                  </Command.Detail>
                ) : null}
              </Command.Item>
            ))}
          </Command.Page>
        </Command.List>
        <Command.Empty>
          {(text) => (
            <>
              No commands match <b>“{text}”</b>. Try a page name, or ask hanji above.
            </>
          )}
        </Command.Empty>
        <Command.Footer>
          <span>
            <Kbd size="sm">↑</Kbd>
            <Kbd size="sm">↓</Kbd> move
          </span>
          <span>
            <Kbd size="sm">↵</Kbd> run
          </span>
          <span>
            <Kbd size="sm">esc</Kbd> back
          </span>
          <output style={{ marginLeft: 'auto', color: 'var(--hj-fg-dim)' }}>{ran}</output>
        </Command.Footer>
      </Command.Root>
    </div>
  );
}
