import { Button, Dialog, Field } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('Late Night Drive');
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button variant="secondary" />}>Rename</Dialog.Trigger>
      <Dialog.Content size="md">
        <Dialog.Close />
        <Dialog.Title>Rename playlist</Dialog.Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
          style={{ display: 'contents' }}
        >
          <Field.Root>
            <Field.Label>Name</Field.Label>
            <Field.Control
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
              maxLength={48}
            />
            <Field.Description>Shown on your profile and in shares.</Field.Description>
          </Field.Root>
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
            <Button type="submit">Save</Button>
          </Dialog.Actions>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
