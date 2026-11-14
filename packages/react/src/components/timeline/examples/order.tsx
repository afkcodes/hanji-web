import { Timeline } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Timeline.Root style={{ width: 'min(100%, 340px)', ['--hj-timeline-gap' as string]: '14px' }}>
      <Timeline.Item status="done">
        <Timeline.Title>Ordered vinyl — Saltmarsh</Timeline.Title>
        <Timeline.Time dateTime="2026-11-10">Mon 10 Nov</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item status="done">
        <Timeline.Title>Dispatched from Bristol</Timeline.Title>
        <Timeline.Time dateTime="2026-11-12">Wed 12 Nov</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item status="current">
        <Timeline.Title>Out for delivery</Timeline.Title>
        <Timeline.Time relative="arriving by 18:00">Today</Timeline.Time>
      </Timeline.Item>
      <Timeline.Item status="pending">
        <Timeline.Title>Delivered</Timeline.Title>
      </Timeline.Item>
    </Timeline.Root>
  );
}
