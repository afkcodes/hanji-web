'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { cls } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

/**
 * Sizes and offsets for every row: estimates until a row is measured, prefix sums rebuilt lazily
 * from the first change, binary search to find the rows on screen. O(log n) per lookup.
 */
class Layout {
  count = 0;
  gap = 0;
  sizes: Float64Array = new Float64Array(0);
  offsets: Float64Array = new Float64Array(1);
  /** Offsets are valid up to (not including) this index. */
  valid = 0;

  sync(count: number, estimate: (i: number) => number, gap: number): void {
    if (count === this.count && gap === this.gap) return;
    const sizes = new Float64Array(count);
    const keep = Math.min(count, this.count);
    sizes.set(this.sizes.subarray(0, keep));
    for (let i = keep; i < count; i++) sizes[i] = estimate(i);
    this.sizes = sizes;
    this.offsets = new Float64Array(count + 1);
    this.count = count;
    this.gap = gap;
    this.valid = 0;
  }
  private build(upTo: number): void {
    for (let i = Math.max(1, this.valid); i <= upTo; i++) {
      this.offsets[i] = (this.offsets[i - 1] ?? 0) + (this.sizes[i - 1] ?? 0) + this.gap;
    }
    if (upTo + 1 > this.valid) this.valid = upTo + 1;
  }
  /** Top of row i. */
  offset(i: number): number {
    if (i >= this.valid) this.build(i);
    return this.offsets[i] ?? 0;
  }
  size(i: number): number {
    return this.sizes[i] ?? 0;
  }
  total(): number {
    return this.count ? this.offset(this.count) - this.gap : 0;
  }
  /** The row at y (the last row whose top is at or above y). */
  find(y: number): number {
    if (!this.count) return 0;
    this.build(this.count);
    let lo = 0;
    let hi = this.count - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((this.offsets[mid] ?? 0) <= y) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
  /** Record a measured size; returns how much the row grew. */
  measure(i: number, size: number): number {
    const delta = size - (this.sizes[i] ?? 0);
    if (Math.abs(delta) < 0.5) return 0;
    this.sizes[i] = size;
    if (i + 1 < this.valid) this.valid = i + 1;
    return delta;
  }
}

export interface ScrollToIndexOptions {
  /** start · center · end, or auto: the least scroll that shows the row. @default 'auto' */
  align?: 'start' | 'center' | 'end' | 'auto';
  behavior?: ScrollBehavior;
}
/** Imperative actions, through `actionsRef`. */
export interface VirtualListActions {
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
}

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /** How many rows there are. Only the ones on screen (plus overscan) exist in the DOM. */
  count: number;
  /** Draws row `index`. Rows measure themselves, so heights may vary. */
  children: (index: number) => React.ReactNode;
  /** A row's height before it is measured. @default 56 */
  estimateSize?: number | ((index: number) => number);
  /** Rows kept beyond each edge, so fast scrolls don't show gaps. @default 6 */
  overscan?: number;
  /** Space between rows in px. @default 0 */
  gap?: number;
  /** A stable key per row (an id); defaults to the index. */
  getKey?: (index: number) => React.Key;
  /** The rows on screen changed — load more when `end` nears `count`. */
  onRangeChange?: (range: { start: number; end: number }) => void;
  /** Receives `scrollToIndex`. */
  actionsRef?: React.Ref<VirtualListActions>;
  render?: useRender.RenderProp;
}
export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className' | 'children'> {
  className?: string;
}

