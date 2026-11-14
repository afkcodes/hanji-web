import { Button, Icon, List, ProgressRing } from '@hanji/react';

function Art({ a, b }: { a: string; b: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" style={{ fill: a }} />
      <circle cx="26" cy="15" r="11" style={{ fill: b }} />
    </svg>
  );
}

export function Example(): React.JSX.Element {
  return (
    <List.Root style={{ width: 'min(100%, 420px)' }}>
      <List.Item selected render={<a href="#late-light" />}>
        <List.Leading variant="art">
          <Art a="var(--hj-data-4)" b="var(--hj-data-1)" />
        </List.Leading>
        <List.Content>
          <List.Title>Late Light, Vol. 2</List.Title>
          <List.Description>Playing · 24 songs · 1 h 32 min</List.Description>
        </List.Content>
        <List.Trailing>
          <List.Chevron />
        </List.Trailing>
      </List.Item>
      <List.Item render={<a href="#jeju" />}>
        <List.Leading variant="art">
          <Art a="var(--hj-data-3)" b="var(--hj-data-6)" />
        </List.Leading>
        <List.Content>
          <List.Title>Field Recordings, Jeju</List.Title>
          <List.Description>Downloading · 64% of 41 songs</List.Description>
        </List.Content>
        <List.Trailing>
          <ProgressRing.Root value={64} size="sm" aria-label="Download progress" />
        </List.Trailing>
      </List.Item>
      <List.Item>
        <List.Leading variant="art">
          <Art a="var(--hj-data-2)" b="var(--hj-data-5)" />
        </List.Leading>
        <List.Content>
          <List.Title>Sunday Paper</List.Title>
          <List.Description style={{ color: 'var(--hj-danger)' }}>
            <Icon name="alert" /> Couldn’t sync — offline
          </List.Description>
        </List.Content>
        <List.Trailing>
          <Button size="sm" variant="secondary">
            Retry
          </Button>
        </List.Trailing>
      </List.Item>
      <List.Item render={<a href="#quiet" />}>
        <List.Leading variant="art">
          <Art a="var(--hj-data-1)" b="var(--hj-data-3)" />
        </List.Leading>
        <List.Content>
          <List.Title>Quiet Machines</List.Title>
          <List.Description>Playlist · Dev Malhotra · 17 songs</List.Description>
        </List.Content>
        <List.Trailing>
          <List.Value>58:12</List.Value>
          <List.Chevron />
        </List.Trailing>
      </List.Item>
      <List.Item disabled render={<a href="#seoul" />}>
        <List.Leading variant="art">
          <Art a="var(--hj-data-5)" b="var(--hj-data-4)" />
        </List.Leading>
        <List.Content>
          <List.Title>Seoul, 4 a.m.</List.Title>
          <List.Description>Not available in your region</List.Description>
        </List.Content>
      </List.Item>
    </List.Root>
  );
}
