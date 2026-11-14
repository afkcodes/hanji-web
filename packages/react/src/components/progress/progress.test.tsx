import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fraction } from './progress-math.ts';
import { Header, Indicator, Label, Root, Track, Value } from './progress.tsx';

describe('Progress', () => {
  it('renders a labelled progressbar and exposes the fraction as a CSS variable', () => {
    render(
      <Root value={34} max={48}>
        <Header>
          <Label>Downloading</Label>
          <Value />
        </Header>
        <Track>
          <Indicator />
        </Track>
      </Root>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Downloading' });
    expect(bar.className).toContain('hj-progress');
    expect(bar.getAttribute('data-tone')).toBe('accent');
    expect(bar.getAttribute('aria-valuenow')).toBe('34');
    expect(bar.style.getPropertyValue('--hj-progress-fraction')).toBe(String(34 / 48));
  });

  it('draws the indicator full width (scaled by transform, never width)', () => {
    const { container } = render(<Root value={40} aria-label="Upload" />);
    const ind = container.querySelector('.hj-progress-indicator') as HTMLElement;
    expect(ind).toBeTruthy();
    expect(ind.style.width).toBe('100%');
  });

  it('indeterminate when value is null', () => {
    const { container } = render(<Root value={null} aria-label="Sync" tone="fg" />);
    const root = screen.getByRole('progressbar', { name: 'Sync' });
    expect(root.hasAttribute('data-indeterminate')).toBe(true);
    expect(root.style.getPropertyValue('--hj-progress-fraction')).toBe('');
    expect(
      container.querySelector('.hj-progress-indicator')?.hasAttribute('data-indeterminate'),
    ).toBe(true);
  });

  it('fraction clamps and handles a zero span', () => {
    expect(fraction(150, 0, 100)).toBe(1);
    expect(fraction(-5, 0, 100)).toBe(0);
    expect(fraction(5, 5, 5)).toBe(1);
    expect(fraction(null)).toBeNull();
  });
});
