import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Spinner } from './spinner.tsx';

describe('Spinner', () => {
  afterEach(() => vi.useRealTimers());

  it('is an indeterminate progressbar named from strings', () => {
    render(<Spinner size="lg" />);
    const el = screen.getByRole('progressbar', { name: 'Loading' });
    expect(el.className).toBe('hj-spinner');
    expect(el.getAttribute('data-size')).toBe('lg');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('delay hides it until the wait passes', () => {
    vi.useFakeTimers();
    const { container } = render(<Spinner delay label="Syncing" />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(container.querySelector('[data-waiting]')).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByRole('progressbar', { name: 'Syncing' })).toBeTruthy();
  });
});
