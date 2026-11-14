import { Icon, TabBar } from '@hanji/react';

const glyph = (d: string): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/** Active comes from the URL (your router), so items are links with `active`. */
export function Example(): React.JSX.Element {
  const path = '/queue';
  const items = [
    {
      href: '/listen',
      label: 'Listen',
      icon: glyph(
        'M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
      ),
    },
    {
      href: '/queue',
      label: 'Queue',
      icon: glyph('M21 15V6M12 12H3M16 6H3M12 18H3M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'),
      badge: true,
    },
    { href: '/search', label: 'Search', icon: <Icon name="search" /> },
    {
      href: '/settings',
      label: 'Settings',
      icon: glyph('M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1'),
    },
  ];
  return (
    <div
      style={{
        width: 360,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
      }}
    >
      <TabBar.Root aria-label="Player">
        {items.map((it) => (
          <TabBar.Item
            key={it.href}
            active={it.href === path}
            icon={it.icon}
            badge={it.badge}
            render={<a href={`#${it.href}`} />}
          >
            {it.label}
          </TabBar.Item>
        ))}
      </TabBar.Root>
    </div>
  );
}
