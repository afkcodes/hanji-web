import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Root, Value } from './progress-ring.tsx';

describe('ProgressRing', () => {
  it('draws an SVG ring and exposes size and fraction as CSS variables', () => {
    const { container } = render(<Root value={25} aria-label="Upload" />);
    const ring = screen.getByRole('progressbar', { name: 'Upload' });
    expect(ring.className).toBe('hj-progress-ring');
    expect(ring.style.getPropertyValue('--hj-progress-ring-size')).toBe('40px');
    expect(ring.style.getPropertyValue('--hj-progress-ring-fraction')).toBe('0.25');
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });

  it('a lg ring shows its value with a shrunk percent sign', () => {
    render(<Root value={76} size="lg" aria-label="Storage" />);
    const value = document.querySelector('.hj-progress-ring-value');
    expect(value?.textContent?.replace(/\s/g, '')).toBe('76%');
    expect(value?.querySelector('small')?.textContent).toBe('%');
  });

  it('marks empty and indeterminate states', () => {
    const { rerender } = render(<Root value={0} aria-label="Ring" />);
    expect(screen.getByRole('progressbar').hasAttribute('data-empty')).toBe(true);
    rerender(<Root value={null} aria-label="Ring" />);
    expect(screen.getByRole('progressbar').hasAttribute('data-indeterminate')).toBe(true);
  });

  it('custom centre content and a function Value', () => {
    render(
      <Root value={4} max={5} size="lg" aria-label="Goal">
        <Value>{() => '4 of 5'}</Value>
      </Root>,
    );
    expect(screen.getByText('4 of 5')).toBeTruthy();
  });
});
