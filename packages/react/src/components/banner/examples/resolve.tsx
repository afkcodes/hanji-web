import { Banner, Button, Toggle } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  const [retrying, setRetrying] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(520px, 100%)' }}>
      <Banner.Root tone="warning" open={open} onOpenChange={setOpen}>
        <Banner.Content>
          <Banner.Title>You’re offline</Banner.Title>
          <Banner.Description>
            Playing downloads only. 3 changes to your library will sync when you’re back.
          </Banner.Description>
          <Banner.Actions>
            <Button
              size="sm"
              variant="secondary"
              loading={retrying}
              onClick={() => {
                setRetrying(true);
                window.setTimeout(() => setRetrying(false), 1400);
              }}
            >
              Try again
            </Button>
          </Banner.Actions>
        </Banner.Content>
        <Banner.Dismiss />
      </Banner.Root>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '8px 8px 8px 16px',
          borderRadius: 12,
          boxShadow: 'inset 0 0 0 1px var(--hj-line)',
        }}
      >
        <span>Library · 1,284 songs</span>
        <Toggle size="sm" variant="outline" pressed={open} onPressedChange={setOpen}>
          Offline notice
        </Toggle>
      </div>
    </div>
  );
}
