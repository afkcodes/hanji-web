import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import * as CoachMark from './coach-mark.tsx';

function Demo({
  onOpenChange,
}: {
  onOpenChange: (open: boolean, reason: 'finish' | 'skip') => void;
}): React.JSX.Element {
  const a = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={a} type="button">
        Search
      </button>
      <CoachMark.Root defaultOpen onOpenChange={onOpenChange}>
        <CoachMark.Step target={a}>
          <CoachMark.Title>Search moved here</CoachMark.Title>
        </CoachMark.Step>
        <CoachMark.Step target="#nowhere">
          <CoachMark.Title>Equaliser presets</CoachMark.Title>
        </CoachMark.Step>
      </CoachMark.Root>
    </>
  );
}

describe('CoachMark', () => {
  it('walks steps with progress, anchors when it can, centres when it can’t, and finishes', async () => {
    const onOpenChange = vi.fn<(open: boolean, reason: 'finish' | 'skip') => void>();
    render(<Demo onOpenChange={onOpenChange} />);
    const title = await screen.findByText('Search moved here');
    expect(title.className).toBe('hj-coach-mark-title');
    expect(screen.getByText('1 of 2')).toBeTruthy();
    await waitFor(() => expect(document.querySelector('.hj-coach-mark-spotlight')).not.toBeNull());

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    const second = await screen.findByText('Equaliser presets');
    expect(second.closest('.hj-coach-mark-popup')?.hasAttribute('data-centered')).toBe(true);
    expect(screen.getByText('2 of 2')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByText('Equaliser presets')).toBeNull());
    expect(onOpenChange).toHaveBeenCalledWith(false, 'finish');
  });

  it('Skip ends the tour with reason skip', async () => {
    const onOpenChange = vi.fn<(open: boolean, reason: 'finish' | 'skip') => void>();
    render(<Demo onOpenChange={onOpenChange} />);
    await screen.findByText('Search moved here');
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'skip');
  });
});
