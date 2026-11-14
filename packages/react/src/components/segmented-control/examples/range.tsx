import { SegmentedControl } from '@hanji/react';
import * as React from 'react';

const minutes: Record<string, string> = {
  day: '2 h 47 min',
  week: '19 h 12 min',
  month: '81 h',
  year: '912 h',
};

export function Example(): React.JSX.Element {
  const [range, setRange] = React.useState('week');
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <SegmentedControl.Root
        aria-label="Range"
        value={range}
        onValueChange={(v) => setRange(v as string)}
      >
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
        <SegmentedControl.Item value="month">This month</SegmentedControl.Item>
        <SegmentedControl.Item value="year">Year</SegmentedControl.Item>
      </SegmentedControl.Root>
      <span className="hj-text-sub hj-tone-mute">
        Listened: <span className="hj-tabular">{minutes[range]}</span>
      </span>
    </div>
  );
}
