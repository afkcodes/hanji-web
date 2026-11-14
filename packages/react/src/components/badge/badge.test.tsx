import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Anchor, Root } from './badge.tsx';

describe('Badge', () => {
  it('shows the count and caps it', () => {
    render(
      <>
        <Root count={7} />
        <Root count={240} />
      </>,
    );
    expect(screen.getByRole('status', { name: '7' }).textContent).toBe('7');
    const capped = screen.getByRole('status', { name: '99+' });
    expect(capped.textContent).toBe('99+');
    expect(capped.hasAttribute('data-wide')).toBe(true);
  });

  it('renders nothing at zero unless showZero', () => {
    const { container, rerender } = render(<Root count={0} />);
    expect(container.firstChild).toBeNull();
    rerender(<Root count={0} showZero />);
    expect(screen.getByRole('status').textContent).toBe('0');
  });

  it('dot has no text and takes a label', () => {
    render(<Root dot label="New releases" />);
    const el = screen.getByRole('status', { name: 'New releases' });
    expect(el.textContent).toBe('');
    expect(el.hasAttribute('data-dot')).toBe(true);
  });

  it('anchor wraps and positions', () => {
    const { container } = render(
      <Anchor shape="circle">
        <span>A</span>
        <Root count={2} />
      </Anchor>,
    );
    const a = container.firstElementChild as HTMLElement;
    expect(a.className).toBe('hj-badge-anchor');
    expect(a.getAttribute('data-shape')).toBe('circle');
  });
});
