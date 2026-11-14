import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Theme } from '../../system/theme.tsx';
import * as Popover from './popover.tsx';

function Demo({ arrow = false }: { arrow?: boolean }): React.JSX.Element {
  return (
    <Theme paper="charcoal">
      <Popover.Root>
        <Popover.Trigger>Details</Popover.Trigger>
        <Popover.Content arrow={arrow}>
          <Popover.Title>Lossless</Popover.Title>
          <Popover.Close />
        </Popover.Content>
      </Popover.Root>
    </Theme>
  );
}

describe('Popover', () => {
  it('opens a themed popup with hanji classes and closes from the corner button', async () => {
    render(<Demo arrow />);
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));
    const title = await screen.findByText('Lossless');
    const popup = title.closest('.hj-popover-popup');
    expect(popup).not.toBeNull();
    expect(popup?.closest('[data-hj-paper]')?.getAttribute('data-hj-paper')).toBe('charcoal');
    expect(popup?.querySelector('.hj-popover-arrow')).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByText('Lossless')).toBeNull());
  });

  it('omits the arrow by default', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));
    const popup = (await screen.findByText('Lossless')).closest('.hj-popover-popup');
    expect(popup?.querySelector('.hj-popover-arrow')).toBeNull();
  });
});
