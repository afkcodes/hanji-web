import { Artwork, Button, Icon, List, SwipeActions, Text, Toast, useToast } from '@hanji/react';
import * as React from 'react';

// Not in the icon adapter: a bin on hanji's 24 grid at 1.5 stroke.
const TRASH =
  'M4 6.5h16M9.5 6.5v-2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 6.5l.8 12.1a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12.1M10 10.5v6M14 10.5v6';

interface Episode {
  id: string;
  title: string;
  show: string;
  size: string;
  length: string;
  failed?: boolean;
}

const EPISODES: Episode[] = [
  {
    id: 'e1',
    title: 'The Tide Tables',
    show: 'Harbour Notes · Noor Haddad',
    size: '48 MB',
    length: '41:12',
  },
  {
    id: 'e2',
    title: 'Salt, Smoke & Time',
    show: 'Kitchen Table · Tomás Reyes',
    size: '62 MB',
    length: '52:40',
  },
  {
    id: 'e3',
    title: 'Night Shift at the Observatory',
    show: 'Far Light · Aiko Sato',
    size: '21 MB',
    length: '18:05',
    failed: true,
  },
  {
    id: 'e4',
    title: 'Small Rooms, Big Sound',
    show: 'Studio B · Jun-seo Park',
    size: '55 MB',
    length: '47:31',
  },
];

function Downloads(): React.JSX.Element {
  const toast = useToast();
  const [episodes, setEpisodes] = React.useState(EPISODES);
  const remove = (e: Episode): void => {
    const at = episodes.findIndex((x) => x.id === e.id);
    setEpisodes((list) => list.filter((x) => x.id !== e.id));
    toast.show({
      title: 'Download deleted',
      description: `${e.title} · ${e.size} freed`,
      action: {
        label: 'Undo',
        onClick: () =>
          setEpisodes((list) =>
            list.some((x) => x.id === e.id)
              ? list
              : list.toSpliced(Math.min(at, list.length), 0, e),
          ),
      },
    });
  };

  return (
    <div
      style={{
        width: 'min(100%, 420px)',
        borderRadius: 'var(--hj-radius-lg)',
        background: 'var(--hj-surface)',
        border: '1px solid var(--hj-line)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '16px 16px 8px' }}>
        <Text variant="heading" style={{ flex: 1 }}>
          Downloads
        </Text>
        <Text variant="sub" tone="mute">
          {episodes.length} episodes
        </Text>
      </div>
      {episodes.length === 0 ? (
        <Text tone="mute" style={{ padding: '24px 16px 32px', textAlign: 'center' }}>
          No downloads. Episodes you save for offline show up here.
        </Text>
      ) : null}
      <SwipeActions.Group
        aria-label="Downloads"
        style={{
          ['--hj-swipe-actions-bg' as string]: 'var(--hj-surface)',
          ['--hj-swipe-actions-inset' as string]: '68px',
        }}
      >
        {episodes.map((e) => (
          <SwipeActions.Root key={e.id} label={e.title}>
            <SwipeActions.Content>
              <Artwork.Root id={e.show} size={40} />
              <List.Content>
                <List.Title>{e.title}</List.Title>
                {e.failed ? (
                  <List.Description style={{ color: 'var(--hj-danger)' }}>
                    <Icon name="alert" /> Download failed at 41%
                  </List.Description>
                ) : (
                  <List.Description>
                    {e.show} · {e.size}
                  </List.Description>
                )}
              </List.Content>
              {e.failed ? (
                <Button size="sm" variant="secondary">
                  Retry
                </Button>
              ) : (
                <List.Value>{e.length}</List.Value>
              )}
            </SwipeActions.Content>
            <SwipeActions.Trailing fullSwipe>
              <SwipeActions.Action
                tone="danger"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={TRASH} />
                  </svg>
                }
                removes
                onAction={() => remove(e)}
              >
                Delete
              </SwipeActions.Action>
            </SwipeActions.Trailing>
          </SwipeActions.Root>
        ))}
      </SwipeActions.Group>
    </div>
  );
}

export function Example(): React.JSX.Element {
  return (
    <Toast.Provider>
      <Downloads />
      <Toast.Viewport />
    </Toast.Provider>
  );
}
