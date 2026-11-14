'use client';
import * as React from 'react';

/** A time token (`180ms` or `.18s`) read from computed style, in ms. */
export function msVar(cs: CSSStyleDeclaration, name: string, fallback: number): number {
  const v = cs.getPropertyValue(name).trim();
  const n = v.endsWith('ms') ? Number.parseFloat(v) : Number.parseFloat(v) * 1000;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * FLIP for a wrapping row (chips, attachments): when a child changes size or leaves, its
 * neighbours glide to their new place on the clamped snappy spring — `translate` only, never a
 * bounce. If the row gains or loses a line, its height glides with them so whatever sits below
 * follows instead of jumping. Layout positions come from offsetLeft/Top, which ignore running
 * transforms.
 *
 * @param attributes Child attributes whose change may move the row (e.g. `data-leaving`).
 */
export function useFlip(
  ref: React.RefObject<HTMLElement | null>,
  attributes: readonly string[] = [],
): void {
  const filter = attributes.join(' ');
  React.useLayoutEffect(() => {
    const host = ref.current;
    if (!host || typeof MutationObserver === 'undefined') return undefined;
    let places = new Map<Element, { x: number; y: number }>();
    let height = host.offsetHeight;
    let grow: Animation | null = null;
    const snapshot = (): void => {
      height = host.offsetHeight;
      places = new Map();
      for (const c of host.children) {
        if (c instanceof HTMLElement) places.set(c, { x: c.offsetLeft, y: c.offsetTop });
      }
    };
    snapshot();
    const mo = new MutationObserver(() => {
      const cs = getComputedStyle(host);
      const duration = msVar(cs, '--hj-dur-snappy-settle', 180);
      const easing = cs.getPropertyValue('--hj-ease-snappy-settle').trim() || 'ease-out';
      for (const c of host.children) {
        if (!(c instanceof HTMLElement) || typeof c.animate !== 'function') continue;
        const before = places.get(c);
        if (!before) continue;
        const dx = before.x - c.offsetLeft;
        const dy = before.y - c.offsetTop;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
        c.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0px 0px' }], {
          duration,
          easing,
        });
      }
      grow?.cancel();
      const next = host.offsetHeight;
      if (Math.abs(next - height) >= 0.5 && typeof host.animate === 'function') {
        grow = host.animate([{ height: `${height}px` }, { height: `${next}px` }], {
          duration,
          easing,
        });
      }
      snapshot();
    });
    mo.observe(host, {
      childList: true,
      subtree: filter !== '',
      ...(filter ? { attributes: true, attributeFilter: filter.split(' ') } : {}),
    });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(snapshot);
    ro?.observe(host);
    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  }, [ref, filter]);
}
