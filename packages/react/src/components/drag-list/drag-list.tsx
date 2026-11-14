'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { cls } from '../../system/slot.ts';
import { useSlot } from '../../system/use-slot.ts';

/** A long press anywhere on a row lifts it; the handle lifts at once. */
const LONG_PRESS = 220;
/** Movement before the long press completes means a scroll, not a drag. */
const SLOP = 6;
/** Auto-scroll when the pointer is this close to the scroller's edge… */
const EDGE = 72;
/** …at up to this many px per frame. */
const MAX_SCROLL = 14;
/** Past the ends the row follows at a third of the distance. */
const RESISTANCE = 3;

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

/** A copy of `list` with the item at `from` moved to `to` — what `onReorder` usually does. */
export function reorder<T>(list: readonly T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

interface Drag {
  el: HTMLElement;
  items: HTMLElement[];
  from: number;
  to: number;
  tops: number[];
  heights: number[];
  gap: number;
  viaKey: boolean;
  startY: number;
  pointerY: number;
  startScroll: number;
  scroller: HTMLElement | null;
}

function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}
const scrollOf = (s: HTMLElement | null): number => (s ? s.scrollTop : window.scrollY);
const nameOf = (el: HTMLElement): string =>
  el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '';
const itemsOf = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-hj-drag-item]'));

/** Props hanji adds to the Root. */
export interface RootOwnProps {
  /** Called once the dropped row has settled: move your item from `from` to `to` (see `reorder`). */
  onReorder?: (from: number, to: number) => void;
  /** Stop lifting, e.g. while saving. */
  disabled?: boolean;
  render?: useRender.RenderProp;
}
export interface RootProps extends RootOwnProps, Omit<React.ComponentProps<'ul'>, 'className'> {
  className?: string;
}

/**
 * A list you reorder by picking a row up. The handle lifts at once; anywhere else on the row a
 * long press does, so a scroll is never mistaken for a drag. Every drag has a keyboard twin:
 * Space lifts, ↑↓ move, Space drops, Escape cancels.
 *
 * @example
 * <DragList.Root aria-label="Up next" onReorder={(from, to) => setQueue((q) => DragList.reorder(q, from, to))}>
 *   {queue.map((t) => <DragList.Item key={t.id} label={t.title}>…<DragList.Handle /></DragList.Item>)}
 * </DragList.Root>
 */
