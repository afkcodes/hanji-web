import { Button, Toast, useToast } from '@hanji/react';
import * as React from 'react';

function Tracks(): React.JSX.Element {
  const toast = useToast();
  const [tracks, setTracks] = React.useState(['Paper Lanterns', 'Night Bus Home', 'Saltmarsh']);
  const remove = (t: string): void => {
    const before = tracks;
    setTracks(tracks.filter((x) => x !== t));
    toast.show({
      title: `Removed “${t}”`,
      description: 'From Late Night Drive',
      action: { label: 'Undo', onClick: () => setTracks(before) },
    });
  };
  return (
    <div style={{ display: 'grid', gap: 10, width: 360 }}>
      {tracks.map((t) => (
        <div
          key={t}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span style={{ fontWeight: 500 }}>{t}</span>
          <Button size="sm" variant="quiet" onClick={() => remove(t)}>
            Remove
          </Button>
        </div>
      ))}
      {tracks.length === 0 ? (
        <span style={{ color: 'var(--hj-fg-mute)', fontSize: 13.5 }}>Playlist is empty.</span>
      ) : null}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => toast.success('Saved offline', { description: '48 tracks · 212 MB' })}
        >
          Success
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() =>
            toast.danger('Couldn’t sync 3 tracks', {
              description: 'Check your connection and try again.',
              action: { label: 'Retry', onClick: () => toast.success('Synced') },
            })
          }
        >
          Failure
        </Button>
      </div>
    </div>
  );
}

export function Example(): React.JSX.Element {
  return (
    <Toast.Provider>
      <Tracks />
      <Toast.Viewport />
    </Toast.Provider>
  );
}
