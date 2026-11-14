import { Marquee, Slider } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [width, setWidth] = React.useState(220);
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start', width: 'min(480px, 100%)' }}>
      <Slider.Root
        value={width}
        min={140}
        max={480}
        step={4}
        onValueChange={(v) => setWidth(v as number)}
        style={{ width: 280 }}
      >
        <Slider.Label>Card width</Slider.Label>
        <Slider.Value>{() => `${width}px`}</Slider.Value>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb formatValue={(v) => `${v} pixels`} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <div
        style={{
          width,
          maxWidth: '100%',
          padding: '10px 12px',
          borderRadius: 12,
          background: 'var(--hj-surface)',
          boxShadow: 'inset 0 0 0 1px var(--hj-line)',
        }}
      >
        <Marquee style={{ fontSize: 15, fontWeight: 500 }}>
          Kōya Lanes — Field Recordings, Jeju (side B)
        </Marquee>
      </div>
    </div>
  );
}
