import { Button, ToolCall } from '@hanji/react';
import type { ToolCallStatus } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [status, setStatus] = React.useState<ToolCallStatus>('needs-approval');
  const word = status === 'failed' ? 'Denied' : undefined;
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <ToolCall.Root status={status}>
        <ToolCall.Trigger>
          <ToolCall.Name>store.purchase</ToolCall.Name>
          <ToolCall.Status>{word}</ToolCall.Status>
        </ToolCall.Trigger>
        <ToolCall.Panel>
          <ToolCall.Section label="Arguments">
            <ToolCall.Code
              value={{
                item: 'Saltmarsh — Ilse Brandt (24-bit FLAC)',
                price: '£9.99',
                card: '•••• 4417',
              }}
            />
          </ToolCall.Section>
          {status === 'needs-approval' ? (
            <ToolCall.Approval>
              <span>
                Buy <b>Saltmarsh</b> for <b>£9.99</b> on the card ending 4417? The assistant won’t
                do this without you.
              </span>
              <Button size="sm" variant="secondary" onClick={() => setStatus('failed')}>
                Deny
              </Button>
              <Button size="sm" onClick={() => setStatus('done')}>
                Approve £9.99
              </Button>
            </ToolCall.Approval>
          ) : (
            <ToolCall.Section label="Result">
              <ToolCall.Code>
                {status === 'done'
                  ? 'Purchased. Receipt sent to mira.okafor@example.com.'
                  : 'You denied this. Nothing was charged.'}
              </ToolCall.Code>
            </ToolCall.Section>
          )}
        </ToolCall.Panel>
      </ToolCall.Root>
    </div>
  );
}
