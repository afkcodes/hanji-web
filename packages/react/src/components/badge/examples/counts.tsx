import { Badge, Button, Text } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [n, setN] = React.useState(3);
  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Badge.Root count={1} />
        <Badge.Root count={12} />
        <Badge.Root count={240} label="240 unread" />
        <Badge.Root dot label="New releases" />
        <Badge.Root count={2} tone="danger" label="2 failed downloads" />
        <Badge.Root count={48} tone="neutral" />
        <Badge.Root count={0} />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Text>Queue</Text>
        <Badge.Root count={n} label={`${n} in queue`} showZero />
        <Button size="sm" variant="secondary" onClick={() => setN((v) => v + 1)}>
          Add one
        </Button>
        <Button size="sm" variant="quiet" onClick={() => setN(0)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
