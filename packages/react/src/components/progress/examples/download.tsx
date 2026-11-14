import { Progress } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [done, setDone] = React.useState(34);
  React.useEffect(() => {
    const id = window.setInterval(() => setDone((d) => (d >= 48 ? 12 : d + 1)), 900);
    return () => window.clearInterval(id);
  }, []);
  const left = ((48 - done) * 6.2).toFixed(0);
  return (
    <div style={{ display: 'grid', gap: 28, width: 'min(100%, 420px)' }}>
      <Progress.Root value={done} max={48} getAriaValueText={() => `${done} of 48 tracks`}>
        <Progress.Header>
          <Progress.Label>Downloading Late Night Drive</Progress.Label>
          <Progress.Value>{() => `${done} of 48 · ${left} MB left`}</Progress.Value>
        </Progress.Header>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>

      <Progress.Root value={100}>
        <Progress.Header>
          <Progress.Label>Field Recordings, Jeju</Progress.Label>
          <Progress.Value>{() => 'Downloaded · 212 MB'}</Progress.Value>
        </Progress.Header>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>

      <Progress.Root value={61} tone="danger">
        <Progress.Header>
          <Progress.Label>Sunday Paper</Progress.Label>
          <Progress.Value>{() => 'Stopped at 61% — no connection'}</Progress.Value>
        </Progress.Header>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
    </div>
  );
}
