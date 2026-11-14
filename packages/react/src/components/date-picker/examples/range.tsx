import { DatePicker } from '@hanji/react';
import type { DateRange } from '@hanji/react';
import * as React from 'react';

const today = new Date();

export function Example(): React.JSX.Element {
  const [stay, setStay] = React.useState<DateRange>({ start: null, end: null });
  const nights =
    stay.start && stay.end
      ? Math.round((stay.end.getTime() - stay.start.getTime()) / 86_400_000)
      : 0;
  return (
    <div style={{ width: 320 }}>
      <DatePicker.Root
        mode="range"
        value={stay}
        onValueChange={setStay}
        min={today}
        locale="en-GB"
        name="stay"
      >
        <DatePicker.Label>Dates</DatePicker.Label>
        <DatePicker.Trigger placeholder="Add check-in and check-out" />
        <DatePicker.Content />
      </DatePicker.Root>
      <p
        style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--hj-fg-mute)' }}
        aria-live="polite"
      >
        {nights > 0
          ? `${nights} night${nights === 1 ? '' : 's'} · free cancellation until 48 h before`
          : 'Prices update when you add dates.'}
      </p>
    </div>
  );
}
