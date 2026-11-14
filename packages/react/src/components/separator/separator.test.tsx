import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Separator } from './separator.tsx';

describe('Separator', () => {
  it('is a horizontal separator by default', () => {
    render(<Separator />);
    const el = screen.getByRole('separator');
    expect(el.className).toBe('hj-separator');
    expect(el.getAttribute('data-variant')).toBe('full');
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('labels and orientation', () => {
    render(
      <>
        <Separator label="or" />
        <Separator orientation="vertical" variant="inset" />
      </>,
    );
    const [a, b] = screen.getAllByRole('separator');
    expect(a?.hasAttribute('data-label')).toBe(true);
    expect(a?.textContent).toBe('or');
    expect(b?.getAttribute('aria-orientation')).toBe('vertical');
  });
});
