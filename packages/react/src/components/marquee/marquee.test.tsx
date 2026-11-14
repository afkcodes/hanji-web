import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Marquee, planMarquee } from './marquee.tsx';

describe('Marquee', () => {
  it('plans a pass from the measured widths', () => {
    const p = planMarquee(200, 380, { speed: 45, gap: 40, dwell: 1200 });
    expect(p.overflows).toBe(true);
    expect(p.distance).toBe(420);
    // 420 px at 45 px/s = 9333 ms of travel + 1200 ms dwell
    expect(Math.round(p.duration)).toBe(10533);
    expect(p.dwellOffset).toBeCloseTo(1200 / p.duration, 6);
  });

  it('does not move text that fits (within the slack)', () => {
    expect(planMarquee(200, 201).overflows).toBe(false);
    expect(planMarquee(200, 203).overflows).toBe(true);
  });

  it('renders one readable copy at rest', () => {
    const { container } = render(<Marquee>Night Bus Home</Marquee>);
    const root = container.querySelector('.hj-marquee') as HTMLElement;
    expect(root.hasAttribute('data-running')).toBe(false);
    expect(container.querySelectorAll('.hj-marquee-text')).toHaveLength(1);
    expect(root.style.getPropertyValue('--hj-marquee-gap')).toBe('40px');
  });
});
