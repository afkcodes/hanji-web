import { Status, Text } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Status tone="success" meta="2 min ago">
          Synced
        </Status>
        <Status tone="pending" meta="14 of 32">
          Syncing
        </Status>
        <Status tone="warning">Storage 92% full</Status>
        <Status tone="danger" meta="09:14">
          Couldn’t sync
        </Status>
        <Status tone="info">Update ready</Status>
        <Status>Draft</Status>
      </div>
      <Text tone="dim">
        Your library is{' '}
        <Status tone="success" variant="plain">
          up to date
        </Status>{' '}
        on this device.
      </Text>
    </div>
  );
}
