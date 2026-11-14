import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import * as VirtualList from './virtual-list.tsx';
import type { VirtualListActions } from './virtual-list.tsx';

/*
 * happy-dom has no layout, so a stand-in ResizeObserver reports sizes the way a browser would:
 * a 400 px viewport and 40 px rows. That is all virtua needs to window the list.
 */
const RealRO = globalThis.ResizeObserver;
class FakeResizeObserver {
  constructor(private cb: ResizeObserverCallback) {}
  observe(target: Element): void {
    const size = (target as HTMLElement).classList.contains('hj-virtual-list') ? 400 : 40;
    queueMicrotask(() =>
      this.cb(
        [
          {
            target,
            contentRect: { width: 320, height: size } as DOMRectReadOnly,
            borderBoxSize: [{ inlineSize: 320, blockSize: size }],
            contentBoxSize: [{ inlineSize: 320, blockSize: size }],
            devicePixelContentBoxSize: [],
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      ),
    );
  }
  unobserve(): void {}
  disconnect(): void {}
}
beforeEach(() => {
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
});
afterEach(() => {
  globalThis.ResizeObserver = RealRO;
});

const flush = (): Promise<void> =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

describe('VirtualList', () => {
  it('renders a window of rows in a labelled list, each knowing its place in the whole', async () => {
    render(
      <VirtualList.Root count={10_000} estimateSize={40} aria-label="Tracks">
        {(i) => <span>Track {i + 1}</span>}
      </VirtualList.Root>,
    );
    await flush();
    await flush();
    const list = screen.getByRole('list', { name: 'Tracks' });
    const rows = list.querySelectorAll('li');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(60);
    expect(rows[0]?.getAttribute('aria-setsize')).toBe('10000');
    expect(rows[0]?.getAttribute('aria-posinset')).toBe('1');
  });

  it('puts the gap below every row but the last', async () => {
    const { container } = render(
      <VirtualList.Root count={3} estimateSize={40} gap={8}>
        {(i) => i}
      </VirtualList.Root>,
    );
    await flush();
    const rows = [...container.querySelectorAll('li')];
    // a spacer inside the row, so virtua's content-box measure includes it
    expect((rows[0]?.lastElementChild as HTMLElement | null)?.style.height).toBe('8px');
    expect(rows.at(-1)?.querySelector('[aria-hidden]')).toBeNull();
  });

  it('lays a shelf out sideways, the gap as a width', async () => {
    const { container } = render(
      <VirtualList.Root orientation="horizontal" count={3} estimateSize={40} gap={12}>
        {(i) => i}
      </VirtualList.Root>,
    );
    await flush();
    expect(container.querySelector('.hj-virtual-list')?.getAttribute('data-orientation')).toBe(
      'horizontal',
    );
    const first = container.querySelector('li');
    expect(first?.style.display).toBe('inline-flex');
    expect((first?.lastElementChild as HTMLElement | null)?.style.width).toBe('12px');
  });

  it('hands scrollToIndex to virtua', async () => {
    const actions: { current: VirtualListActions | null } = { current: null };
    const { container } = render(
      <VirtualList.Root count={1000} estimateSize={40} actionsRef={actions}>
        {(i) => i}
      </VirtualList.Root>,
    );
    await flush();
    const el = container.querySelector('.hj-virtual-list') as HTMLElement;
    let top = 0;
    Object.defineProperty(el, 'scrollTop', {
      configurable: true,
      get: () => top,
      set: (v: number) => {
        top = v;
      },
    });
    el.scrollTo = ((opts: ScrollToOptions | number) => {
      top = typeof opts === 'number' ? opts : (opts.top ?? top);
    }) as typeof el.scrollTo;
    await act(async () => {
      actions.current?.scrollToIndex(500, { align: 'start' });
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(top).toBeGreaterThan(0);
  });
});
