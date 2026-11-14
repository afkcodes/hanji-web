import { Meter } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 28, width: 'min(100%, 420px)' }}>
      <Meter.Root value={58.4} max={64} low={40} high={56} optimum={10}>
        <Meter.Header>
          <Meter.Label>Phone storage</Meter.Label>
          <Meter.Value>{() => '58.4 of 64 GB · nearly full'}</Meter.Value>
        </Meter.Header>
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>

      <Meter.Root value={23} low={20} high={60} optimum={90}>
        <Meter.Header>
          <Meter.Label>Headphones battery</Meter.Label>
          <Meter.Value>{() => '23% · about 2 h left'}</Meter.Value>
        </Meter.Header>
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>

      <Meter.Root value={-14} min={-30} max={0} low={-18} high={-10} optimum={-14}>
        <Meter.Header>
          <Meter.Label>Loudness</Meter.Label>
          <Meter.Value>{() => '−14 LUFS · on target'}</Meter.Value>
        </Meter.Header>
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  );
}
