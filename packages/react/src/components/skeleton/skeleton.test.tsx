import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Root, Text } from './skeleton.tsx';

describe('Skeleton', () => {
  it('is hidden from assistive tech and sized from props', () => {
    const { container } = render(<Root shape="circle" width={32} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.className).toBe('hj-skeleton');
    expect(el.getAttribute('data-shape')).toBe('circle');
    expect(el.style.width).toBe('32px');
    expect(el.style.height).toBe('32px');
  });

  it('text draws n lines with a shorter last one', () => {
    const { container } = render(<Text lines={4} lastLine="40%" />);
    const lines = container.querySelectorAll('.hj-skeleton[data-shape="text"]');
    expect(lines).toHaveLength(4);
    expect((lines[3] as HTMLElement).style.width).toBe('40%');
    expect((lines[0] as HTMLElement).style.width).toBe('');
  });
});