export function Root(props: RootProps): React.ReactElement {
  const [config, { onReorder, disabled, render, className, children, ...rest }] = useSlot(
    'DragList.Root',
    props,
  );
  const rootRef = React.useRef<HTMLUListElement | null>(null);
  const hintId = React.useId();
  const [message, setMessage] = React.useState('');
  const drag = React.useRef<Drag | null>(null);
  const pending = React.useRef<(() => void) | null>(null);
  const onReorderRef = React.useRef(onReorder);
  const stringsRef = React.useRef(config.strings);
  React.useLayoutEffect(() => {
    onReorderRef.current = onReorder;
    stringsRef.current = config.strings;
  });

  const say = React.useCallback((m: string) => {
    setMessage('');
    window.setTimeout(() => setMessage(m), 30);
  }, []);

  // Exactly one row is in the tab order (roving tabindex), and a finished drop resets the rows
  // here — after your reorder has committed, before paint, so nothing jumps back for a frame.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = itemsOf(root);
    if (!items.some((i) => i.tabIndex === 0) && items[0]) items[0].tabIndex = 0;
    if (pending.current) {
      const finish = pending.current;
      pending.current = null;
      finish();
    }
  });

  const [api] = React.useState(() => {
    const strings = (): typeof config.strings => stringsRef.current;
    const offsetFor = (s: Drag, to: number): number => {
      let d = 0;
      if (to > s.from) for (let i = s.from + 1; i <= to; i++) d += (s.heights[i] ?? 0) + s.gap;
      if (to < s.from) for (let i = to; i < s.from; i++) d -= (s.heights[i] ?? 0) + s.gap;
      return d;
    };
    const layout = (s: Drag): void => {
      const slot = (s.heights[s.from] ?? 0) + s.gap;
      s.items.forEach((item, i) => {
        if (item === s.el) return;
        let shift = 0;
        if (s.from < s.to && i > s.from && i <= s.to) shift = -slot;
        else if (s.to < s.from && i >= s.to && i < s.from) shift = slot;
        item.style.transform = shift ? `translateY(${shift}px)` : '';
      });
    };
    const targetFor = (s: Drag, dy: number): number => {
      const centre = (s.tops[s.from] ?? 0) + (s.heights[s.from] ?? 0) / 2 + dy;
      let to = 0;
      s.items.forEach((_, i) => {
        if (i !== s.from && (s.tops[i] ?? 0) + (s.heights[i] ?? 0) / 2 < centre) to++;
      });
      return to;
    };
    let frame = 0;
    const follow = (): void => {
      const s = drag.current;
      if (!s || s.viaKey) return;
      const n = s.items.length;
      let dy = s.pointerY - s.startY + (scrollOf(s.scroller) - s.startScroll);
      const min = (s.tops[0] ?? 0) - (s.tops[s.from] ?? 0);
      const max =
        (s.tops[n - 1] ?? 0) +
        (s.heights[n - 1] ?? 0) -
        (s.tops[s.from] ?? 0) -
        (s.heights[s.from] ?? 0);
      if (dy < min) dy = min - (min - dy) / RESISTANCE;
      if (dy > max) dy = max + (dy - max) / RESISTANCE;
      s.el.style.transform = `translateY(${dy.toFixed(1)}px)`;
      const to = targetFor(s, dy);
      if (to !== s.to) {
        s.to = to;
        layout(s);
      }
    };
    const autoScroll = (): void => {
      const s = drag.current;
      if (!s || s.viaKey) return;
      const box = s.scroller
        ? s.scroller.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };
      const top = s.pointerY - box.top;
      const bottom = box.bottom - s.pointerY;
      let v = 0;
      if (top < EDGE) v = -MAX_SCROLL * (1 - Math.max(0, top) / EDGE);
      else if (bottom < EDGE) v = MAX_SCROLL * (1 - Math.max(0, bottom) / EDGE);
      if (v) {
        if (s.scroller) s.scroller.scrollTop += v;
        else window.scrollBy(0, v);
        follow();
      }
      frame = requestAnimationFrame(autoScroll);
    };

    const lift = (el: HTMLElement, viaKey: boolean, y: number): void => {
      const root = rootRef.current;
      if (!root || drag.current || root.hasAttribute('data-dragging')) return;
      const items = itemsOf(root);
      const from = items.indexOf(el);
      if (from < 0) return;
      const rects = items.map((i) => i.getBoundingClientRect());
      const tops = rects.map((r) => r.top);
      const heights = rects.map((r) => r.height);
      const gap =
        items.length > 1 ? Math.max(0, (tops[1] ?? 0) - (tops[0] ?? 0) - (heights[0] ?? 0)) : 0;
      const scroller = scrollParent(root);
      drag.current = {
        el,
        items,
        from,
        to: from,
        tops,
        heights,
        gap,
        viaKey,
        startY: y,
        pointerY: y,
        startScroll: scrollOf(scroller),
        scroller,
      };
      el.setAttribute('data-held', '');
      if (viaKey) el.setAttribute('data-keyed', '');
      root.setAttribute('data-dragging', '');
      if (viaKey) say(strings().reorderLifted(nameOf(el), from + 1, items.length));
      else frame = requestAnimationFrame(autoScroll);
    };

    const reset = (s: Drag, cancelled: boolean): void => {
      const root = rootRef.current;
      if (!root) return;
      root.setAttribute('data-resetting', '');
      for (const item of itemsOf(root)) item.style.transform = '';
      s.el.removeAttribute('data-settling');
      root.removeAttribute('data-dragging');
      requestAnimationFrame(() => root.removeAttribute('data-resetting'));
      if (s.viaKey) {
        for (const item of itemsOf(root)) item.tabIndex = item === s.el ? 0 : -1;
        s.el.focus({ preventScroll: true });
      }
      const n = s.items.length;
      if (cancelled) {
        if (s.viaKey) say(strings().reorderCancelled(nameOf(s.el), s.from + 1));
      } else if (s.to !== s.from) say(strings().reorderDropped(nameOf(s.el), s.to + 1, n));
    };

    const drop = (cancel: boolean): void => {
      const s = drag.current;
      if (!s) return;
      drag.current = null;
      cancelAnimationFrame(frame);
      if (cancel) s.to = s.from;
      layout(s);
      const { el } = s;
      el.removeAttribute('data-held');
      el.removeAttribute('data-keyed');
      // [data-settling] eases the slide, the 1.03 scale and the lifted fill out together
      el.setAttribute('data-settling', '');
      el.style.transform = `translateY(${offsetFor(s, s.to)}px)`;
      const ms = (parseFloat(getComputedStyle(el).transitionDuration) || 0) * 1000;
      let done = false;
      const settle = (): void => {
        if (done) return;
        done = true;
        el.removeEventListener('transitionend', onEnd);
        if (s.to === s.from) {
          reset(s, cancel);
          return;
        }
        // reset once your reorder has rendered; if it never does, put the rows back
        pending.current = () => reset(s, false);
        onReorderRef.current?.(s.from, s.to);
        window.setTimeout(() => {
          if (pending.current) {
            const finish = pending.current;
            pending.current = null;
            finish();
          }
        }, 160);
      };
      const onEnd = (e: TransitionEvent): void => {
        if (e.target === el && e.propertyName === 'transform') settle();
      };
      el.addEventListener('transitionend', onEnd);
      window.setTimeout(settle, ms + 60);
    };

    const step = (dir: 1 | -1): void => {
      const s = drag.current;
      if (!s?.viaKey) return;
      const n = s.items.length;
      const to = Math.min(n - 1, Math.max(0, s.to + dir));
      if (to === s.to) return;
      s.to = to;
      s.el.style.transform = `translateY(${offsetFor(s, to)}px)`;
      layout(s);
      say(strings().reorderMoved(nameOf(s.el), to + 1, n));
    };

    return { lift, drop, step, follow, get: () => drag.current };
  });

  // Touch: once a row is lifted the page must not scroll under the finger.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const block = (e: TouchEvent): void => {
      const s = api.get();
      if (s && !s.viaKey) e.preventDefault();
    };
    root.addEventListener('touchmove', block, { passive: false });
    return () => root.removeEventListener('touchmove', block);
  }, [api]);

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>): void => {
    rest.onPointerDown?.(e);
    if (disabled || e.button !== 0 || api.get()) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-hj-drag-item]');
    if (!el || el.parentElement !== rootRef.current) return;
    const y = e.clientY;
    const id = e.pointerId;
    let timer = 0;
    const begin = (): void => {
      api.lift(el, false, y);
      try {
        el.setPointerCapture(id);
      } catch {
        // the pointer may already be gone
      }
    };
    const move = (ev: PointerEvent): void => {
      const s = api.get();
      if (s && !s.viaKey) {
        s.pointerY = ev.clientY;
        api.follow();
      } else if (Math.abs(ev.clientY - y) > SLOP) window.clearTimeout(timer);
    };
    const up = (): void => {
      window.clearTimeout(timer);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
      const s = api.get();
      if (s && !s.viaKey) api.drop(false);
    };
    if ((e.target as HTMLElement).closest('[data-hj-drag-handle]')) {
      e.preventDefault();
      begin();
    } else timer = window.setTimeout(begin, LONG_PRESS);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>): void => {
    rest.onKeyDown?.(e);
    const root = rootRef.current;
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-hj-drag-item]');
    if (!root || !el || el.parentElement !== root || e.target !== el) return;
    const s = api.get();
    if (!s) {
      const items = itemsOf(root);
      const i = items.indexOf(el);
      const focus = (n: number): void => {
        const next = items[n];
        if (!next) return;
        for (const item of items) item.tabIndex = item === next ? 0 : -1;
        next.focus();
      };
      if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
        e.preventDefault();
        api.lift(el, true, 0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        focus(i + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focus(i - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        focus(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        focus(items.length - 1);
      }
      return;
    }
    if (!s.viaKey) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      api.step(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      api.drop(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      api.drop(true);
    } else if (e.key === 'Tab') api.drop(true);
  };

  const element = useRender({
    render,
    ref: rootRef,
    defaultTagName: 'ul',
    props: {
      'aria-describedby': hintId,
      ...rest,
      'data-disabled': disabled ? '' : undefined,
      onPointerDown,
      onKeyDown,
      onContextMenu: (e: React.MouseEvent<HTMLUListElement>) => {
        rest.onContextMenu?.(e);
        if (api.get()) e.preventDefault();
      },
      className: cls(config, 'DragList.Root', 'hj-drag-list', className) as string | undefined,
      children,
    },
  });
  return (
    <>
      {element}
      <span id={hintId} style={VISUALLY_HIDDEN}>
        {config.strings.reorderHint}
      </span>
      <span style={VISUALLY_HIDDEN} aria-live="polite">
        {message}
      </span>
    </>
  );
}

export interface ItemOwnProps {
  /** What the announcements call this row, e.g. “Low Tide by Mira Okafor”. */
  label: string;
  render?: useRender.RenderProp;
}
export interface ItemProps extends ItemOwnProps, Omit<React.ComponentProps<'li'>, 'className'> {
  className?: string;
}

/** One row. Focusable (one row at a time is in the tab order); ↑↓ move focus between rows. */
export function Item(props: ItemProps): React.ReactElement {
  const [config, { label, render, className, ...rest }] = useSlot('DragList.Item', props);
  return useRender({
    render,
    defaultTagName: 'li',
    props: {
      tabIndex: -1,
      'aria-roledescription': config.strings.reorderable,
      'aria-label': label,
      ...rest,
      'data-hj-drag-item': '',
      className: cls(config, 'DragList.Item', 'hj-drag-list-item', className) as string | undefined,
    },
  });
}

export interface HandleProps extends Omit<React.ComponentProps<'span'>, 'className'> {
  className?: string;
}

/** The grip: pressing it lifts the row at once. Decorative to assistive tech — the row has the keyboard twin. */
export function Handle(props: HandleProps): React.ReactElement {
  const [config, { className, children, ...rest }] = useSlot('DragList.Handle', props);
  return (
    <span
      aria-hidden="true"
      {...rest}
      data-hj-drag-handle=""
      className={
        cls(config, 'DragList.Handle', 'hj-drag-list-handle', className) as string | undefined
      }
    >
      {children ?? (
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
          <circle cx="9" cy="6.5" r="1.5" />
          <circle cx="15" cy="6.5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="17.5" r="1.5" />
          <circle cx="15" cy="17.5" r="1.5" />
        </svg>
      )}
    </span>
  );
}
