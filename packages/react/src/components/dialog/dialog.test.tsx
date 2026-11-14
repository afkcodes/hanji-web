import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Button, Dialog, Theme } from '../../index.ts';

function Confirm(): React.JSX.Element {
  return (
    <Theme paper="ink" accent="cobalt">
      <Dialog.Root>
        <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Close />
          <Dialog.Title>Delete?</Dialog.Title>
          <Dialog.Description>It goes.</Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>
    </Theme>
  );
}

describe('Dialog', () => {
  it('opens a labelled modal dialog and closes from the corner button', async () => {
    render(<Confirm />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete?' });
    expect(dialog.className).toContain('hj-dialog-popup');
    expect(dialog.getAttribute('data-size')).toBe('sm');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('carries the surrounding Theme into the portal', async () => {
    render(<Confirm />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    const scope = dialog.closest('[data-hj-paper]');
    expect(scope?.getAttribute('data-hj-paper')).toBe('ink');
    expect(scope?.getAttribute('data-hj-accent')).toBe('cobalt');
  });
});
