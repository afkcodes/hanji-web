import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('dismiss fades, collapses, then reports closed', async () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();
    render(
      <Banner.Root tone="warning" onOpenChange={onOpenChange}>
        <Banner.Title>You’re offline</Banner.Title>
        <Banner.Dismiss />
      </Banner.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getByRole('alert').hasAttribute('data-ending-style')).toBe(true);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull(), { timeout: 2000 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
