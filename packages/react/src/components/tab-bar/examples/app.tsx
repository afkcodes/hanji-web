import { Icon, TabBar } from '@hanji/react';
import * as React from 'react';

const glyph = (d: string): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const home = glyph('M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5M10 20v-6h4v6');
const library = glyph('m16 6 4 14M12 6v14M8 8v12M4 4v16');
const inbox = glyph('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0');
const you = glyph('M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21a8 8 0 0 1 16 0');

const screens: Record<string, string> = {
  home: 'Good evening, Aiko. Two new releases from artists you follow.',
  search: 'Search artists, songs or podcasts.',
  library: '24 playlists · 312 downloaded songs',
  inbox: '12 new: Jun-seo Park shared “Seoul, 4 a.m.” with you.',
  you: 'Family plan · renews 2 December',
};

export function Example(): React.JSX.Element {
  const [tab, setTab] = React.useState('home');
  return (
    <div
      style={{
        width: 360,
        height: 420,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 28,
        overflow: 'hidden',
        background: 'var(--hj-bg)',
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
      }}
    >
      <div style={{ flex: 1, padding: 24 }}>
        <p className="hj-text-title" style={{ textTransform: 'capitalize' }}>
          {tab}
        </p>
        <p className="hj-text-body hj-tone-dim" style={{ marginTop: 8 }}>
          {screens[tab]}
        </p>
      </div>
      <TabBar.Root aria-label="Main" value={tab} onValueChange={setTab}>
        <TabBar.Item value="home" icon={home}>
          Home
        </TabBar.Item>
        <TabBar.Item value="search" icon={<Icon name="search" />}>
          Search
        </TabBar.Item>
        <TabBar.Item value="library" icon={library}>
          Library
        </TabBar.Item>
        <TabBar.Item value="inbox" icon={inbox} badge={12}>
          Inbox
        </TabBar.Item>
        <TabBar.Item value="you" icon={you}>
          You
        </TabBar.Item>
      </TabBar.Root>
    </div>
  );
}
