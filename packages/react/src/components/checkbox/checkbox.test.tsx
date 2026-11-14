import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Indicator, Root } from './checkbox.tsx';

describe('Checkbox', () => {
  it('renders a complete checkbox when childless and toggles', async () => {
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <>
        <Root id="cb-1" onCheckedChange={(c) => onChange(c)} />
        <label htmlFor="cb-1">Email me receipts</label>
      </>,
    );
    const box = screen.getByRole('checkbox', { name: 'Email me receipts' });
    expect(box.className).toBe('hj-checkbox');
    expect(box.getAttribute('data-size')).toBe('md');
    expect(box.querySelector('.hj-checkbox-indicator svg')).not.toBeNull();
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(box.hasAttribute('data-checked')).toBe(true);
  });

  it('keeps the indicator mounted so the tick can draw out', () => {
    render(<Root aria-label="x" />);
    const box = screen.getByRole('checkbox', { name: 'x' });
    expect(box.querySelector('.hj-checkbox-indicator')).not.toBeNull();
  });

  it('exposes mixed state and accepts a custom indicator', () => {
    render(
      <Root indeterminate aria-label="All">
        <Indicator>
          <i data-testid="own" />
        </Indicator>
      </Root>,
    );
    const box = screen.getByRole('checkbox', { name: 'All' });
    expect(box.getAttribute('aria-checked')).toBe('mixed');
    expect(screen.getByTestId('own')).toBeTruthy();
  });
});
