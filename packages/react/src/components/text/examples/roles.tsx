import { Text } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 520 }}>
      <Text variant="eyebrow" tone="mute">
        Listening this week
      </Text>
      <Text variant="hero">2 h 47 min</Text>
      <Text variant="display">Tuesday mix</Text>
      <Text variant="title">Recently played</Text>
      <Text variant="heading">Up next from Kōya Lanes</Text>
      <Text variant="subheading">Downloads</Text>
      <Text>48 tracks · 3 h 12 min · updated this morning</Text>
      <Text variant="sub" tone="dim">
        Saved to this device · 212 MB
      </Text>
      <Text variant="label">Lossless</Text>
      <Text variant="mono">02:47 / 04:13 · −1:26</Text>
    </div>
  );
}
