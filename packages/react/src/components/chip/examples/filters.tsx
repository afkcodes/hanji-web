import { Button, Chip, Text } from '@hanji/react';
import * as React from 'react';

const RESULTS: Record<string, number> = {
  albums: 214,
  playlists: 58,
  artists: 131,
  downloaded: 46,
};

export function Example(): React.JSX.Element {
  const [value, setValue] = React.useState<string[]>(['albums']);
  const total = value.reduce((t, v) => t + (RESULTS[v] ?? 0), 0);
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'start' }}>
      <Chip.Group multiple value={value} onValueChange={setValue} aria-label="Filter your library">
        <Chip.Root value="albums">Albums</Chip.Root>
        <Chip.Root value="playlists">Playlists</Chip.Root>
        <Chip.Root value="artists">Artists</Chip.Root>
        <Chip.Root value="downloaded">Downloaded</Chip.Root>
        <Chip.Root value="podcasts" disabled title="No podcasts in your library yet">
          Podcasts
        </Chip.Root>
      </Chip.Group>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Text variant="sub" tone="mute" aria-live="polite">
          {value.length
            ? `${value.length} filter${value.length > 1 ? 's' : ''} · ${total} results`
            : 'No filters · 449 results'}
        </Text>
        {value.length ? (
          <Button size="sm" variant="quiet" onClick={() => setValue([])}>
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
