import { Button, Chip, Text } from '@hanji/react';
import * as React from 'react';

const START = ['Jazz', '1960s', 'Under 10 min', 'Live recordings', 'Saxophone'];

export function Example(): React.JSX.Element {
  const [picks, setPicks] = React.useState(START);
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'start', maxWidth: 440 }}>
      <Chip.List aria-label="Search filters">
        {picks.map((p) => (
          <Chip.Input key={p} onRemove={() => setPicks((all) => all.filter((x) => x !== p))}>
            {p}
          </Chip.Input>
        ))}
        <Chip.Input disabled removeLabel="Explicit filter is set by your account">
          No explicit
        </Chip.Input>
      </Chip.List>
      {picks.length === 0 ? (
        <Text variant="sub" tone="mute">
          No filters — showing everything.
        </Text>
      ) : null}
      <Button size="sm" variant="secondary" onClick={() => setPicks(START)}>
        Reset
      </Button>
    </div>
  );
}
