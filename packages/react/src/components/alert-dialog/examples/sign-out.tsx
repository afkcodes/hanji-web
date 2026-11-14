import { AlertDialog, Button } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const signOut = (): void => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setOpen(false);
    }, 1400);
  };
  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !busy && setOpen(next)}>
      <AlertDialog.Trigger render={<Button variant="secondary" />}>
        Sign out everywhere
      </AlertDialog.Trigger>
      <AlertDialog.Content size="md">
        <AlertDialog.Title>Sign out of 4 devices?</AlertDialog.Title>
        <AlertDialog.Description>
          Mira’s iPhone, the kitchen speaker, a MacBook and an Android tablet (last seen 3 weeks
          ago) will need your password again. Downloads on them stay until they reconnect.
        </AlertDialog.Description>
        <AlertDialog.Actions>
          <AlertDialog.Close render={<Button variant="secondary" disabled={busy} />}>
            Cancel
          </AlertDialog.Close>
          <Button variant="ink" loading={busy} onClick={signOut}>
            {busy ? 'Signing out…' : 'Sign out everywhere'}
          </Button>
        </AlertDialog.Actions>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
