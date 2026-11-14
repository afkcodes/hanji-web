import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Counter } from './counter.tsx';

const glyphs = (el: Element): string =>
  Array.from(el.querySelector('.hj-counter-roll')?.children ?? [])
    .map((c) => (c as HTMLElement).dataset.ch ?? '')
    .join('');

describe('Counter', () => {
  it('formats numbers and exposes the full value as text', () => {
    const { container } = render(<Counter value={128406} locale="en-GB" />);
    const root = container.querySelector('.hj-counter');
    expect(root?.querySelector('.hj-sr-only')?.textContent).toBe('128,406');
    expect(root?.querySelector('.hj-counter-roll')?.getAttribute('aria-hidden')).toBe('true');
    expect(glyphs(container)).toBe('128,406');
  });

  it('rolls only the cells that change', () => {
    const { container, rerender } = render(<Counter value={1289} locale="en-GB" />);
    const cells = Array.from(container.querySelector('.hj-counter-roll')?.children ?? []);
    rerender(<Counter value={1290} locale="en-GB" />);
    const after = Array.from(container.querySelector('.hj-counter-roll')?.children ?? []);
    expect(after).toHaveLength(cells.length);
    expect(glyphs(container)).toBe('1,290');
    // the thousands cell was untouched: still a single glyph
    expect(after[0]?.children).toHaveLength(1);
  });

  it('accepts preformatted strings and grows/shrinks cells', () => {
    const { container, rerender } = render(<Counter value="9:59" />);
    rerender(<Counter value="10:00" />);
    expect(glyphs(container)).toBe('10:00');
    expect(container.querySelector('.hj-sr-only')?.textContent).toBe('10:00');
  });
});
