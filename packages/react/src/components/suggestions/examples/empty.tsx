import { Icon, Suggestions } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 560, justifyItems: 'start' }}>
      <Suggestions.Root onSelect={setSent}>
        <Suggestions.Item icon={<Icon name="sparkle" />}>
          Make a 40-minute running playlist
        </Suggestions.Item>
        <Suggestions.Item>What did I play most in October?</Suggestions.Item>
        <Suggestions.Item>Find songs like “Night Bus Home”</Suggestions.Item>
        <Suggestions.Item>Free up space on this phone</Suggestions.Item>
      </Suggestions.Root>
      <span style={{ fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>
        {sent ? `Sent: “${sent}”` : 'Tap a suggestion to send it.'}
      </span>
    </div>
  );
}
