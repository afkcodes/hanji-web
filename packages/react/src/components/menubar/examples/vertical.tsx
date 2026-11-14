import { Menubar } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Menubar.Root orientation="vertical" style={{ width: 180 }}>
      <Menubar.Menu>
        <Menubar.Trigger style={{ textAlign: 'left' }}>Library</Menubar.Trigger>
        <Menubar.Content side="right" align="start">
          <Menubar.Item>Playlists</Menubar.Item>
          <Menubar.Item>Albums</Menubar.Item>
          <Menubar.Item>Artists</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger style={{ textAlign: 'left' }}>Downloads</Menubar.Trigger>
        <Menubar.Content side="right" align="start">
          <Menubar.Item>On this device · 4.2 GB</Menubar.Item>
          <Menubar.Item tone="danger">Remove all downloads</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu disabled>
        <Menubar.Trigger style={{ textAlign: 'left' }}>Shared (sign in)</Menubar.Trigger>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
