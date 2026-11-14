import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Display, Root } from './rating.tsx';

describe('Rating', () => {
  it('is a radiogroup of labelled stars; choosing fills up to it', async () => {
    const onChange = vi.fn<(v: number) => void>();
    const { container } = render(<Root aria-label="Rate" onValueChange={onChange} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    await userEvent.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(onChange).toHaveBeenCalledWith(4);
    const lit = container.querySelectorAll('.hj-rating-star[data-lit]');
    expect(lit).toHaveLength(4);
    expect(screen.getByRole('radio', { name: '4 stars' }).getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('previews on hover without committing', () => {
    const { container } = render(<Root aria-label="Rate" defaultValue={2} />);
    fireEvent.pointerEnter(screen.getByRole('radio', { name: '5 stars' }));
    expect(container.querySelector('.hj-rating')?.hasAttribute('data-preview')).toBe(true);
    expect(container.querySelectorAll('.hj-rating-star[data-lit]')).toHaveLength(5);
    fireEvent.pointerLeave(container.querySelector('.hj-rating') as Element);
    expect(container.querySelectorAll('.hj-rating-star[data-lit]')).toHaveLength(2);
  });

  it('displays an average as one sentence with an exact partial fill', () => {
    const { container } = render(<Display value={4.6} count={2184} locale="en-GB" />);
    expect(container.querySelector('.hj-sr-only')?.textContent).toBe(
      'Rated 4.6 out of 5 from 2,184 ratings',
    );
    // 4 whole stars (4 × 26) + .6 of the fifth (14.4) over 128 units
    const stop = container.querySelector('stop')?.getAttribute('offset');
    expect(stop).toBe(`${(((4 * 26 + 0.6 * 24) / 128) * 100).toFixed(2)}%`);
    expect(container.querySelectorAll('svg path')).toHaveLength(5);
  });
});
