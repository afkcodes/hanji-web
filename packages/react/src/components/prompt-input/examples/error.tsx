import { PromptInput } from '@hanji/react';
import type { PromptStatus } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [status, setStatus] = React.useState<PromptStatus>('error');
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <PromptInput.Root
        status={status}
        defaultValue="Make a 40-minute running playlist from my liked songs, 165–175 BPM"
        clearOnSubmit={false}
        onSubmit={() => {
          setStatus('submitting');
          window.setTimeout(() => setStatus('error'), 900);
        }}
      >
        <PromptInput.Textarea aria-label="Message" />
        <PromptInput.Error>
          Couldn’t reach the assistant — you’re offline. Your message is kept; send it again when
          you’re back.
        </PromptInput.Error>
        <PromptInput.Toolbar>
          <PromptInput.Attach />
          <PromptInput.Submit label="Send again" />
        </PromptInput.Toolbar>
      </PromptInput.Root>
    </div>
  );
}
