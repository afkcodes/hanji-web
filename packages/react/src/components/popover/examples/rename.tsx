import { Button, Field, Popover } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('Late Night Drive');
  const [draft, setDraft] = React.useState(name);
  const empty = draft.trim() === '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontWeight: 600, fontSize: 17 }}>{name}</span>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft(name);
        }}
      >
        <Popover.Trigger render={<Button size="sm" variant="secondary" />}>Rename</Popover.Trigger>
        <Popover.Content side="bottom" align="start">
          <Popover.Title>Rename playlist</Popover.Title>
          <Popover.Close />
          <form
            style={{ display: 'contents' }}
            onSubmit={(e) => {
              e.preventDefault();
              if (empty) return;
              setName(draft.trim());
              setOpen(false);
            }}
          >
            <Field.Root invalid={empty} style={{ width: 260, marginTop: 6 }}>
              <Field.Label className="hj-sr-only">Name</Field.Label>
              <Field.Control
                size="sm"
                value={draft}
                maxLength={48}
                onChange={(e) => setDraft(e.currentTarget.value)}
              />
              {empty ? (
                <Field.Error match>Give it a name — at least one character.</Field.Error>
              ) : null}
            </Field.Root>
            <Popover.Actions>
              <Popover.Close render={<Button size="sm" variant="quiet" />}>Cancel</Popover.Close>
              <Button size="sm" type="submit" disabled={empty}>
                Save
              </Button>
            </Popover.Actions>
          </form>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
