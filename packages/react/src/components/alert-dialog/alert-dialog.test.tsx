import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as AlertDialog from './alert-dialog.tsx';

describe('AlertDialog', () => {
  it('opens an alertdialog with the danger glyph and closes from a choice', async () => {
    render(
      <AlertDialog.Root>
        <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
        <AlertDialog.Content tone="danger">
          <AlertDialog.Title>Delete 12 downloads?</AlertDialog.Title>
          <AlertDialog.Description>Frees 1.8 GB.</AlertDialog.Description>
          <AlertDialog.Actions>
            <AlertDialog.Close>Keep them</AlertDialog.Close>
          </AlertDialog.Actions>
        </AlertDialog.Content>
      </AlertDialog.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dlg = await screen.findByRole('alertdialog', { name: 'Delete 12 downloads?' });
    expect(dlg.className).toContain('hj-alert-dialog-popup');
    expect(dlg.getAttribute('data-tone')).toBe('danger');
    expect(dlg.querySelector('.hj-alert-dialog-glyph')).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Keep them' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });
});
