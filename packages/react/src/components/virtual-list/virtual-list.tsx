'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';
import { Virtualizer } from 'virtua';
import type {
  CustomContainerComponentProps,
  CustomItemComponentProps,
  VirtualizerHandle,
} from 'virtua';

import { cls } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

/*
 * Virtualisation is virtua's (github.com/inokawa/virtua, MIT): measuring, windowing, scroll
 * correction and prepends. hanji adds the list semantics, the API and the look.
 */

interface ListContext {
  count: number;
  gap: number;
  label: string | undefined;
  labelledBy: string | undefined;
  styled: boolean;
}
const Context = React.createContext<ListContext>({
  count: 0,
  gap: 0,
  label: undefined,
  labelledBy: undefined,
  styled: true,
});

/** virtua's container, as hanji's labelled <ul>. */
function List({ style, children, ref }: CustomContainerComponentProps): React.ReactElement {
  const c = React.useContext(Context);
  return (
    <ul
      ref={ref as React.Ref<HTMLUListElement>}
      style={style}
      aria-label={c.label}
      aria-labelledby={c.labelledBy}
      className={c.styled ? 'hj-virtual-list-sizer' : undefined}
    >
      {children}
    </ul>
  );
}

const spacers = new Map<number, React.CSSProperties>();
/** The gap as a block inside the row: virtua measures the content box, so padding wouldn't count. */
function spacer(gap: number): React.CSSProperties {
  let s = spacers.get(gap);
  if (!s) {
    s = { display: 'block', height: gap };
    spacers.set(gap, s);
  }
  return s;
}

/** virtua's item, as an <li> that knows its place in the whole. */
function Row({ style, index, children, ref }: CustomItemComponentProps): React.ReactElement {
  const c = React.useContext(Context);
  return (
    <li
      ref={ref as React.Ref<HTMLLIElement>}
      style={style}
      aria-setsize={c.count}
      aria-posinset={index + 1}
      data-index={index}
      className={c.styled ? 'hj-virtual-list-item' : undefined}
    >
      {children}
      {c.gap && index < c.count - 1 ? <span aria-hidden="true" style={spacer(c.gap)} /> : null}
    </li>
  );
}

export interface ScrollToIndexOptions {
  /** start · center · end, or auto: the least scroll that shows the row. @default 'auto' */
  align?: 'start' | 'center' | 'end' | 'auto';
  behavior?: ScrollBehavior;
}
/** Imperative actions, through `actionsRef`. */
export interface VirtualListActions {
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
  /** Scroll to an offset in px from the top. */
  scrollTo: (offset: number) => void;
  /** Scroll by px. */
  scrollBy: (delta: number) => void;
}

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /** How many rows there are. Only the ones on screen (plus overscan) exist in the DOM. */
  count: number;
  /** Draws row `index`. Rows measure themselves, so heights may vary. */
  children: (index: number) => React.ReactNode;
  /** A row's height before it is measured. Omit it and virtua estimates from measured rows. */
  estimateSize?: number;
  /** Rows' worth of space kept rendered beyond each edge. @default 6 */
  overscan?: number;
  /** Space between rows in px. @default 0 */
  gap?: number;
  /** A stable key per row (an id); defaults to the index. */
  getKey?: (index: number) => React.Key;
  /** The rows on screen changed — load more when `end` nears `count`. */
  onRangeChange?: (range: { start: number; end: number }) => void;
  /** Set while rows are being added to the start (older messages), so the view holds still. */
  shift?: boolean;
  /** Rows that stay mounted off screen (one being edited, a playing track). */
  keepMounted?: readonly number[];
  /** Receives scrollToIndex, scrollTo and scrollBy. */
  actionsRef?: React.Ref<VirtualListActions>;
  render?: useRender.RenderProp;
}
export interface RootProps
  extends RootOwnProps, Omit<React.ComponentProps<'div'>, 'className' | 'children'> {
  className?: string;
}

/**
 * A long list that renders only the rows on screen, built on virtua: ten thousand rows cost what
 * thirty do, rows measure themselves, the reading position holds still as rows above change size
 * or older rows are prepended, and assistive tech still hears “row 4,203 of 10,000”.
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
      estimateSize,
      overscan = 6,
      gap = 0,
      getKey,
      onRangeChange,
      shift,
      keepMounted,
      actionsRef,
      render,
      className,
      'aria-label': label,
      'aria-labelledby': labelledBy,
      ...rest
    },
  ] = useSlot('VirtualList.Root', props);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const handle = React.useRef<VirtualizerHandle | null>(null);
  const data = React.useMemo(() => ({ length: count }), [count]);
  const ctx = React.useMemo(
    () => ({ count, gap, label, labelledBy, styled: !config.unstyled }),
    [count, gap, label, labelledBy, config.unstyled],
  );

  const range = React.useRef({ start: -1, end: -1 });
  const onRangeRef = React.useRef(onRangeChange);
  React.useLayoutEffect(() => {
    onRangeRef.current = onRangeChange;
  });
  const report = React.useCallback(() => {
    const h = handle.current;
    if (!h || !count) return;
    const start = h.findItemIndex(h.scrollOffset);
    const end = h.findItemIndex(h.scrollOffset + Math.max(0, h.viewportSize - 1));
    if (start === range.current.start && end === range.current.end) return;
    range.current = { start, end };
    onRangeRef.current?.({ start, end });
  }, [count]);
  React.useEffect(() => {
    report();
  }, [report]);

  React.useImperativeHandle(
    actionsRef,
    () => ({
      scrollToIndex(index, options = {}) {
        const align = !options.align || options.align === 'auto' ? 'nearest' : options.align;
        handle.current?.scrollToIndex(Math.min(count - 1, Math.max(0, index)), {
          align,
          smooth: options.behavior === 'smooth',
        });
      },
      scrollTo(offset) {
        handle.current?.scrollTo(offset);
      },
      scrollBy(delta) {
        handle.current?.scrollBy(delta);
      },
    }),
    [count],
  );

  return useRender({
    render,
    ref: scrollRef,
    defaultTagName: 'div',
    props: {
      // a scroll region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex: 0,
      ...rest,
      className: cls(config, 'VirtualList.Root', 'hj-virtual-list', className) as
        | string
        | undefined,
      children: (
        <Context.Provider value={ctx}>
          <Virtualizer
            ref={handle}
            scrollRef={scrollRef}
            data={data}
            itemSize={estimateSize}
            bufferSize={overscan * (estimateSize ?? 56)}
            shift={shift}
            keepMounted={keepMounted}
            as={List}
            item={Row}
            onScroll={report}
            onResize={report}
          >
            {(_: unknown, index: number) => (
              <React.Fragment key={getKey ? getKey(index) : index}>
                {children(index)}
              </React.Fragment>
            )}
          </Virtualizer>
        </Context.Provider>
      ),
    },
  });
}
