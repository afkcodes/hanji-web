import { Button, Tooltip } from '@hanji/react';

const kbd: React.CSSProperties = {
  marginLeft: 8,
  padding: '1px 5px',
  borderRadius: 4,
  background: 'color-mix(in srgb, var(--hj-bg) 18%, transparent)',
  font: '500 11px var(--hj-font-mono)',
};

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip.Root key={side}>
          <Tooltip.Trigger render={<Button variant="secondary" size="sm" />}>
            {side}
          </Tooltip.Trigger>
          <Tooltip.Content side={side}>
            Shuffle
            <span style={kbd}>⌘S</span>
          </Tooltip.Content>
        </Tooltip.Root>
      ))}
    </div>
  );
}
