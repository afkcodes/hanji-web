import { Calendar } from '@hanji/react';
import type { DateRange } from '@hanji/react';
import * as React from 'react';

const today = new Date();
const inDays = (n: number): Date =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

export function Example(): React.JSX.Element {
  const [stay, setStay] = React.useState<DateRange>({ start: inDays(6), end: inDays(10) });
  const nights =
    stay.start && stay.end
      ? Math.round((stay.end.getTime() - stay.start.getTime()) / 86_400_000)
      : 0;
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
      <Calendar.Root mode="range" value={stay} onValueChange={setStay} min={today} locale="en-GB" />
      <p style={{ margin: 0, fontSize: 13, color: 'var(--hj-fg-dim)' }} aria-live="polite">
        {stay.start && !stay.end
          ? 'Now pick your check-out day'
          : nights > 0
            ? `${nights} night${nights === 1 ? '' : 's'} · pay nothing until check-in`
            : 'Pick your check-in day'}
      </p>
    </div>
  );
}
