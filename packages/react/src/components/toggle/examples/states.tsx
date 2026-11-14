import { Toggle } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [muted, setMuted] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <Toggle
        variant="outline"
        pressed={muted}
        onPressedChange={setMuted}
        aria-label="Mute notifications"
      >
        {muted ? 'Notifications muted' : 'Mute notifications'}
      </Toggle>
      <span className="hj-text-sub hj-tone-mute">
        {muted ? 'Muted until 08:00 tomorrow' : 'You’ll hear about new releases and replies'}
      </span>
    </div>
  );
}
