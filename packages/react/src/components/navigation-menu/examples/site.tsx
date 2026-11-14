import { NavigationMenu } from '@hanji/react';

const listen = [
  {
    title: 'For you',
    description: 'Mixes and new releases from artists you follow.',
    href: '#for-you',
  },
  { title: 'Radio', description: 'Endless stations started from any song.', href: '#radio' },
  {
    title: 'Podcasts',
    description: '3 new episodes from Field Notes and Two Rooms.',
    href: '#podcasts',
  },
  { title: 'Charts', description: 'What 41 countries played this week.', href: '#charts' },
];
const library = [
  { title: 'Playlists', description: '24 playlists · 6 shared with you', href: '#playlists' },
  { title: 'Downloads', description: '312 songs · 4.2 GB on this device', href: '#downloads' },
  { title: 'History', description: 'Everything you played in the last 90 days', href: '#history' },
];

export function Example(): React.JSX.Element {
  return (
    <div
      style={{
        minHeight: 260,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <NavigationMenu.Root aria-label="Main">
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Listen</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  width: 480,
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                }}
              >
                {listen.map((l) => (
                  <li key={l.href}>
                    <NavigationMenu.Link href={l.href}>
                      <NavigationMenu.LinkTitle>{l.title}</NavigationMenu.LinkTitle>
                      <NavigationMenu.LinkDescription>
                        {l.description}
                      </NavigationMenu.LinkDescription>
                    </NavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Library</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul
                style={{
                  display: 'grid',
                  gap: 2,
                  width: 300,
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                }}
              >
                {library.map((l) => (
                  <li key={l.href}>
                    <NavigationMenu.Link href={l.href} active={l.title === 'Downloads'}>
                      <NavigationMenu.LinkTitle>{l.title}</NavigationMenu.LinkTitle>
                      <NavigationMenu.LinkDescription>
                        {l.description}
                      </NavigationMenu.LinkDescription>
                    </NavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link variant="item" href="#pricing">
              Pricing
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Surface />
      </NavigationMenu.Root>
    </div>
  );
}
