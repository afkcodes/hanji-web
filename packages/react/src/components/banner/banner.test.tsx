import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import * as Banner from './banner.tsx';

describe('Banner', () => {
  it('danger is an alert with a glyph; neutral is a status', () => {
    render(
      <>
        <Banner.Root tone="danger">
          <Banner.Title>Payment didn’t go through</Banner.Title>
        </Banner.Root>
        <Banner.Root>
          <Banner.Title>Lyrics are community-sourced</Banner.Title>
        </Banner.Root>
      </>,
    );
    const alert = screen.getByRole('alert');
    expect(alert.className).toBe('hj-banner');
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.querySelector('.hj-banner-glyph')).not.toBeNull();
    expect(screen.getByRole('status').getAttribute('data-tone')).toBe('neutral');
  });

  it('dismiss reports at once, plays the exit, then unmounts and reports complete', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    const onOpenChangeComplete = vi.fn<(open: boolean) => void>();
    render(
      <Banner.Root
        tone="warning"
        onOpenChange={onOpenChange}
        onOpenChangeComplete={onOpenChangeComplete}
      >
        <Banner.Title>You’re offline</Banner.Title>
        <Banner.Dismiss />
      </Banner.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    const alert = screen.getByRole('alert');
    expect(alert.hasAttribute('data-ending-style')).toBe(true);
    expect(alert.hasAttribute('data-animating')).toBe(true);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull(), { timeout: 2000 });
    expect(onOpenChangeComplete).toHaveBeenCalledWith(false);
  });

  it('shows again with a starting frame, then settles open', async () => {
    const onOpenChangeComplete = vi.fn<(open: boolean) => void>();
    function Demo(): React.JSX.Element {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Show
          </button>
          <Banner.Root open={open} onOpenChangeComplete={onOpenChangeComplete}>
            <Banner.Title>Update ready</Banner.Title>
          </Banner.Root>
        </>
      );
    }
    render(<Demo />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(onOpenChangeComplete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Show' }));
    const status = screen.getByRole('status');
    expect(status.hasAttribute('data-animating')).toBe(true);
    await waitFor(() => expect(status.hasAttribute('data-animating')).toBe(false), {
      timeout: 2000,
    });
    expect(status.hasAttribute('data-starting-style')).toBe(false);
    expect(onOpenChangeComplete).toHaveBeenCalledWith(true);
  });

  it('a controlled banner stays until its owner closes it', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    render(
      <Banner.Root open onOpenChange={onOpenChange}>
        <Banner.Title>Lyrics are community-sourced</Banner.Title>
        <Banner.Dismiss />
      </Banner.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('status').hasAttribute('data-ending-style')).toBe(false);
  });
});
