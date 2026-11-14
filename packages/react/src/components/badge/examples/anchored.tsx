import { Avatar, Badge, Button, Icon } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Badge.Anchor>
        <Button iconOnly variant="secondary" aria-label="Notifications, 4 unread">
          <Icon name="info" />
        </Button>
        <Badge.Root count={4} />
      </Badge.Anchor>
      <Badge.Anchor shape="circle">
        <Avatar.Root name="Mira Okafor" size={40} />
        <Badge.Root count={12} label="12 messages from Mira" />
      </Badge.Anchor>
      <Badge.Anchor shape="circle" placement="bottom-end">
        <Avatar.Root name="Jun-seo Park" size={40} />
        <Badge.Root dot tone="danger" label="Needs attention" />
      </Badge.Anchor>
    </div>
  );
}