/**
 * A long list that renders only what is on screen: ten thousand rows cost what thirty do. Rows
 * measure themselves (heights may vary), rows above the viewport that change size never shift
 * what you are reading, and assistive tech still hears “row 4,203 of 10,000”.
 *
 * @example
 * <VirtualList.Root count={tracks.length} aria-label="All tracks" style={{ height: 480 }}>
 *   {(i) => <TrackRow track={tracks[i]} />}
 * </VirtualList.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [
    config,
    {
      count,
      children,
      estimateSize = 56,
      overscan = 6,
      gap = 0,
      getKey,
      onRangeChange,
      actionsRef,
      render,
      className,
      onScroll,
      'aria-label': label,
      'aria-labelledby': labelledBy,
      ...rest
    },
  ] = useSlot('VirtualList.Root', props);
  const scroller = React.useRef<HTMLDivElement | null>(null);
  // the layout and the row observer live for the component's life: one stable store
  const [store] = React.useState<{ layout: Layout; ro: ResizeObserver | null }>(() => ({
    layout: new Layout(),
    ro: null,
  }));
  const { layout } = store;
  const [, setVersion] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewport, setViewport] = React.useState(0);
  const estimate = React.useMemo(
    () => (typeof estimateSize === 'function' ? estimateSize : () => estimateSize),
    [estimateSize],
  );
  layout.sync(count, estimate, gap);

  // One observer for every row, made at commit time: measured sizes land in the layout, then one
  // re-render. A row above what you're reading that grows moves scrollTop with it.
  React.useEffect(() => () => store.ro?.disconnect(), [store]);

  const measureRef = React.useCallback(
    (node: HTMLLIElement | null) => {
      if (!node || typeof ResizeObserver === 'undefined') return;
      store.ro ??= new ResizeObserver((entries) => {
        const rows = store.layout;
        const el = scroller.current;
        let changed = false;
        let anchor = 0;
        const top = el?.scrollTop ?? 0;
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const index = Number(target.dataset.index);
          if (Number.isNaN(index) || index >= rows.count) continue;
          const size = entry.borderBoxSize?.[0]?.blockSize ?? target.offsetHeight;
          const delta = rows.measure(index, size);
          if (!delta) continue;
          changed = true;
          if (rows.offset(index) < top) anchor += delta;
        }
        if (el && anchor) el.scrollTop += anchor;
        if (changed) setVersion((v) => v + 1);
      });
      const ro = store.ro;
      ro.observe(node);
      return () => ro.unobserve(node);
    },
    [store],
  );

  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    setViewport(el.clientHeight);
    setScrollTop(el.scrollTop);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setViewport(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const first = count ? layout.find(scrollTop) : 0;
  const last = count ? layout.find(scrollTop + Math.max(viewport, 1)) : -1;
  const start = Math.max(0, first - overscan);
  const end = Math.min(count - 1, last + overscan);

  const onRangeRef = React.useRef(onRangeChange);
  React.useLayoutEffect(() => {
    onRangeRef.current = onRangeChange;
  });
  React.useEffect(() => {
    if (count) onRangeRef.current?.({ start: first, end: last });
  }, [first, last, count]);

  React.useImperativeHandle(
    actionsRef,
    () => ({
      scrollToIndex(index, options = {}) {
        const el = scroller.current;
        if (!el || !layout.count) return;
        const i = Math.min(layout.count - 1, Math.max(0, index));
        const top = layout.offset(i);
        const size = layout.size(i);
        const view = el.clientHeight;
        const align = options.align ?? 'auto';
        let to = top;
        if (align === 'center') to = top - (view - size) / 2;
        else if (align === 'end') to = top - view + size;
        else if (align === 'auto') {
          if (top >= el.scrollTop && top + size <= el.scrollTop + view) return;
          to = top < el.scrollTop ? top : top - view + size;
        }
        el.scrollTo({ top: Math.max(0, to), behavior: options.behavior ?? 'auto' });
      },
    }),
    [layout],
  );

  const styled = !config.unstyled;
  const rows: React.ReactNode[] = [];
  for (let i = start; i <= end; i++) {
    rows.push(
      <li
        key={getKey ? getKey(i) : i}
        ref={measureRef}
        aria-setsize={count}
        aria-posinset={i + 1}
        data-index={i}
        className={styled ? 'hj-virtual-list-item' : undefined}
        // oxlint-disable-next-line react-perf/jsx-no-new-object-as-prop -- each row's position is its own and changes as rows measure
        style={{ transform: `translateY(${layout.offset(i)}px)` }}
      >
        {children(i)}
      </li>,
    );
  }

  return useRender({
    render,
    ref: scroller,
    defaultTagName: 'div',
    props: {
      // a scroll region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex: 0,
      ...rest,
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        onScroll?.(e);
        setScrollTop(e.currentTarget.scrollTop);
      },
      className: cls(config, 'VirtualList.Root', 'hj-virtual-list', className) as
        | string
        | undefined,
      children: (
        <ul
          aria-label={label}
          aria-labelledby={labelledBy}
          className={styled ? 'hj-virtual-list-sizer' : undefined}
          // oxlint-disable-next-line react-perf/jsx-no-new-object-as-prop -- the total height changes as rows measure
          style={{ height: layout.total() }}
        >
          {rows}
        </ul>
      ),
    },
  });
}
