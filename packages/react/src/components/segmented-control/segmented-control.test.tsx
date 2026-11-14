import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Item, Root } from './segmented-control.tsx';

describe('SegmentedControl', () => {
  it('is a radiogroup with one indicator and selects on click', async () => {
    const onChange = vi.fn<(v: unknown) => void>();
    const { container } = render(
      <Root aria-label="Range" defaultValue="week" onValueChange={(v) => onChange(v)}>
        <Item value="day">Day</Item>
        <Item value="week">Week</Item>
      </Root>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Range' });
    expect(group.className).toBe('hj-segmented-control');
    expect(container.querySelectorAll('.hj-segmented-control-indicator')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Week' }).getAttribute('aria-checked')).toBe('true');
    await userEvent.click(screen.getByRole('radio', { name: 'Day' }));
    expect(onChange).toHaveBeenCalledWith('day');
    expect(screen.getByRole('radio', { name: 'Day' }).hasAttribute('data-checked')).toBe(true);
  });

  it('marks size and block', () => {
    render(
      <Root aria-label="x" size="sm" block defaultValue="a">
        <Item value="a">A</Item>
      </Root>,
    );
    const group = screen.getByRole('radiogroup', { name: 'x' });
    expect(group.getAttribute('data-size')).toBe('sm');
    expect(group.hasAttribute('data-block')).toBe(true);
  });
});
