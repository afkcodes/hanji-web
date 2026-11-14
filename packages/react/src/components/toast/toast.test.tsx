import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as Toast from './toast.tsx';

function Demo({ onUndo }: { onUndo: () => void }): React.JSX.Element {
  const toast = Toast.useToast();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          toast.show({ title: 'Removed “Saltmarsh”', action: { label: 'Undo', onClick: onUndo } })
        }
      >
        remove
      </button>
      <button type="button" onClick={() => toast.danger('Couldn’t sync 3 tracks')}>
        fail
      </button>
    </>
  );
}

describe('Toast', () => {
  it('timing: 3200 ms, +1800 with an action, never under 1200', () => {
    expect(Toast.toToastOptions({ title: 'a' }).timeout).toBe(3200);
    expect(
      Toast.toToastOptions({ title: 'a', action: { label: 'Undo', onClick: () => {} } }).timeout,
    ).toBe(5000);
    expect(Toast.toToastOptions({ title: 'a', timeout: 300 }).timeout).toBe(1200);
    expect(Toast.toToastOptions({ title: 'a', timeout: 0 }).timeout).toBe(0);
    expect(Toast.toToastOptions({ title: 'a', tone: 'danger' }).priority).toBe('high');
  });

  it('shows an announced toast with its action, and danger tone with a glyph', async () => {
    const onUndo = vi.fn<() => void>();
    render(
      <Toast.Provider>
        <Demo onUndo={onUndo} />
        <Toast.Viewport />
      </Toast.Provider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'remove' }));
    const title = await screen.findByText('Removed “Saltmarsh”');
    const toast = title.closest('.hj-toast');
    expect(toast?.getAttribute('data-tone')).toBe('neutral');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: 'fail' }));
    // danger is announced urgently: Base UI mirrors it into a live region, so scope to the toast
    const nodes = await screen.findAllByText('Couldn’t sync 3 tracks');
    const fail = nodes.map((n) => n.closest('.hj-toast')).find((n) => n !== null);
    expect(fail?.getAttribute('data-tone')).toBe('danger');
    expect(fail?.querySelector('.hj-toast-glyph')).not.toBeNull();
    const dismiss = fail?.querySelector<HTMLButtonElement>('.hj-toast-close');
    expect(dismiss?.getAttribute('aria-label')).toBe('Dismiss');
    if (dismiss) await userEvent.click(dismiss);
    await waitFor(() =>
      expect(
        screen.queryAllByText('Couldn’t sync 3 tracks').some((n) => n.closest('.hj-toast')),
      ).toBe(false),
    );
  });
});
