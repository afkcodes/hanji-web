import { Button, CoachMark, Icon } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const search = React.useRef<HTMLButtonElement>(null);
  const queue = React.useRef<HTMLButtonElement>(null);
  const downloads = React.useRef<HTMLButtonElement>(null);
  return (
    <div style={{ display: 'grid', gap: 18, justifyItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: 6,
          borderRadius: 999,
          boxShadow: 'inset 0 0 0 1px var(--hj-line)',
          background: 'var(--hj-surface)',
        }}
      >
        <Button ref={search} variant="quiet" iconOnly aria-label="Search">
          <Icon name="search" />
        </Button>
        <Button ref={queue} variant="quiet" iconOnly aria-label="Queue">
          <Icon name="more" />
        </Button>
        <Button ref={downloads} variant="quiet" iconOnly aria-label="Downloads">
          <Icon name="arrowUp" style={{ rotate: '180deg' }} />
        </Button>
      </div>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        What’s new in 4.2
      </Button>
      <CoachMark.Root open={open} onOpenChange={() => setOpen(false)}>
        <CoachMark.Step target={search}>
          <CoachMark.Title>Search moved here</CoachMark.Title>
          <CoachMark.Description>
            It now searches lyrics too — try a line you half remember.
          </CoachMark.Description>
        </CoachMark.Step>
        <CoachMark.Step target={queue}>
          <CoachMark.Title>Your queue</CoachMark.Title>
          <CoachMark.Description>
            Drag to reorder. It follows you to the kitchen speaker.
          </CoachMark.Description>
        </CoachMark.Step>
        <CoachMark.Step target={downloads}>
          <CoachMark.Title>Downloads, sorted by space</CoachMark.Title>
          <CoachMark.Description>
            See what’s taking 4.2 GB and clear it in one go.
          </CoachMark.Description>
        </CoachMark.Step>
      </CoachMark.Root>
    </div>
  );
}
