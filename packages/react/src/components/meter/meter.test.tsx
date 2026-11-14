import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Root, meterZone } from './meter.tsx';

describe('Meter', () => {
  it('follows HTML meter rules for zones', () => {
    // low is good (storage): optimum below low
    expect(meterZone(10, { low: 40, high: 56, optimum: 5, max: 64 })).toBe('optimum');
    expect(meterZone(50, { low: 40, high: 56, optimum: 5, max: 64 })).toBe('suboptimum');
    expect(meterZone(60, { low: 40, high: 56, optimum: 5, max: 64 })).toBe('critical');
    // high is good (battery)
    expect(meterZone(95, { low: 20, high: 60, optimum: 90 })).toBe('optimum');
    expect(meterZone(10, { low: 20, high: 60, optimum: 90 })).toBe('critical');
    // middle is good
    expect(meterZone(50, { low: 30, high: 70 })).toBe('optimum');
    expect(meterZone(90, { low: 30, high: 70 })).toBe('suboptimum');
  });

  it('grades the root and exposes the fraction', () => {
    render(<Root value={23} low={20} high={60} optimum={90} aria-label="Battery" />);
    const m = screen.getByRole('meter', { name: 'Battery' });
    expect(m.className).toBe('hj-meter');
    expect(m.getAttribute('data-zone')).toBe('suboptimum');
    expect(m.getAttribute('data-tone')).toBe('zone');
    expect(m.style.getPropertyValue('--hj-meter-fraction')).toBe('0.23');
  });

  it('accent with no thresholds; segments set a variable', () => {
    const { container } = render(<Root value={3} max={5} segments={5} aria-label="Signal" />);
    const m = screen.getByRole('meter');
    expect(m.getAttribute('data-tone')).toBe('accent');
    expect(m.hasAttribute('data-zone')).toBe(false);
    expect(m.hasAttribute('data-segmented')).toBe(true);
    expect(m.style.getPropertyValue('--hj-meter-segments')).toBe('5');
    expect((container.querySelector('.hj-meter-indicator') as HTMLElement).style.width).toBe(
      '100%',
    );
  });
});
