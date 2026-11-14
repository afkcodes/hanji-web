import { ProgressRing } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
        <ProgressRing.Root value={76} size="lg" aria-label="Storage used" />
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>
          48.6 of 64 GB used
        </div>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
        <ProgressRing.Root value={4} max={5} size="lg" tone="fg" aria-label="Weekly goal">
          <ProgressRing.Value>{() => '4 of 5'}</ProgressRing.Value>
        </ProgressRing.Root>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>
          Listening days this week
        </div>
      </div>
    </div>
  );
}
