import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Root } from './number-field.tsx';

describe('NumberField', () => {
  it('renders − value + with labels and a unit when childless', () => {
    const { container } = render(<Root aria-label="Minutes" defaultValue={45} unit="min" />);
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Increase' })).toBeTruthy();
    expect(container.querySelector('.hj-number-field-unit')?.textContent).toBe('min');
    expect(container.querySelector('.hj-number-field-roll')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('steps and the rolling copy follows the value', async () => {
    const onChange = vi.fn<(v: number | null) => void>();
    const { container } = render(
      <Root
        aria-label="Copies"
        defaultValue={9}
        min={1}
        max={10}
        onValueChange={(v) => onChange(v)}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenLastCalledWith(10);
    const glyphs = Array.from(container.querySelector('.hj-number-field-roll')?.children ?? [])
      .map((c) => (c as HTMLElement).dataset.ch)
      .join('');
    expect(glyphs).toBe('10');
    expect(screen.getByRole('button', { name: 'Increase' }).hasAttribute('data-disabled')).toBe(
      true,
    );
  });

  it('shows the plain input while typing', () => {
    const { container } = render(<Root aria-label="n" defaultValue={2} />);
    const input = container.querySelector('input.hj-number-field-input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: '23' } });
    expect(container.querySelector('.hj-number-field-value')?.hasAttribute('data-typing')).toBe(
      true,
    );
    fireEvent.blur(input);
    expect(container.querySelector('.hj-number-field-value')?.hasAttribute('data-typing')).toBe(
      false,
    );
  });
});
