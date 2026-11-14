import { Icon, Toolbar } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Toolbar.Root
        variant="plain"
        aria-label="Playlist actions"
        style={{
          display: 'flex',
          width: '100%',
          paddingBottom: 10,
          borderBottom: '1px solid var(--hj-line)',
        }}
      >
        <Toolbar.Input placeholder="Filter 48 tracks" aria-label="Filter tracks" />
        <Toolbar.Button>
          <Icon name="plus" /> Add songs
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="More actions">
          <Icon name="more" />
        </Toolbar.Button>
        <span style={{ flex: 1 }} />
        <Toolbar.Link href="#share">Share playlist</Toolbar.Link>
      </Toolbar.Root>
      <p className="hj-text-sub hj-tone-mute" style={{ margin: '10px 0 0' }}>
        Late Night Drive · 48 tracks · 3 h 12 min
      </p>
    </div>
  );
}
