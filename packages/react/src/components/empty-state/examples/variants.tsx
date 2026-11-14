import { Button, EmptyState } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: 8,
        width: 'min(100%, 720px)',
      }}
    >
      <EmptyState.Root>
        <EmptyState.Glyph />
        <EmptyState.Title>No downloads yet</EmptyState.Title>
        <EmptyState.Description>
          Download a playlist and it will play here without a connection.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button size="sm">Browse playlists</Button>
        </EmptyState.Actions>
      </EmptyState.Root>

      <EmptyState.Root variant="no-results">
        <EmptyState.Glyph />
        <EmptyState.Title>No results for “saltmarch”</EmptyState.Title>
        <EmptyState.Description>
          Check the spelling, or search all of hanji instead of your library.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button size="sm" variant="secondary">
            Search everywhere
          </Button>
        </EmptyState.Actions>
      </EmptyState.Root>

      <EmptyState.Root variant="offline">
        <EmptyState.Glyph />
        <EmptyState.Title>You’re offline</EmptyState.Title>
        <EmptyState.Description>
          Downloaded music still plays. New releases load when you reconnect.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button size="sm" variant="secondary">
            Show downloads
          </Button>
        </EmptyState.Actions>
      </EmptyState.Root>

      <EmptyState.Root variant="error">
        <EmptyState.Glyph />
        <EmptyState.Title>Couldn’t load your library</EmptyState.Title>
        <EmptyState.Description>
          The server took too long to answer (error 504). Nothing on this device was changed.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button size="sm">Try again</Button>
          <Button size="sm" variant="quiet">
            Report it
          </Button>
        </EmptyState.Actions>
      </EmptyState.Root>
    </div>
  );
}
