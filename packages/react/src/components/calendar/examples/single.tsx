import { Calendar } from '@hanji/react';
import * as React from 'react';

const today = new Date();
const inDays = (n: number): Date =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

export function Example(): React.JSX.Element {
  const [day, setDay] = React.useState<Date | null>(inDays(3));
  const label = day
    ? new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(
        day,
      )
    : 'No date chosen';
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
      <Calendar.Root
        value={day}
        onValueChange={setDay}
        min={today}
        max={inDays(90)}
        // Sundays are sold out.
        isDateDisabled={(d) => d.getDay() === 0}
      />
      <p style={{ margin: 0, fontSize: 13, color: 'var(--hj-fg-dim)' }} aria-live="polite">
        Delivery: <b style={{ color: 'var(--hj-fg)' }}>{label}</b> · Sundays are fully booked
      </p>
    </div>
  );
}
