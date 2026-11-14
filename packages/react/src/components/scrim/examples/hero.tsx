import { Button, Icon, Scrim, Text } from '@hanji/react';

const stage = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300"><defs><radialGradient id="l" cx="50%" cy="38%" r="55%"><stop offset="0" stop-color="hsl(38 92% 72%)"/><stop offset="1" stop-color="hsl(268 38% 22%)"/></radialGradient></defs><rect width="480" height="300" fill="url(#l)"/><rect y="214" width="480" height="86" fill="hsl(262 30% 14%)"/><circle cx="240" cy="150" r="34" fill="hsl(40 96% 86%)" opacity=".8"/></svg>`,
)}`;

export function Example(): React.JSX.Element {
  return (
    <Scrim.Root style={{ width: '100%', maxWidth: 480, height: 300 }}>
      <img src={stage} alt="A stage in warm light, seen from the stalls" />
      <Scrim.Layer edge="top" strength={0.55} extent="40%" />
      <Scrim.Content edge="top" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button iconOnly size="sm" variant="quiet" aria-label="Back">
          <Icon name="chevronLeft" />
        </Button>
        <Button iconOnly size="sm" variant="quiet" aria-label="More">
          <Icon name="more" />
        </Button>
      </Scrim.Content>
      <Scrim.Layer />
      <Scrim.Content>
        <Text variant="eyebrow" tone="mute">
          Live album · 2019
        </Text>
        <Text variant="title" tone="fg">
          Live at Saltmarsh Hall
        </Text>
        <Text variant="sub" tone="dim">
          Ilse Brandt and the Harbour Quartet · 1 h 04 min
        </Text>
      </Scrim.Content>
    </Scrim.Root>
  );
}
