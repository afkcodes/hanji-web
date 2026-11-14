import { Chip, Icon, Text } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <div>
        <Text variant="heading">The Long Way Round the Harbour</Text>
        <Text variant="sub" tone="mute">
          Ilse Brandt · Saltmarsh · 4:07
        </Text>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip.Action icon={<Icon name="plus" />}>Add to queue</Chip.Action>
        <Chip.Action icon={<Icon name="sparkle" />}>Start radio</Chip.Action>
        <Chip.Action icon={<Icon name="copy" />}>Copy link</Chip.Action>
        <Chip.Action size="sm" disabled icon={<Icon name="arrowUp" />}>
          Upload lyrics
        </Chip.Action>
      </div>
    </div>
  );
}
