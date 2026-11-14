'use client';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { useHanjiConfig } from '../../system/config.tsx';
import { prefersReducedMotion } from '../../system/motion.ts';
import { cls, withDefaults } from '../../system/slot.ts';

/** Vertical travel of a changing digit, as a fraction of the line (hanji COUNTER_TRAVEL). */
const TRAVEL = 0.55;
/** Delay between neighbouring digits, ones first (hanji stagger step). */
const STEP_MS = 24;

const numeric = (s: string): number => Number.parseFloat(s.replace(/[^\d.-]/g, '')) || 0;

function readMs(style: CSSStyleDeclaration, name: string, fallback: number): number {
  const v = style.getPropertyValue(name).trim();
  if (!v) return fallback;
  return v.endsWith('ms') ? Number.parseFloat(v) : Number.parseFloat(v) * 1000;
}

/**
 * Roll `el` from its current text to `next`. Only characters that change move: the old glyph
 * leaves by .55 of a line, the new one arrives from the other side, ones first, 24 ms apart.
 * Direction follows the number (up when it grows). Under reduced motion it is a fade.
 * Imperative on purpose: a ticking counter costs no React renders.
 */
export function rollDigits(el: HTMLElement, next: string, prev: string | undefined): void {
  const first = prev === undefined;
  let cells = Array.from(el.children) as HTMLElement[];
  if (first) {
    el.textContent = '';
    cells = [];
  }
  while (cells.length < next.length) {
    const c = document.createElement('span');
    c.style.position = 'relative';
    c.style.display = 'inline-block';
    el.prepend(c);
    cells.unshift(c);
  }
  while (cells.length > next.length) cells.shift()?.remove();

  const reduced = prefersReducedMotion(el);
  const style = getComputedStyle(el);
  const ease = reduced
    ? 'cubic-bezier(.33,1,.68,1)'
    : style.getPropertyValue('--hj-ease-gentle-settle').trim() || 'cubic-bezier(.33,1,.68,1)';
  const dur = reduced ? 160 : readMs(style, '--hj-dur-gentle-settle', 320);
  const out = Math.min(180, dur);
  const travel = reduced ? 0 : TRAVEL;
  const dir = first || numeric(next) >= numeric(prev ?? '') ? 1 : -1;

  let k = 0;
  for (let i = next.length - 1; i >= 0; i--) {
    const cell = cells[i];
    const ch = next[i] ?? '';
    if (!cell || cell.dataset.ch === ch) continue;
    cell.dataset.ch = ch;
    // a stale exit never outlives the next change
    for (const o of cell.querySelectorAll('[data-out]')) o.remove();
    const old = cell.firstElementChild as HTMLElement | null;
    const glyph = document.createElement('span');
    glyph.style.display = 'inline-block';
    glyph.textContent = ch;
    if (first || !old || typeof glyph.animate !== 'function') {
      old?.remove();
      cell.append(glyph);
      continue;
    }
    const delay = k++ * (reduced ? 0 : STEP_MS);
    old.dataset.out = '';
    old.style.position = 'absolute';
    old.style.left = '0';
    old.style.top = '0';
    cell.append(glyph);
    glyph.animate(
      [
        { transform: `translateY(${TRAVEL * dir * (travel ? 1 : 0)}em)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: dur, easing: ease, delay, fill: 'backwards' },
    );
    const exit = old.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: `translateY(${-TRAVEL * dir * (travel ? 1 : 0)}em)`, opacity: 0 },
      ],
      { duration: out, easing: 'cubic-bezier(.33,1,.68,1)', delay, fill: 'forwards' },
    );
    const drop = (): void => old.remove();
    exit.finished.then(drop, drop);
    // hidden tabs never resolve `finished`
    window.setTimeout(drop, delay + out + 200);
  }
}

/**
 * Keep `ref`'s element rolling to `text`. On mount it paints `from` (when given) then rolls to
 * `text`; afterwards every change rolls.
 */
export function useDigitRoll(
  ref: React.RefObject<HTMLElement | null>,
  text: string,
  from?: string,
): void {
  const prev = React.useRef<string | undefined>(undefined);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prev.current === text) return undefined;
    if (prev.current === undefined) {
      const start = from ?? text;
      rollDigits(el, start, undefined);
      prev.current = start;
      if (start !== text) {
        const raf = requestAnimationFrame(() => {
          rollDigits(el, text, start);
          prev.current = text;
        });
        return () => cancelAnimationFrame(raf);
      }
      return undefined;
    }
    rollDigits(el, text, prev.current);
    prev.current = text;
    return undefined;
  }, [ref, text, from]);
}

const formatters = new Map<string, Intl.NumberFormat>();
/** Cached Intl.NumberFormat: a ticking counter never rebuilds its formatter. */
export function formatNumber(
  value: number,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
): string {
  const key = `${String(locale ?? '')}|${options ? JSON.stringify(options) : ''}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    formatters.set(key, f);
  }
  return f.format(value);
}

/** Props hanji's Counter adds. */
export interface CounterOwnProps {
  /** The number (formatted with `format`/`locale`) or a preformatted string such as `'02:47'`. */
  value: number | string;
  /** `Intl.NumberFormat` options when `value` is a number. */
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  /** Roll in from this value on mount — `0` gives a count-up. */
  from?: number | string;
  /** Type role. `inherit` takes the surrounding font. */
  size?: 'hero' | 'display' | 'title' | 'body' | 'inherit';
}

export interface CounterProps
  extends CounterOwnProps, Omit<React.ComponentProps<'span'>, 'children'> {
  render?: useRender.RenderProp;
}

/**
 * A number whose changed digits roll — the 9 in 1,289 → 1,290 moves, the 1,2 stay put.
 * Tabular, so nothing shuffles sideways. Screen readers get the whole value as text.
 *
 * @example <Counter value={plays} /> · <Counter value={0.284} format={{ style: 'percent' }} from={0} />
 */
export function Counter(props: CounterProps): React.ReactElement {
  const config = useHanjiConfig();
  const {
    value,
    format,
    locale,
    from,
    size = 'inherit',
    className,
    render,
    ...rest
  } = withDefaults(config, 'Counter', props);
  const text = typeof value === 'number' ? formatNumber(value, locale, format) : value;
  const fromText =
    from === undefined
      ? undefined
      : typeof from === 'number'
        ? formatNumber(from, locale, format)
        : from;
  // Rendered once; the roll owns these children afterwards, so React never re-renders them.
  const [initial] = React.useState(() => fromText ?? text);
  const rollRef = React.useRef<HTMLSpanElement>(null);
  useDigitRoll(rollRef, text, fromText);
  const styled = !config.unstyled;
  return useRender({
    render,
    defaultTagName: 'span',
    props: {
      ...rest,
      'data-size': size,
      className: cls(config, 'Counter', 'hj-counter', className) as string | undefined,
      children: (
        <>
          <span className="hj-sr-only">{text}</span>
          <span ref={rollRef} aria-hidden="true" className={styled ? 'hj-counter-roll' : undefined}>
            {initial}
          </span>
        </>
      ),
    },
  });
}
