import { Button, Dialog } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="danger" />}>Delete playlist</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Title>Delete “Late Night Drive”?</Dialog.Title>
        <Dialog.Description>
          48 tracks will be removed from this device. Your library keeps them, and you can download
          them again.
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Keep it</Dialog.Close>
          <Dialog.Close render={<Button variant="danger" />}>Delete playlist</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  );
}
