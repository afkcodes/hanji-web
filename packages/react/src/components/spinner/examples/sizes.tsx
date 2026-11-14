import { Button, Spinner, Text } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Text
        variant="sub"
        tone="dim"
        style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
      >
        <Spinner size="sm" tone="current" /> Fetching lyrics…
      </Text>
      <Button variant="secondary" size="sm" aria-busy="true">
        <Spinner size="sm" tone="current" label="Syncing" /> Syncing 14 of 32
      </Button>
    </div>
  );
}
