import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Squircle, cornerShape, squirclePath } from './squircle.tsx';

/** x of the path's first point: the corner begins at width − p. */
const start = (s: number): number => Number(squirclePath(200, 200, 40, s).split(' ')[0]?.slice(1));

describe('squirclePath', () => {
  it('draws a closed path inside the box', () => {
    const d = squirclePath(120, 80, 24, 0.72);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    expect(nums.every(Number.isFinite)).toBe(true);
  });

  it('smoothing reaches further along the edge than a circular corner', () => {
    // the corner begins at width − p, with p = (1 + smoothing) × radius
    expect(start(0)).toBeCloseTo(160);
    expect(start(0.72)).toBeLessThan(start(0));
  });

  it('clamps radius to half the shorter side', () => {
    expect(() => squirclePath(40, 20, 999, 1)).not.toThrow();
  });

  it('maps smoothing to a CSS corner-shape', () => {
    expect(cornerShape(0)).toBe('round');
    expect(cornerShape(0.72)).toBe('superellipse(1.893)');
  });
});

describe('Squircle', () => {
  it('sets its radius and shape as custom properties', () => {
    const { container } = render(<Squircle radius="lg" smoothing={0.5} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe('hj-squircle');
    expect(el.style.getPropertyValue('--hj-squircle-radius')).toBe('var(--hj-r-lg)');
    expect(el.style.getPropertyValue('--hj-squircle-shape')).toMatch(/^superellipse\(1\.\d+\)$/);
    expect(el.style.getPropertyValue('--hj-squircle-span')).toBe('1.5');
  });
});
