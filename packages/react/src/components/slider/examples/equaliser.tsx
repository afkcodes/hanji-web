import { Button, Slider } from '@hanji/react';
import * as React from 'react';

const bands = ['60', '230', '910', '3.6k', '14k'];
const warm = [3, 1, -2, 2, 5];

export function Example(): React.JSX.Element {
  const [gains, setGains] = React.useState<number[]>(warm);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <div style={{ display: 'flex', gap: 18 }}>
        {bands.map((hz, i) => (
          <div key={hz} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
            <span className="hj-text-mono hj-tone-dim">
              {gains[i] && gains[i] > 0 ? '+' : ''}
              {gains[i]}
            </span>
            <Slider.Root
              orientation="vertical"
              min={-12}
              max={12}
              value={gains[i]}
              onValueChange={(v) => setGains((g) => g.map((x, j) => (j === i ? (v as number) : x)))}
              style={{ ['--hj-slider-length' as string]: '140px' }}
            >
              <Slider.Control>
                <Slider.Track>
                  <Slider.Indicator />
                  <Slider.Thumb
                    aria-label={`${hz} Hz`}
                    formatValue={(v) => `${v > 0 ? '+' : ''}${v} dB`}
                  />
                </Slider.Track>
              </Slider.Control>
            </Slider.Root>
            <span className="hj-text-mono hj-tone-mute">{hz}</span>
          </div>
        ))}
      </div>
      <Button size="sm" variant="secondary" onClick={() => setGains([0, 0, 0, 0, 0])}>
        Flat
      </Button>
    </div>
  );
}
