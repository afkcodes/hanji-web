import { Button, CoachMark } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center' }}>
      <p style={{ margin: 0, maxWidth: 360, fontSize: 13.5, color: 'var(--hj-fg-dim)' }}>
        The equaliser button is hidden on narrow screens, so this step can’t point at it.
      </p>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Start tour
      </Button>
      <CoachMark.Root
        open={open}
        onOpenChange={() => setOpen(false)}
        labels={{ progress: (s, n) => `Step ${s}/${n}` }}
      >
        <CoachMark.Step target="#hj-example-equaliser">
          <CoachMark.Title>Equaliser presets</CoachMark.Title>
          <CoachMark.Description>
            On this screen size they live under More › Sound. Make the window wider to see the
            button.
          </CoachMark.Description>
        </CoachMark.Step>
      </CoachMark.Root>
    </div>
  );
}
