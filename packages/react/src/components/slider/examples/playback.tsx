import { Slider } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [crossfade, setCrossfade] = React.useState(6);
  const [volume, setVolume] = React.useState(40);
  const [speaker, setSpeaker] = React.useState(40);
  const pending = volume !== speaker;
  return (
    <div style={{ display: 'grid', gap: 18, width: 380 }}>
      <Slider.Root
        value={crossfade}
        onValueChange={(v) => setCrossfade(v as number)}
        min={0}
        max={12}
      >
        <Slider.Label>Crossfade</Slider.Label>
        <Slider.Value>{() => (crossfade ? `${crossfade} s` : 'Off')}</Slider.Value>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb formatValue={(v) => (v ? `${v} s` : 'Off')} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <Slider.Root
        value={volume}
        pending={pending}
        onValueChange={(v) => setVolume(v as number)}
        onValueCommitted={(v) => window.setTimeout(() => setSpeaker(v as number), 900)}
      >
        <Slider.Label>Living Room · volume</Slider.Label>
        <Slider.Value>
          {() => (pending ? `Setting ${volume}%…` : `Speaker at ${speaker}%`)}
        </Slider.Value>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb formatValue={(v) => `${v}%`} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <Slider.Root defaultValue={30} disabled>
        <Slider.Label>Normalise loudness</Slider.Label>
        <Slider.Value>{() => 'Off · needs Normalise volume'}</Slider.Value>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
