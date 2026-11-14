import { Button, Message } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [retrying, setRetrying] = React.useState(false);
  return (
    <div style={{ width: '100%', maxWidth: 620, display: 'grid', gap: 20 }}>
      <Message.Root from="user">
        <Message.Content>Summarise my listening for October.</Message.Content>
      </Message.Root>
      <Message.Root from="assistant" status="error">
        <Message.Avatar>한</Message.Avatar>
        <Message.Error
          action={
            <Button
              size="sm"
              variant="secondary"
              loading={retrying}
              onClick={() => {
                setRetrying(true);
                window.setTimeout(() => setRetrying(false), 1400);
              }}
            >
              Retry
            </Button>
          }
        >
          The reply stopped halfway — the connection dropped at 08:14. Nothing was saved.
        </Message.Error>
      </Message.Root>

      <Message.Root from="user">
        <Message.Content>Download Ilse Brandt’s album from a free site for me.</Message.Content>
      </Message.Root>
      <Message.Root from="assistant">
        <Message.Avatar>한</Message.Avatar>
        <Message.Content>
          I can’t help find unlicensed copies. “Saltmarsh” is in your library, though — I can
          download it for offline listening (212 MB) if you like.
        </Message.Content>
      </Message.Root>
    </div>
  );
}
