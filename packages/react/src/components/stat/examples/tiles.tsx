import { Stat } from '@hanji/react';

const listening = [42, 58, 51, 66, 72, 61, 84];
const skips = [31, 28, 30, 24, 22, 19, 17];

export function Example(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 32,
        width: 'min(100%, 640px)',
      }}
    >
      <Stat.Root>
        <Stat.Label>Listening this week</Stat.Label>
        <Stat.Value>
          9 h 12<Stat.Unit>min</Stat.Unit>
        </Stat.Value>
        <Stat.Delta trend="up">+12% vs last week</Stat.Delta>
        <Stat.Sparkline data={listening} label="Rising over 7 days" />
      </Stat.Root>
      <Stat.Root>
        <Stat.Label>Skipped tracks</Stat.Label>
        <Stat.Value>
          17<Stat.Unit>%</Stat.Unit>
        </Stat.Value>
        <Stat.Delta trend="down" sentiment="positive">
          −6 pts since Monday
        </Stat.Delta>
        <Stat.Sparkline data={skips} tone="success" />
      </Stat.Root>
      <Stat.Root>
        <Stat.Label>On this device</Stat.Label>
        <Stat.Value>
          48.6<Stat.Unit>GB</Stat.Unit>
        </Stat.Value>
        <Stat.Delta>No change</Stat.Delta>
        <Stat.Description>of 64 GB · 15.4 GB free</Stat.Description>
      </Stat.Root>
    </div>
  );
}
