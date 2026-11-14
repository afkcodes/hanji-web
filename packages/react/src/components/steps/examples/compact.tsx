import { Steps } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 28, width: '100%', maxWidth: 360 }}>
      <Steps.Root value={2} total={5} aria-label="Import your library">
        <Steps.Count format={(v, t) => `Importing · ${v + 1} of ${t}`} />
        <Steps.Track />
      </Steps.Root>
      <Steps.Root value={3} total={3} aria-label="Export">
        <Steps.Count format={() => 'Export complete · 48 tracks'} />
        <Steps.Track />
      </Steps.Root>
    </div>
  );
}
