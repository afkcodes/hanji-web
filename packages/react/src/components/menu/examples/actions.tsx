import { Button, Icon, Menu } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: 360 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>Late Night Drive</div>
        <div style={{ fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>48 tracks · 3 h 12 min</div>
      </div>
      <Menu.Root>
        <Menu.Trigger
          render={<Button variant="quiet" iconOnly aria-label="More for Late Night Drive" />}
        >
          <Icon name="more" />
        </Menu.Trigger>
        <Menu.Content align="end">
          <Menu.Item>
            <Icon name="plus" /> Add to queue <Menu.Shortcut>⌘Q</Menu.Shortcut>
          </Menu.Item>
          <Menu.Item>
            <Icon name="copy" /> Copy link <Menu.Shortcut>⌘L</Menu.Shortcut>
          </Menu.Item>
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger>
              <Icon name="paperclip" /> Add to playlist
            </Menu.SubmenuTrigger>
            <Menu.Content>
              <Menu.Item>Sunday, slowly</Menu.Item>
              <Menu.Item>Run Club</Menu.Item>
              <Menu.Item>Field Recordings, Jeju</Menu.Item>
              <Menu.Separator />
              <Menu.Item>
                <Icon name="plus" /> New playlist…
              </Menu.Item>
            </Menu.Content>
          </Menu.SubmenuRoot>
          <Menu.Item disabled>
            <Icon name="arrowUp" /> Download (needs Wi-Fi)
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item tone="danger">
            <Icon name="x" /> Delete playlist
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </div>
  );
}
