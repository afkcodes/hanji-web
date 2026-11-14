import { Tabs } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 28, width: '100%', maxWidth: 420 }}>
      <Tabs.Root defaultValue="week">
        <Tabs.List variant="pill" fill aria-label="Listening period">
          <Tabs.Tab value="day">Day</Tabs.Tab>
          <Tabs.Tab value="week">Week</Tabs.Tab>
          <Tabs.Tab value="month">Month</Tabs.Tab>
          <Tabs.Tab value="year">Year</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="day">
          <p className="hj-text-sub hj-tone-mute">2 h 47 min today · 18 tracks</p>
        </Tabs.Panel>
        <Tabs.Panel value="week">
          <p className="hj-text-sub hj-tone-mute">14 h 05 min this week · up 12% on last week</p>
        </Tabs.Panel>
        <Tabs.Panel value="month">
          <p className="hj-text-sub hj-tone-mute">61 h this month · 412 tracks</p>
        </Tabs.Panel>
        <Tabs.Panel value="year">
          <p className="hj-text-sub hj-tone-mute">Not enough history yet. Come back in March.</p>
        </Tabs.Panel>
      </Tabs.Root>
      <Tabs.Root defaultValue="list">
        <Tabs.List variant="pill" size="sm" aria-label="View">
          <Tabs.Tab value="list">List</Tabs.Tab>
          <Tabs.Tab value="grid">Grid</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
}
