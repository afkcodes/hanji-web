import { Progress } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 28, width: 'min(100%, 420px)' }}>
      <Progress.Root value={48.6} max={64} tone="fg">
        <Progress.Header>
          <Progress.Label>On this device</Progress.Label>
          <Progress.Value>{() => '48.6 of 64 GB'}</Progress.Value>
        </Progress.Header>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>

      <Progress.Root value={92} tone="danger">
        <Progress.Header>
          <Progress.Label>Offline storage</Progress.Label>
          <Progress.Value>{() => '92% · 1.2 GB free'}</Progress.Value>
        </Progress.Header>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>

      <Progress.Root value={null}>
        <Progress.Header>
          <Progress.Label>Syncing your library</Progress.Label>
          <Progress.Value>{() => 'Checking 1,284 songs'}</Progress.Value>
        </Progress.Header>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>

      <Progress.Root value={40} aria-label="Upload" />
    </div>
  );
}
