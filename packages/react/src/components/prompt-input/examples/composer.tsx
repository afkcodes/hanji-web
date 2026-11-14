import { PromptInput } from '@hanji/react';
import type { PromptStatus } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [status, setStatus] = React.useState<PromptStatus>('idle');
  const [last, setLast] = React.useState<string | null>(null);
  const timer = React.useRef(0);
  const send = (prompt: string): void => {
    setLast(prompt);
    setStatus('submitting');
    timer.current = window.setTimeout(() => {
      setStatus('streaming');
      timer.current = window.setTimeout(() => setStatus('idle'), 2600);
    }, 500);
  };
  const stop = (): void => {
    window.clearTimeout(timer.current);
    setStatus('idle');
  };
  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'grid', gap: 10 }}>
      <PromptInput.Root status={status} onSubmit={send} onStop={stop}>
        <PromptInput.Textarea placeholder="Ask about your library — “what did I play most in June?”" />
        <PromptInput.Toolbar>
          <PromptInput.Attach accept="image/*,.pdf,.txt" />
          <PromptInput.Hint>⏎ send · ⇧⏎ new line</PromptInput.Hint>
          <PromptInput.Count max={2000} style={{ marginLeft: 'auto' }} />
          <PromptInput.Submit style={{ marginLeft: 8 }} />
        </PromptInput.Toolbar>
      </PromptInput.Root>
      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>
        {status === 'streaming'
          ? 'Replying… press the square to stop.'
          : last
            ? `Sent: “${last}”`
            : 'Nothing sent yet.'}
      </p>
    </div>
  );
}
