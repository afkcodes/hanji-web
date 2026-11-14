import { Text } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 14, width: '100%', maxWidth: 360 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Text tone="fg">Primary</Text>
        <Text tone="dim">Secondary</Text>
        <Text tone="mute">Tertiary</Text>
        <Text tone="accent">Selected</Text>
        <Text tone="success">Saved offline</Text>
        <Text tone="danger">Couldn’t sync</Text>
      </div>
      <Text
        variant="heading"
        truncate
        title="The Long Way Round the Harbour (Live at Saltmarsh Hall, 2019)"
      >
        The Long Way Round the Harbour (Live at Saltmarsh Hall, 2019)
      </Text>
      <Text variant="title" render={(props) => <h1 {...props}>{props.children}</h1>}>
        Page title rendered as h1
      </Text>
    </div>
  );
}
