import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as MessageActions from './message-actions.tsx';

describe('MessageActions', () => {
  it('is a labelled toolbar of icon buttons', () => {
    render(
      <MessageActions.Root text="hi">
        <MessageActions.Copy />
        <MessageActions.Regenerate />
      </MessageActions.Root>,
    );
    expect(screen.getByRole('toolbar', { name: 'Message actions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeTruthy();
  });

  it('Copy writes the root text and flips to Copied', async () => {
    const writeText = vi.fn<(t: string) => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(
      <MessageActions.Root text={() => 'live text'}>
        <MessageActions.Copy />
      </MessageActions.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('live text');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Copied' }).hasAttribute('data-copied')).toBe(true),
    );
  });

  it('Feedback: one thumb at a time, pressing again clears', async () => {
    const onValueChange = vi.fn<(v: 'up' | 'down' | null) => void>();
    render(<MessageActions.Feedback onValueChange={onValueChange} />);
    const up = screen.getByRole('button', { name: 'Good response' });
    const down = screen.getByRole('button', { name: 'Bad response' });
    await userEvent.click(up);
    expect(up.getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(down);
    expect(up.getAttribute('aria-pressed')).toBe('false');
    expect(down.getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(down);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });
});
