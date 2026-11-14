import { Tabs } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Tabs.Root defaultValue="tracks" style={{ width: '100%', maxWidth: 520 }}>
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="tracks">
          Tracks <span className="hj-text-mono hj-tone-mute">12</span>
        </Tabs.Tab>
        <Tabs.Tab value="credits">Credits</Tabs.Tab>
        <Tabs.Tab value="lyrics" disabled>
          Lyrics
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <p className="hj-text-body hj-tone-dim">
          Low Tide Choir’s second record, made in a converted ferry shed over one winter in Bergen.
        </p>
      </Tabs.Panel>
      <Tabs.Panel value="tracks">
        <p className="hj-text-body hj-tone-dim">12 tracks · 41 min · Released 4 March 2026</p>
      </Tabs.Panel>
      <Tabs.Panel value="credits">
        <p className="hj-text-body hj-tone-dim">
          Produced by Ilse Brandt. Mixed by Jun-seo Park. Mastered by Tomás Reyes.
        </p>
      </Tabs.Panel>
    </Tabs.Root>
  );
}
