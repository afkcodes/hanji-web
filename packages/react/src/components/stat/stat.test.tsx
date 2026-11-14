import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Delta, Label, Root, Sparkline, Unit, Value, sparkPath } from './stat.tsx';

describe('Stat', () => {
  it('renders the number with a unit and a delta whose sentiment follows the trend', () => {
    render(
      <Root size="lg">
        <Label>Today</Label>
        <Value>
          2 h 47<Unit>min</Unit>
        </Value>
        <Delta trend="up">+24 min</Delta>
      </Root>,
    );
    expect(screen.getByText('Today').className).toBe('hj-stat-label');
    const delta = screen.getByText('+24 min').closest('.hj-stat-delta') as HTMLElement;
    expect(delta.getAttribute('data-trend')).toBe('up');
    expect(delta.getAttribute('data-sentiment')).toBe('positive');
    expect(delta.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(document.querySelector('.hj-stat')?.getAttribute('data-size')).toBe('lg');
  });

  it('down can be good', () => {
    render(
      <Delta trend="down" sentiment="positive">
        −6 pts
      </Delta>,
    );
    expect(
      screen.getByText('−6 pts').closest('.hj-stat-delta')?.getAttribute('data-sentiment'),
    ).toBe('positive');
  });

  it('sparkline is decorative unless labelled', () => {
    const { rerender } = render(<Sparkline data={[1, 3, 2]} />);
    expect(document.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    rerender(<Sparkline data={[1, 3, 2]} label="Rising" />);
    expect(screen.getByRole('img', { name: 'Rising' })).toBeTruthy();
  });

  it('sparkPath normalises into the box and marks the last point', () => {
    const { line, last } = sparkPath([0, 10], 96, 24);
    expect(line.startsWith('M3.00 21.00')).toBe(true);
    expect(last).toEqual([93, 3]);
    expect(sparkPath([5], 96, 24).last).toBeNull();
  });
});
