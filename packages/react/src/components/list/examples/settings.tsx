import { Icon, List } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <List.Root style={{ width: 'min(100%, 420px)' }}>
      <List.Item render={<a href="#account" />}>
        <List.Leading variant="avatar">MO</List.Leading>
        <List.Content>
          <List.Title>Mira Okafor</List.Title>
          <List.Description>Family plan · renews 2 Dec</List.Description>
        </List.Content>
        <List.Trailing>
          <List.Chevron />
        </List.Trailing>
      </List.Item>
      <List.Item render={<a href="#storage" />}>
        <List.Leading variant="icon" tone="warning">
          <Icon name="alert" />
        </List.Leading>
        <List.Content>
          <List.Title>Storage</List.Title>
          <List.Description>92% full · 1.2 GB free</List.Description>
        </List.Content>
        <List.Trailing>
          <List.Value>58.8 GB</List.Value>
          <List.Chevron />
        </List.Trailing>
      </List.Item>
      <List.Item render={<a href="#quality" />}>
        <List.Leading variant="icon" tone="accent">
          <Icon name="sparkle" />
        </List.Leading>
        <List.Content>
          <List.Title>Streaming quality</List.Title>
          <List.Description>Lossless on Wi-Fi, High on mobile data</List.Description>
        </List.Content>
        <List.Trailing>
          <List.Value>320 kbps</List.Value>
          <List.Chevron />
        </List.Trailing>
      </List.Item>
      <List.Item>
        <List.Leading variant="icon" tone="success">
          <Icon name="checkCircle" />
        </List.Leading>
        <List.Content>
          <List.Title>Last backup</List.Title>
          <List.Description>Library and playlists</List.Description>
        </List.Content>
        <List.Trailing>
          <List.Value>Today, 07:42</List.Value>
        </List.Trailing>
      </List.Item>
    </List.Root>
  );
}
