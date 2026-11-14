import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Theme } from '../../system/theme.tsx';
import * as Sheet from './sheet.tsx';

function Demo({ side }: { side?: Sheet.Side }): React.JSX.Element {
  return (
    <Theme paper="ink">
      <Sheet.Root side={side}>
        <Sheet.Trigger>Open queue</Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>Up next</Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Body defer>
            <p>Paper Lanterns</p>
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>
    </Theme>
  );
}

describe('Sheet', () => {
  it('opens a themed bottom sheet with a handle and mounts deferred content after the entrance', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open queue' }));
    const dialog = await screen.findByRole('dialog', { name: 'Up next' });
    expect(dialog.className).toContain('hj-sheet-popup');
    expect(dialog.getAttribute('data-side')).toBe('bottom');
    expect(dialog.querySelector('.hj-sheet-handle')).not.toBeNull();
    expect(dialog.closest('[data-hj-paper]')?.getAttribute('data-hj-paper')).toBe('ink');
    expect(await screen.findByText('Paper Lanterns')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('side sheets carry their side and drop the handle', async () => {
    render(<Demo side="right" />);
    await userEvent.click(screen.getByRole('button', { name: 'Open queue' }));
    const dialog = await screen.findByRole('dialog', { name: 'Up next' });
    expect(dialog.getAttribute('data-side')).toBe('right');
    expect(dialog.querySelector('.hj-sheet-handle')).toBeNull();
  });
});
