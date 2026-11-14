import { AlertDialog, Button } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger render={<Button variant="danger" />}>
        Delete 12 downloads
      </AlertDialog.Trigger>
      <AlertDialog.Content tone="danger">
        <AlertDialog.Title>Delete 12 downloads?</AlertDialog.Title>
        <AlertDialog.Description>
          This frees 1.8 GB on this phone. The songs stay in your library and you can download them
          again on Wi-Fi.
        </AlertDialog.Description>
        <AlertDialog.Actions>
          <AlertDialog.Close render={<Button variant="secondary" />}>Keep them</AlertDialog.Close>
          <AlertDialog.Close render={<Button variant="danger" />}>
            Delete downloads
          </AlertDialog.Close>
        </AlertDialog.Actions>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
