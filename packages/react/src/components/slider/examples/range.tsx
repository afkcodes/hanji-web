import { Slider } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [years, setYears] = React.useState<number[]>([1994, 2011]);
  return (
    <div style={{ width: 380 }}>
      <Slider.Root
        value={years}
        onValueChange={(v) => setYears(v as number[])}
        min={1960}
        max={2026}
        minStepsBetweenValues={1}
      >
        <Slider.Label>Release year</Slider.Label>
        <Slider.Value>{() => `${years[0]} – ${years[1]}`}</Slider.Value>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb index={0} aria-label="From year" formatValue={String} />
            <Slider.Thumb index={1} aria-label="To year" formatValue={String} />
          </Slider.Track>
        </Slider.Control>
        <Slider.Marks
          min={1960}
          max={2026}
          values={[1960, 1980, 2000, 2026]}
          labels={['1960', '1980', '2000', '2026']}
        />
      </Slider.Root>
    </div>
  );
}
