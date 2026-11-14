import { Scrim, Text } from '@hanji/react';

/** Placeholder art: a few soft shapes in one family of hues. Real apps pass a cover URL. */
const art = (hue: number): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220"><rect width="220" height="220" fill="hsl(${hue} 46% 34%)"/><circle cx="54" cy="58" r="62" fill="hsl(${hue + 24} 62% 62%)"/><circle cx="168" cy="118" r="78" fill="hsl(${hue - 18} 48% 48%)"/><rect y="150" width="220" height="70" fill="hsl(${hue + 8} 40% 72%)"/></svg>`,
  )}`;

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      <Scrim.Root style={{ width: 220, height: 220 }}>
        <img src={art(212)} alt="Saltmarsh cover: blue and teal circles over a pale horizon" />
        <Scrim.Layer />
        <Scrim.Content>
          <Text variant="heading" tone="fg">
            Saltmarsh
          </Text>
          <Text variant="sub" tone="dim">
            Ilse Brandt · 11 tracks
          </Text>
        </Scrim.Content>
      </Scrim.Root>
      <Scrim.Root style={{ width: 220, height: 220 }}>
        <img src={art(28)} alt="Low Tide Choir cover: amber and rust circles" />
        <Scrim.Layer color="hsl(28 60% 12%)" strength={0.86} />
        <Scrim.Content>
          <Text variant="heading" tone="fg">
            Low Tide Choir
          </Text>
          <Text variant="sub" tone="mute">
            Aiko Sato · the fade keeps the art’s hue
          </Text>
        </Scrim.Content>
      </Scrim.Root>
    </div>
  );
}
