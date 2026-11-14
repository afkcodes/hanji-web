import { Artwork, Icon, Text } from '@hanji/react';
import type { IconName } from '@hanji/react';

const categories: { name: string; icon: IconName }[] = [
  { name: 'Made for you', icon: 'sparkle' },
  { name: 'Recently found', icon: 'search' },
  { name: 'Liner notes', icon: 'info' },
  { name: 'Attachments', icon: 'paperclip' },
  { name: 'Studio tools', icon: 'tool' },
  { name: 'Saved', icon: 'checkCircle' },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 22, justifyItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 72px)', gap: 14 }}>
        {categories.map((c) => (
          <div key={c.name} style={{ display: 'grid', gap: 8 }}>
            <Artwork.Root size={72}>
              <Artwork.Glyph id={c.name}>
                <Icon name={c.icon} />
              </Artwork.Glyph>
            </Artwork.Root>
            <Text variant="sub">{c.name}</Text>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end' }}>
        {[48, 72, 120].map((size) => (
          <Artwork.Root key={size} size={size} lift>
            <Artwork.Glyph id="Made for you">
              <Icon name="sparkle" />
            </Artwork.Glyph>
          </Artwork.Root>
        ))}
      </div>
    </div>
  );
}
