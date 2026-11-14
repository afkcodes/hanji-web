import { ContextMenu, Icon } from '@hanji/react';

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: 380,
  padding: '10px 12px',
  borderRadius: 12,
  background: 'var(--hj-surface)',
  boxShadow: 'inset 0 0 0 1px var(--hj-line)',
};
const art: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  background: 'linear-gradient(140deg, var(--hj-data-3), var(--hj-data-6))',
};

export function Example(): React.JSX.Element {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger style={row}>
        <span style={art} />
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontWeight: 600 }}>The Long Way Round the Harbour</span>
          <span style={{ fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>Ilse Brandt · 4:07</span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--hj-fg-mute)' }}>Right-click</span>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>
          <Icon name="plus" /> Play next <ContextMenu.Shortcut>⇧↵</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item>
          <Icon name="copy" /> Copy song link
        </ContextMenu.Item>
        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger>Go to</ContextMenu.SubmenuTrigger>
          <ContextMenu.Content>
            <ContextMenu.Item>Artist — Ilse Brandt</ContextMenu.Item>
            <ContextMenu.Item>Album — Saltmarsh</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.SubmenuRoot>
        <ContextMenu.Separator />
        <ContextMenu.Item tone="danger">
          <Icon name="x" /> Remove from this playlist
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
