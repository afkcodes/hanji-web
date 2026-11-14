import { Button, Icon, Popover } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 500 }}>
      Streaming quality: Lossless
      <Popover.Root>
        <Popover.Trigger
          render={<Button size="sm" variant="quiet" iconOnly aria-label="About Lossless" />}
        >
          <Icon name="info" size={18} />
        </Popover.Trigger>
        <Popover.Content arrow side="top">
          <Popover.Title>Lossless</Popover.Title>
          <Popover.Description>
            CD quality, about 1.4 GB an hour. On mobile data hanji drops to High (about 150 MB an
            hour) unless you allow it in Settings.
          </Popover.Description>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
