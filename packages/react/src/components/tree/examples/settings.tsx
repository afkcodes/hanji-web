import { Badge, Icon, Text, Tree } from '@hanji/react';
import type { IconName } from '@hanji/react';
import * as React from 'react';

interface Page {
  id: string;
  title: string;
  detail: string;
  meta?: React.ReactNode;
  disabled?: boolean;
}
interface Section {
  id: string;
  title: string;
  icon: IconName;
  pages: Page[];
}

const SECTIONS: Section[] = [
  {
    id: 'general',
    title: 'General',
    icon: 'tool',
    pages: [
      { id: 'profile', title: 'Profile', detail: 'Mira Okafor · mira@okafor.studio' },
      { id: 'language', title: 'Language & region', detail: 'English (UK) · 24-hour clock' },
      {
        id: 'storage',
        title: 'Storage',
        detail: '12.4 GB of 50 GB used — 3,182 downloads kept offline.',
        meta: '12.4 GB',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'info',
    pages: [
      {
        id: 'email',
        title: 'Email',
        detail: 'Weekly digest on Mondays, new releases as they land.',
      },
      { id: 'push', title: 'Push', detail: 'Mentions and replies only.' },
      {
        id: 'quiet',
        title: 'Quiet hours',
        detail: 'Notifications pause from 22:00 to 07:00 every day.',
        meta: '22:00–07:00',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & safety',
    icon: 'eyeOff',
    pages: [
      {
        id: 'visibility',
        title: 'Profile visibility',
        detail: 'Followers can see your listening.',
      },
      {
        id: 'blocked',
        title: 'Blocked accounts',
        detail: 'Jun-seo Park, Dev Malhotra and Tomás Reyes can’t message or follow you.',
        meta: <Badge.Root count={3} tone="neutral" label="3 blocked" />,
      },
      { id: 'export', title: 'Export your data', detail: 'Last export 2 November · 184 MB.' },
    ],
  },
  {
    id: 'labs',
    title: 'Labs',
    icon: 'sparkle',
    pages: [
      {
        id: 'shuffle',
        title: 'Smart shuffle',
        detail: 'Mixes in tracks like the ones you skip less.',
      },
      {
        id: 'lyrics',
        title: 'Lyrics sync',
        detail: 'Not available on the Family plan yet.',
        meta: 'Soon',
        disabled: true,
      },
    ],
  },
];

const PAGES = new Map(
  SECTIONS.flatMap((s) => s.pages.map((p) => [p.id, { ...p, section: s.title }] as const)),
);

export function Example(): React.JSX.Element {
  const [selected, setSelected] = React.useState<readonly string[]>(['quiet']);
  const [expanded, setExpanded] = React.useState<readonly string[]>(['notifications', 'labs']);
  const page = PAGES.get(selected[0] ?? '');
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 240px) minmax(0, 1fr)',
        width: '100%',
        maxWidth: 640,
        minHeight: 360,
        borderRadius: 16,
        background: 'var(--hj-surface)',
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
        overflow: 'hidden',
      }}
    >
      <nav style={{ padding: 6, borderRight: '1px solid var(--hj-line)' }}>
        <Tree.Root
          aria-label="Settings"
          // children's labels line up under their section's label (icon column + gap)
          style={{ ['--hj-tree-indent' as string]: '24px' }}
          selected={selected}
          onSelectedChange={(next) => {
            // Sections only open; pages are what you select.
            const id = next.at(-1);
            if (id && PAGES.has(id)) setSelected([id]);
          }}
          expanded={expanded}
          onExpandedChange={setExpanded}
        >
          {SECTIONS.map((s) => (
            <Tree.Item key={s.id} id={s.id}>
              <Tree.Icon>
                <Icon name={s.icon} size={18} />
              </Tree.Icon>
              <Tree.Label>{s.title}</Tree.Label>
              <Tree.Group>
                {s.pages.map((p) => (
                  <Tree.Item key={p.id} id={p.id} disabled={p.disabled}>
                    <Tree.Label>{p.title}</Tree.Label>
                    {p.meta ? <Tree.Meta>{p.meta}</Tree.Meta> : null}
                  </Tree.Item>
                ))}
              </Tree.Group>
            </Tree.Item>
          ))}
        </Tree.Root>
      </nav>
      <section style={{ padding: '20px 24px', display: 'grid', alignContent: 'start', gap: 6 }}>
        <Text variant="eyebrow" tone="mute">
          {page?.section ?? 'Settings'}
        </Text>
        <Text variant="title">{page?.title ?? 'Choose a page'}</Text>
        <Text tone="dim">{page?.detail ?? 'Pick something on the left.'}</Text>
      </section>
    </div>
  );
}
