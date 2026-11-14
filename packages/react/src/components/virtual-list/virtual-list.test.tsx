import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import * as VirtualList from './virtual-list.tsx';
import type { VirtualListActions } from './virtual-list.tsx';

let restore: (() => void) | undefined;
beforeEach(() => {
  const d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return (this as HTMLElement).classList.contains('hj-virtual-list') ? 400 : 0;
    },
  });
  restore = () => {
    if (d) Object.defineProperty(HTMLElement.prototype, 'clientHeight', d);
  };
});
afterEach(() => restore?.());

describe('VirtualList', () => {
  it('renders only the rows on screen, with their place in the whole', () => {
    render(
      <VirtualList.Root count={10_000} aria-label="Tracks">
        {(i) => <span>Track {i + 1}</span>}
      </VirtualList.Root>,
    );
    const rows = screen.getAllByRole('listitem');
    // 400 px / 56 px ≈ 8 rows on screen + 6 overscan
    expect(rows.length).toBeGreaterThan(5);
    expect(rows.length).toBeLessThan(30);
    expect(rows[0]?.getAttribute('aria-setsize')).toBe('10000');
    expect(rows[0]?.getAttribute('aria-posinset')).toBe('1');
  });

  it('sizes the scroll area for every row, and gaps', () => {
    const { container } = render(
      <VirtualList.Root count={100} estimateSize={50} gap={10}>
        {(i) => i}
      </VirtualList.Root>,
    );
    const sizer = container.querySelector('.hj-virtual-list-sizer') as HTMLElement;
    expect(sizer.style.height).toBe(`${100 * 50 + 99 * 10}px`);
  });

  it('scrolls to a row', () => {
    const actions: { current: VirtualListActions | null } = { current: null };
    const { container } = render(
      <VirtualList.Root count={1000} estimateSize={40} actionsRef={actions}>
        {(i) => i}
      </VirtualList.Root>,
    );
    const el = container.querySelector('.hj-virtual-list') as HTMLElement;
    let top = 0;
    el.scrollTo = ((opts: ScrollToOptions) => {
      top = opts.top ?? 0;
    }) as typeof el.scrollTo;
    actions.current?.scrollToIndex(500, { align: 'start' });
    expect(top).toBe(500 * 40);
    actions.current?.scrollToIndex(500, { align: 'center' });
    expect(top).toBe(500 * 40 - (400 - 40) / 2);
  });
});
