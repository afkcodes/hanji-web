import { Stat } from '@hanji/react';

const days = [96, 124, 88, 141, 133, 152, 167, 148, 171, 159, 183, 167];

export function Example(): React.JSX.Element {
  return (
    <Stat.Root size="lg" style={{ width: 'min(100%, 360px)' }}>
      <Stat.Label>Today</Stat.Label>
      <Stat.Value>
        2 h 47<Stat.Unit>min</Stat.Unit>
      </Stat.Value>
      <Stat.Delta trend="up">+24 min vs your daily average</Stat.Delta>
      <Stat.Sparkline data={days} width={240} height={32} tone="fg" />
      <Stat.Description>
        Most of it with Ilse Brandt’s Saltmarsh. Updated 4 min ago.
      </Stat.Description>
    </Stat.Root>
  );
}
