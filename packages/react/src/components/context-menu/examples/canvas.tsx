import { ContextMenu } from '@hanji/react';

const area: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 420,
  height: 180,
  borderRadius: 16,
  border: '1px dashed color-mix(in srgb, var(--hj-fg) 22%, transparent)',
  color: 'var(--hj-fg-mute)',
  fontSize: 13.5,
  textAlign: 'center',
};

export function Example(): React.JSX.Element {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger style={area}>
        No playlists in this folder yet.
        <br />
        Right-click or long-press to add one.
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.GroupLabel>Folder · Road trips</ContextMenu.GroupLabel>
          <ContextMenu.Item>New playlist</ContextMenu.Item>
          <ContextMenu.Item>New folder</ContextMenu.Item>
          <ContextMenu.Item disabled>Paste (nothing copied)</ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
